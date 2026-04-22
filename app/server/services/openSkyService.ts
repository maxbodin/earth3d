import 'server-only'
import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { OpenSkyStatesResponse } from '@/app/types/openSky/openSkyStatesResponse'
import { OpenSkyTrackResponse } from '@/app/types/openSky/openSkyTrackResponse'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { OpenSkyTokenCache } from '@/app/types/openSky/openSkyTokenCache'
import { CacheEntry } from '@/app/types/cacheEntry'
import { OPEN_SKY_API_BASE_URL, OPEN_SKY_TOKEN_URL } from '@/app/constants/strings'
import { parseNumber } from '@/lib/parse/parseNumber'
import { parseBoolean } from '@/lib/parse/parseBoolean'
import { parseSensors } from '@/lib/parse/parseSensors'
import { clamp } from '@/lib/clamp'
import { DEFAULT_BBOX, MAX_LATITUDE, MAX_LATITUDE_SPAN, MAX_LONGITUDE, MAX_LONGITUDE_SPAN, MIN_LATITUDE, MIN_LONGITUDE,
   STATES_TTL_ANONYMOUS_MS, STATES_TTL_AUTHENTICATED_MS, TRACK_TTL_MS
} from '@/app/constants/numbers'
import { getFreshCacheEntry } from '@/lib/cache/getFreshCacheEntry'
import { getStaleCacheEntry } from '@/lib/cache/getStaleCacheEntry'
import { toCacheEntry } from '@/lib/cache/toCacheEntry'

const statesCache = new Map<string, CacheEntry<OpenSkyStatesResponse>>()
const statesInFlight = new Map<string, Promise<OpenSkyStatesResponse>>()

const trackCache = new Map<string, CacheEntry<OpenSkyTrackResponse | null>>()
const trackInFlight = new Map<string, Promise<OpenSkyTrackResponse | null>>()

const tokenCache: OpenSkyTokenCache = {
   token: null,
   expiresAt: 0,
}

function nowMs(): number {
   return Date.now()
}

function normalizeTrack(rawTrack: unknown): OpenSkyTrackResponse | null {
   if (rawTrack == null || typeof rawTrack !== 'object') return null

   const candidate = rawTrack as Record<string, unknown>
   const icao24 =
      typeof candidate.icao24 === 'string'
         ? candidate.icao24.toLowerCase()
         : null

   const startTime = parseNumber(candidate.startTime)
   const endTime = parseNumber(candidate.endTime)

   if (icao24 == null || startTime == null || endTime == null) {
      return null
   }

   const path = Array.isArray(candidate.path)
      ? candidate.path
           .map((point): OpenSkyTrackResponse['path'][number] | null => {
              if (!Array.isArray(point)) return null

              const time = parseNumber(point[0])
              if (time == null) return null

              return [
                 time,
                 parseNumber(point[1]),
                 parseNumber(point[2]),
                 parseNumber(point[3]),
                 parseNumber(point[4]),
                 parseBoolean(point[5]),
              ]
           })
           .filter((point): point is OpenSkyTrackResponse['path'][number] => point != null)
      : []

   return {
      icao24,
      startTime,
      endTime,
      callsign: typeof candidate.callsign === 'string' ? candidate.callsign : null,
      path,
   }
}

function normalizeStateVector(rawState: unknown): OpenSkyStateVector | null {
   if (!Array.isArray(rawState) || rawState.length < 17) {
      return null
   }

   const icao24 =
      typeof rawState[0] === 'string'
         ? rawState[0].trim().toLowerCase()
         : null

   const originCountry =
      typeof rawState[2] === 'string'
         ? rawState[2].trim()
         : null

   if (icao24 == null || icao24.length === 0 || originCountry == null) {
      return null
   }

   const callsignRaw = rawState[1]
   const callsign =
      typeof callsignRaw === 'string' && callsignRaw.trim().length > 0
         ? callsignRaw.trim()
         : null

   return [
      icao24,
      callsign,
      originCountry,
      parseNumber(rawState[3]),
      parseNumber(rawState[4]),
      parseNumber(rawState[5]),
      parseNumber(rawState[6]),
      parseNumber(rawState[7]),
      parseBoolean(rawState[8]),
      parseNumber(rawState[9]),
      parseNumber(rawState[10]),
      parseNumber(rawState[11]),
      parseSensors(rawState[12]),
      parseNumber(rawState[13]),
      typeof rawState[14] === 'string' ? rawState[14] : null,
      parseBoolean(rawState[15]),
      parseNumber(rawState[16]),
      parseNumber(rawState[17]),
   ]
}

function normalizeStatesResponse(rawResponse: unknown): OpenSkyStatesResponse {
   const fallbackResponse: OpenSkyStatesResponse = {
      time: Math.floor(nowMs() / 1000),
      states: [],
   }

   if (rawResponse == null || typeof rawResponse !== 'object') {
      return fallbackResponse
   }

   const candidate = rawResponse as Record<string, unknown>
   const time = parseNumber(candidate.time)

   const states = Array.isArray(candidate.states)
      ? candidate.states
           .map((stateValue) => normalizeStateVector(stateValue))
           .filter((stateValue): stateValue is OpenSkyStateVector => stateValue != null)
      : []

   return {
      time: time ?? fallbackResponse.time,
      states,
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

function normalizeBBox(rawBBox: Partial<OpenSkyBoundingBox> | null | undefined): OpenSkyBoundingBox {
   const lamin = parseNumber(rawBBox?.lamin)
   const lomin = parseNumber(rawBBox?.lomin)
   const lamax = parseNumber(rawBBox?.lamax)
   const lomax = parseNumber(rawBBox?.lomax)

   if (lamin == null || lomin == null || lamax == null || lomax == null) {
      return DEFAULT_BBOX
   }

   const rawMinLat = clamp(Math.min(lamin, lamax), MIN_LATITUDE, MAX_LATITUDE)
   const rawMaxLat = clamp(Math.max(lamin, lamax), MIN_LATITUDE, MAX_LATITUDE)
   const rawMinLon = clamp(Math.min(lomin, lomax), MIN_LONGITUDE, MAX_LONGITUDE)
   const rawMaxLon = clamp(Math.max(lomin, lomax), MIN_LONGITUDE, MAX_LONGITUDE)

   const latitudeSpan = Math.max(rawMaxLat - rawMinLat, 0.1)
   const longitudeSpan = Math.max(rawMaxLon - rawMinLon, 0.1)

   const latitudeScale = Math.min(1, MAX_LATITUDE_SPAN / latitudeSpan)
   const longitudeScale = Math.min(1, MAX_LONGITUDE_SPAN / longitudeSpan)

   const scale = Math.min(latitudeScale, longitudeScale)

   if (scale >= 1) {
      return {
         lamin: rawMinLat,
         lomin: rawMinLon,
         lamax: rawMaxLat,
         lomax: rawMaxLon,
      }
   }

   const centerLat = (rawMinLat + rawMaxLat) / 2
   const centerLon = (rawMinLon + rawMaxLon) / 2

   const halfLatSpan = (latitudeSpan * scale) / 2
   const halfLonSpan = (longitudeSpan * scale) / 2

   return {
      lamin: clamp(centerLat - halfLatSpan, MIN_LATITUDE, MAX_LATITUDE),
      lomin: clamp(centerLon - halfLonSpan, MIN_LONGITUDE, MAX_LONGITUDE),
      lamax: clamp(centerLat + halfLatSpan, MIN_LATITUDE, MAX_LATITUDE),
      lomax: clamp(centerLon + halfLonSpan, MIN_LONGITUDE, MAX_LONGITUDE),
   }
}

async function getOpenSkyAccessToken(): Promise<string | null> {
   const clientId = process.env.OPENSKY_CLIENT_ID?.trim()
   const clientSecret = process.env.OPENSKY_CLIENT_SECRET?.trim()

   if (!clientId || !clientSecret) {
      return null
   }

   if (tokenCache.token != null && tokenCache.expiresAt > nowMs()) {
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
   tokenCache.expiresAt = nowMs() + expiresInMs - refreshMarginMs

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

   const response = await fetch(url, {
      cache: 'no-store',
      headers,
   })

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

   const retryResponse = await fetch(url, {
      cache: 'no-store',
      headers: retryHeaders,
   })

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

function extractRequestErrorMetadata(error: unknown): {
   retryAfterSeconds: number | null
   authenticated: boolean
} {
   const candidate = error as {
      retryAfterSeconds?: unknown
      authenticated?: unknown
   }

   const retryAfterSeconds = typeof candidate?.retryAfterSeconds === 'number'
      ? (candidate.retryAfterSeconds ?? null)
      : null

   return {
      retryAfterSeconds,
      authenticated: Boolean(candidate?.authenticated),
   }
}

export async function getOpenSkyStates(options: {
   bbox?: Partial<OpenSkyBoundingBox> | null
   extended?: boolean
}): Promise<{
   response: OpenSkyStatesResponse
   source: 'live' | 'cache' | 'stale-cache'
   fetchedAt: number
   ttlMs: number
   retryAfterSeconds: number | null
   authenticated: boolean
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
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   }

   const pendingRequest = statesInFlight.get(cacheKey)
   if (pendingRequest != null) {
      const response = await pendingRequest
      const cacheEntry = statesCache.get(cacheKey)
      return {
         response,
         source: 'cache',
         fetchedAt: cacheEntry?.fetchedAt ?? nowMs(),
         ttlMs: cacheEntry?.ttlMs ?? STATES_TTL_ANONYMOUS_MS,
         retryAfterSeconds: null,
         authenticated: false,
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   }

   const requestPromise = (async (): Promise<OpenSkyStatesResponse> => {
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
         `${OPEN_SKY_API_BASE_URL}/states/all?${query.toString()}`,
      )

      if (!response.ok) {
         throw Object.assign(new Error(`OpenSky states request failed (${response.status}).`), {
            status: response.status,
            retryAfterSeconds: readRetryAfterSeconds(response),
            authenticated,
         })
      }

      const payload = normalizeStatesResponse(await response.json())
      const ttlMs = authenticated
         ? STATES_TTL_AUTHENTICATED_MS
         : STATES_TTL_ANONYMOUS_MS

      statesCache.set(cacheKey, toCacheEntry(payload, ttlMs))

      return payload
   })()

   statesInFlight.set(cacheKey, requestPromise)

   try {
      const response = await requestPromise
      const cacheEntry = statesCache.get(cacheKey)
      return {
         response,
         source: 'live',
         fetchedAt: cacheEntry?.fetchedAt ?? nowMs(),
         ttlMs: cacheEntry?.ttlMs ?? STATES_TTL_ANONYMOUS_MS,
         retryAfterSeconds: null,
         authenticated: false,
         requestCost: computeStatesRequestCost(normalizedBBox),
         normalizedBBox,
      }
   } catch (error) {
      const staleCacheEntry = getStaleCacheEntry(statesCache, cacheKey)
      if (staleCacheEntry != null) {
         const requestErrorMetadata = extractRequestErrorMetadata(error)

         return {
            response: staleCacheEntry.payload,
            source: 'stale-cache',
            fetchedAt: staleCacheEntry.fetchedAt,
            ttlMs: staleCacheEntry.ttlMs,
            retryAfterSeconds: requestErrorMetadata.retryAfterSeconds,
            authenticated: requestErrorMetadata.authenticated,
            requestCost: computeStatesRequestCost(normalizedBBox),
            normalizedBBox,
         }
      }

      throw error
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
         fetchedAt: cacheEntry?.fetchedAt ?? nowMs(),
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
         `${OPEN_SKY_API_BASE_URL}/tracks/all?${query.toString()}`,
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
         fetchedAt: cacheEntry?.fetchedAt ?? nowMs(),
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