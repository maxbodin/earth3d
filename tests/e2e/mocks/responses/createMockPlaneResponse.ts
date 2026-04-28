export function createMockPlaneResponse() {
   return {
      time: Math.floor(Date.now() / 1000),
      states: [
         [
            'abcd01', 'TEST001', 'France',
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000),
            2, 48, 10_000, false, 230, 90, 1, null, 10_200, null, false, 0, 3,
         ],
      ],
      meta: {
         source: 'live',
         fetchedAt: Date.now(),
         ttlMs: 30000,
         retryAfterSeconds: null,
         authenticated: false,
         remainingTokens: 392,
         requestCost: 1,
         normalizedBBox: { lamin: 47, lomin: 1, lamax: 49, lomax: 3 },
      },
   }
}