import { createServer } from 'node:http'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

async function importOpenSkyService(): Promise<typeof import('@/app/server/services/openSkyService')> {
   const tempDirectory = await mkdtemp(join(tmpdir(), 'opensky-service-'))
   const serverOnlyStubPath = join(tempDirectory, 'server-only.cjs')
   await writeFile(serverOnlyStubPath, 'module.exports = {}\n', 'utf8')

   const moduleBuiltin = require('module') as {
      _resolveFilename: (...args: unknown[]) => string
   }
   const originalResolveFilename = moduleBuiltin._resolveFilename

   moduleBuiltin._resolveFilename = function patchedResolveFilename(
      request: string,
      parent: unknown,
      isMain: boolean,
      options: unknown,
   ): string {
      if (request === 'server-only') {
         return serverOnlyStubPath
      }

      return originalResolveFilename.call(this, request, parent, isMain, options)
   }

   try {
      return require('@/app/server/services/openSkyService') as typeof import('@/app/server/services/openSkyService')
   } finally {
      moduleBuiltin._resolveFilename = originalResolveFilename
      await rm(tempDirectory, { recursive: true, force: true })
   }
}

test.describe('OpenSky service fallback', () => {
   test('returns a cached fallback when OpenSky hangs', async () => {
      test.setTimeout(20_000)

      const previousBaseUrl = process.env.OPENSKY_API_BASE_URL
      const previousClientId = process.env.OPENSKY_CLIENT_ID
      const previousClientSecret = process.env.OPENSKY_CLIENT_SECRET
      let requestCount = 0

      const server = createServer(() => {
         requestCount += 1
      })

      server.listen(0, '127.0.0.1')
      await once(server, 'listening')

      const address = server.address()
      if (address == null || typeof address === 'string') {
         throw new Error('Unable to determine the local OpenSky test server port.')
      }

      const originalEnv = {
         OPENSKY_API_BASE_URL: previousBaseUrl,
         OPENSKY_CLIENT_ID: previousClientId,
         OPENSKY_CLIENT_SECRET: previousClientSecret,
      }

      const uniqueBBox = {
         lamin: 12.3456,
         lomin: 45.6789,
         lamax: 13.3456,
         lomax: 46.6789,
      }

      try {
         process.env.OPENSKY_API_BASE_URL = `http://127.0.0.1:${address.port}`
         delete process.env.OPENSKY_CLIENT_ID
         delete process.env.OPENSKY_CLIENT_SECRET

         const { getOpenSkyStates } = await importOpenSkyService()

         const firstStart = Date.now()
         const firstResult = await getOpenSkyStates({
            bbox: uniqueBBox,
            extended: true,
         })
         const firstDuration = Date.now() - firstStart

         expect(firstResult.source).toBe('fallback')
         expect(firstResult.response.states).toEqual([])
         expect(firstResult.remainingTokens).toBeNull()
         expect(firstDuration).toBeLessThan(8_000)
         expect(requestCount).toBe(1)

         const cachedStart = Date.now()
         const cachedResult = await getOpenSkyStates({
            bbox: uniqueBBox,
            extended: true,
         })
         const cachedDuration = Date.now() - cachedStart

         expect(cachedResult.source).toBe('cache')
         expect(cachedResult.response.states).toEqual([])
         expect(cachedDuration).toBeLessThan(250)
         expect(requestCount).toBe(1)
      } finally {
         process.env.OPENSKY_API_BASE_URL = originalEnv.OPENSKY_API_BASE_URL

         if (originalEnv.OPENSKY_CLIENT_ID == null) {
            delete process.env.OPENSKY_CLIENT_ID
         } else {
            process.env.OPENSKY_CLIENT_ID = originalEnv.OPENSKY_CLIENT_ID
         }

         if (originalEnv.OPENSKY_CLIENT_SECRET == null) {
            delete process.env.OPENSKY_CLIENT_SECRET
         } else {
            process.env.OPENSKY_CLIENT_SECRET = originalEnv.OPENSKY_CLIENT_SECRET
         }

         await new Promise<void>((resolve, reject) => {
            server.close((error) => {
               if (error != null) {
                  reject(error)
                  return
               }

               resolve()
            })
         })
      }
   })
})
