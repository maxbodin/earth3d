/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: false,
   transpilePackages: ['world-geojson'],
   experimental: {
      turbopackMinify: true,
   },
   turbopack: {
      resolveAlias: {
         fs: {
            browser: './lib/emptyModule.ts',
         },
         document: {
            browser: './lib/emptyModule.ts',
         },
      },
   },
   webpack: (config, { isServer }) => {
      if (!isServer) {
         config.resolve = config.resolve || {}
         config.resolve.fallback = {
            ...(config.resolve.fallback || {}),
            fs: false,
            document: false,
         }
      }

      return config
   },
}

export default nextConfig
