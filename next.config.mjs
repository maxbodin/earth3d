/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag|svg)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"]
    });

    return config;
  }
};

export default nextConfig;
