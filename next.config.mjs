/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: false,
   swcMinify: true,
   webpack: (config) => {
      config.resolve.fallback = { fs: false }
      config.resolve.fallback = { document: false }

      return config
   },
}

export default nextConfig
