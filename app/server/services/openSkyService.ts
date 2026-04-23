import 'server-only'
import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { OpenSkyStatesResponse } from '@/app/types/openSky/openSkyStatesResponse'
import { OpenSkyTrackResponse } from '@/app/types/openSky/openSkyTrackResponse'
import { OpenSkyTokenCache } from '@/app/types/openSky/openSkyTokenCache'
import { CacheEntry } from '@/app/types/cacheEntry'
import { OPEN_SKY_API_BASE_URL, OPEN_SKY_TOKEN_URL } from '@/app/constants/strings'
import { STATES_TTL_ANONYMOUS_MS, STATES_TTL_AUTHENTICATED_MS, TRACK_TTL_MS } from '@/app/constants/numbers'
import { getFreshCacheEntry } from '@/lib/cache/getFreshCacheEntry'
import { getStaleCacheEntry } from '@/lib/cache/getStaleCacheEntry'
import { toCacheEntry } from '@/lib/cache/toCacheEntry'
import { OpenSkyStatesRequestResult } from '@/app/types/openSky/openSkyStatesRequestResult'
import { normalizeBBox } from '@/lib/normalize/normalizeBBox'
import { normalizeTrack } from '@/lib/normalize/normalizeTrack'
import { normalizeStatesResponse } from '@/lib/normalize/normalizeStatesResponse'

const statesCache = new Map<string, CacheEntry<OpenSkyStatesResponse>>()

// TODO : refactor in constants.
const OPEN_SKY_REQUEST_TIMEOUT_MS = 5_000
const STATES_FALLBACK_TTL_MS = 60_000

const statesInFlight = new Map<string, Promise<OpenSkyStatesRequestResult>>()
const statesRemainingTokensCache = new Map<string, number | null>()

const trackCache = new Map<string, CacheEntry<OpenSkyTrackResponse | null>>()
const trackInFlight = new Map<string, Promise<OpenSkyTrackResponse | null>>()

const tokenCache: OpenSkyTokenCache = {
   token: null,
   expiresAt: 0,
}

function getOpenSkyApiBaseUrl(): string {
   return process.env.OPENSKY_API_BASE_URL?.trim() || OPEN_SKY_API_BASE_URL
}

function isOpenSkyTimeoutError(error: unknown): boolean {
   if (error == null || typeof error !== 'object') return false

   const candidate = error as {
      name?: unknown
      code?: unknown
      cause?: { code?: unknown } | null
   }

   return candidate.name === 'AbortError'
      || candidate.name === 'TimeoutError'
      || candidate.code === 'UND_ERR_CONNECT_TIMEOUT'
      || candidate.cause?.code === 'UND_ERR_CONNECT_TIMEOUT'
}

function createOpenSkyTimeoutError(authenticated: boolean): Error {
   return Object.assign(
      new Error(`OpenSky request timed out after ${OPEN_SKY_REQUEST_TIMEOUT_MS}ms.`),
      {
         retryAfterSeconds: null,
         authenticated,
         remainingTokens: null,
      },
   )
}

async function fetchOpenSkyWithTimeout(
   url: string,
   headers: HeadersInit,
   authenticated: boolean,
): Promise<Response> {
   const controller = new AbortController()
   const timeoutId = setTimeout(() => {
      controller.abort()
   }, OPEN_SKY_REQUEST_TIMEOUT_MS)

   try {
      return await fetch(url, {
         cache: 'no-store',
         headers,
         signal: controller.signal,
      })
   } catch (error) {
      if (isOpenSkyTimeoutError(error)) {
         throw createOpenSkyTimeoutError(authenticated)
      }

      throw error
   } finally {
      clearTimeout(timeoutId)
   }
}


function buildBboxCacheKey(bbox: OpenSkyBoundingBox, extended: boolean): string {
   return [
      bbox.lamin.toFixed(4),
      bbox.lomin.toFixed(4),
      bbox.lamax.toFixed(4),
      bbox.lomax.toFixed(4),
      extended ? 'extended' : 'regular',
   ].join(':')
}

function computeStatesRequestCost(normalizedBBox: OpenSkyBoundingBox): number {
   const latitudeSpan = normalizedBBox.lamax - normalizedBBox.lamin
   const longitudeSpan = normalizedBBox.lomax - normalizedBBox.lomin
   const area = latitudeSpan * longitudeSpan

   if (area <= 25) return 1
   if (area <= 100) return 2
   if (area <= 400) return 3
   return 4
}

async function getOpenSkyAccessToken(): Promise<string | null> {
   const clientId = process.env.OPENSKY_CLIENT_ID?.trim()
   const clientSecret = process.env.OPENSKY_CLIENT_SECRET?.trim()

   if (!clientId || !clientSecret) {
      return null
   }

   if (tokenCache.token != null && tokenCache.expiresAt > Date.now()) {
      return tokenCache.token
   }

   const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
   })

   const response = await fetch(OPEN_SKY_TOKEN_URL, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
   })

   if (!response.ok) {
      throw new Error(`OpenSky token request failed (${response.status}).`)
   }

   const tokenResponse = (await response.json()) as {
      access_token?: string
      expires_in?: number
   }

   if (typeof tokenResponse.access_token !== 'string') {
      throw new Error('OpenSky token response is missing an access token.')
   }

   const expiresInMs = Math.max((tokenResponse.expires_in ?? 1800) * 1000, 60_000)
   const refreshMarginMs = 30_000

   tokenCache.token = tokenResponse.access_token
   tokenCache.expiresAt = Date.now() + expiresInMs - refreshMarginMs

   return tokenCache.token
}

async function fetchOpenSky(
   url: string,
): Promise<{ response: Response; authenticated: boolean }> {
   const token = await getOpenSkyAccessToken()
   const headers: HeadersInit = {
      Accept: 'application/json',
      'User-Agent': 'flightradar3d/planes-proxy',
   }

   if (token != null) {
      headers.Authorization = `Bearer ${token}`
   }

   const response = await fetchOpenSkyWithTimeout(url, headers, token != null)

   if (response.status !== 401 || token == null) {
      return { response, authenticated: token != null }
   }

   tokenCache.token = null
   tokenCache.expiresAt = 0

   const refreshedToken = await getOpenSkyAccessToken()
   const retryHeaders: HeadersInit = {
      ...headers,
      Authorization: `Bearer ${refreshedToken}`,
   }

   const retryResponse = await fetchOpenSkyWithTimeout(url, retryHeaders, true)

   return { response: retryResponse, authenticated: true }
}

function readRetryAfterSeconds(response: Response): number | null {
   const retryAfterHeader = response.headers.get('x-rate-limit-retry-after-seconds')
   if (retryAfterHeader == null) return null

   const retryAfterSeconds = Number(retryAfterHeader)
   return Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0
      ? retryAfterSeconds
      : null
}

function readRemainingTokens(response: Response): number | null {
   const remainingTokensHeader = response.headers.get('x-rate-limit-remaining')
   if (remainingTokensHeader == null) return null

   const remainingTokens = Number(remainingTokensHeader)
   return Number.isFinite(remainingTokens) && remainingTokens >= 0
      ? remainingTokens
      : null
}

function extractRequestErrorMetadata(error: unknown): {
   retryAfterSeconds: number | null
   authenticated: boolean
   remainingTokens: number | null
} {
   const candidate = error as {
      retryAfterSeconds?: unknown
      authenticated?: unknown
      remainingTokens?: unknown
   }

   const retryAfterSeconds = typeof candidate?.retryAfterSeconds === 'number'
      ? (candidate.retryAfterSeconds ?? null)
      : null

   const remainingTokens = typeof candidate?.remainingTokens === 'number'
      ? (candidate.remainingTokens ?? null)
      : null

   return {
      retryAfterSeconds,
      authenticated: Boolean(candidate?.authenticated),
      remainingTokens,
   }
}

export async function getOpenSkyStates(options: {
   bbox?: Partial<OpenSkyBoundingBox> | null
   extended?: boolean
}): Promise<{
   response: OpenSkyStatesResponse
   source: 'live' | 'cache' | 'stale-cache' | 'fallback'
   fetchedAt: number
   ttlMs: number
   retryAfterSeconds: number | null
   authenticated: boolean
   remainingTokens: number | null
   requestCost: number
   normalizedBBox: OpenSkyBoundingBox
}> {
   const extended = options.extended ?? true
   const normalizedBBox = normalizeBBox(options.bbox)
   const cacheKey = buildBboxCacheKey(normalizedBBox, extended)

   const freshCacheEntry = getFreshCacheEntry(statesCache, cacheKey)
   if (freshCacheEntry != null) {
      return {
         response: freshCacheEntry.payload,
         source: 'cache',
         fetchedAt: freshCacheEntry.fetchedAt,
         ttlMs: freshCacheEntry.ttlMs,
         retryAfterSeconds: null,
         authenticated: false,
         remainingTokens: statesRemainingTokensCache.get(cacheKey) ?? null,
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   }

   const pendingRequest = statesInFlight.get(cacheKey)
   if (pendingRequest != null) {
      const pendingResponse = await pendingRequest
      const cacheEntry = statesCache.get(cacheKey)
      return {
         response: pendingResponse.response,
         source: 'cache',
         fetchedAt: cacheEntry?.fetchedAt ?? Date.now(),
         ttlMs: cacheEntry?.ttlMs ?? pendingResponse.ttlMs,
         retryAfterSeconds: null,
         authenticated: pendingResponse.authenticated,
         remainingTokens: pendingResponse.remainingTokens,
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   }

   const requestPromise = (async (): Promise<OpenSkyStatesRequestResult> => {
      const query = new URLSearchParams({
         lamin: normalizedBBox.lamin.toString(),
         lomin: normalizedBBox.lomin.toString(),
         lamax: normalizedBBox.lamax.toString(),
         lomax: normalizedBBox.lomax.toString(),
      })

      if (extended) {
         query.set('extended', '1')
      }

      const { response, authenticated } = await fetchOpenSky(
         `${getOpenSkyApiBaseUrl()}/states/all?${query.toString()}`,
      )

      if (!response.ok) {
         throw Object.assign(new Error(`OpenSky states request failed (${response.status}).`), {
            status: response.status,
            retryAfterSeconds: readRetryAfterSeconds(response),
            authenticated,
            remainingTokens: readRemainingTokens(response),
         })
      }

      const remainingTokens = readRemainingTokens(response)
      const payload = normalizeStatesResponse(await response.json())
      const ttlMs = authenticated
         ? STATES_TTL_AUTHENTICATED_MS
         : STATES_TTL_ANONYMOUS_MS

      statesCache.set(cacheKey, toCacheEntry(payload, ttlMs))
      statesRemainingTokensCache.set(cacheKey, remainingTokens)

      return {
         response: payload,
         authenticated,
         ttlMs,
         remainingTokens,
      }
   })()

   statesInFlight.set(cacheKey, requestPromise)

   try {
      const requestResult = await requestPromise
      const cacheEntry = statesCache.get(cacheKey)
      return {
         response: requestResult.response,
         source: 'live',
         fetchedAt: cacheEntry?.fetchedAt ?? Date.now(),
         ttlMs: cacheEntry?.ttlMs ?? requestResult.ttlMs,
         retryAfterSeconds: null,
         authenticated: requestResult.authenticated,
         remainingTokens: requestResult.remainingTokens,
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   } catch (error) {
      const requestErrorMetadata = extractRequestErrorMetadata(error)
      const staleCacheEntry = getStaleCacheEntry(statesCache, cacheKey)
      if (staleCacheEntry != null) {
         return {
            response: staleCacheEntry.payload,
            source: 'stale-cache',
            fetchedAt: staleCacheEntry.fetchedAt,
            ttlMs: staleCacheEntry.ttlMs,
            retryAfterSeconds: requestErrorMetadata.retryAfterSeconds,
            authenticated: requestErrorMetadata.authenticated,
            remainingTokens:
               requestErrorMetadata.remainingTokens
               ?? statesRemainingTokensCache.get(cacheKey)
               ?? null,
            requestCost: computeStatesRequestCost(normalizedBBox),
            normalizedBBox,
         }
      }

      const fallbackResponse: OpenSkyStatesResponse = {
         time: Math.floor(Date.now() / 1000),
         states: [],
      }
      const fallbackTtlMs = requestErrorMetadata.retryAfterSeconds != null
         ? Math.max(requestErrorMetadata.retryAfterSeconds * 1000, 5_000)
         : STATES_FALLBACK_TTL_MS

      statesCache.set(cacheKey, toCacheEntry(fallbackResponse, fallbackTtlMs))
      statesRemainingTokensCache.set(cacheKey, requestErrorMetadata.remainingTokens)

      return {
         response: fallbackResponse,
         source: 'fallback',
         fetchedAt: Date.now(),
         ttlMs: fallbackTtlMs,
         retryAfterSeconds: requestErrorMetadata.retryAfterSeconds,
         authenticated: requestErrorMetadata.authenticated,
         remainingTokens: requestErrorMetadata.remainingTokens,
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   } finally {
      statesInFlight.delete(cacheKey)
   }
}

export async function getOpenSkyTrack(options: {
   icao24: string
   time?: number
}): Promise<{
   track: OpenSkyTrackResponse | null
   source: 'live' | 'cache' | 'stale-cache'
   fetchedAt: number
   ttlMs: number
   retryAfterSeconds: number | null
   authenticated: boolean
}> {
   const normalizedIcao24 = options.icao24.trim().toLowerCase()
   const time = options.time ?? 0
   const cacheKey = `${normalizedIcao24}:${time}`

   const freshCacheEntry = getFreshCacheEntry(trackCache, cacheKey)
   if (freshCacheEntry != null) {
      return {
         track: freshCacheEntry.payload,
         source: 'cache',
         fetchedAt: freshCacheEntry.fetchedAt,
         ttlMs: freshCacheEntry.ttlMs,
         retryAfterSeconds: null,
         authenticated: false,
      }
   }

   const pendingRequest = trackInFlight.get(cacheKey)
   if (pendingRequest != null) {
      const track = await pendingRequest
      const cacheEntry = trackCache.get(cacheKey)
      return {
         track,
         source: 'cache',
         fetchedAt: cacheEntry?.fetchedAt ?? Date.now(),
         ttlMs: cacheEntry?.ttlMs ?? TRACK_TTL_MS,
         retryAfterSeconds: null,
         authenticated: false,
      }
   }

   const requestPromise = (async (): Promise<OpenSkyTrackResponse | null> => {
      const query = new URLSearchParams({
         icao24: normalizedIcao24,
         time: `${time}`,
      })

      const { response, authenticated } = await fetchOpenSky(
         `${getOpenSkyApiBaseUrl()}/tracks/all?${query.toString()}`,
      )

      if (!response.ok) {
         throw Object.assign(new Error(`OpenSky track request failed (${response.status}).`), {
            status: response.status,
            retryAfterSeconds: readRetryAfterSeconds(response),
            authenticated,
         })
      }

      const track = normalizeTrack(await response.json())
      trackCache.set(cacheKey, toCacheEntry(track, TRACK_TTL_MS))
      return track
   })()

   trackInFlight.set(cacheKey, requestPromise)

   try {
      const track = await requestPromise
      const cacheEntry = trackCache.get(cacheKey)
      return {
         track,
         source: 'live',
         fetchedAt: cacheEntry?.fetchedAt ?? Date.now(),
         ttlMs: cacheEntry?.ttlMs ?? TRACK_TTL_MS,
         retryAfterSeconds: null,
         authenticated: false,
      }
   } catch (error) {
      const staleCacheEntry = getStaleCacheEntry(trackCache, cacheKey)
      if (staleCacheEntry != null) {
         const requestErrorMetadata = extractRequestErrorMetadata(error)

         return {
            track: staleCacheEntry.payload,
            source: 'stale-cache',
            fetchedAt: staleCacheEntry.fetchedAt,
            ttlMs: staleCacheEntry.ttlMs,
            retryAfterSeconds: requestErrorMetadata.retryAfterSeconds,
            authenticated: requestErrorMetadata.authenticated,
         }
      }

      throw error
   } finally {
      trackInFlight.delete(cacheKey)
   }
}


// TODO : Refactor file in multiple smaller server actions files.