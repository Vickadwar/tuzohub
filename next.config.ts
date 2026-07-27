import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      { source: "/ussd/:path*", destination: "/api/ussd/:path*" },
      { source: "/ussd", destination: "/api/ussd" },
      { source: "/sms/:path*", destination: "/api/sms/:path*" },
      { source: "/sms", destination: "/api/sms" },
      { source: "/mpesa/:path*", destination: "/api/mpesa/:path*" },
      { source: "/mpesa", destination: "/api/mpesa" },
      { source: "/public/:path*", destination: "/api/public/:path*" },
      { source: "/public", destination: "/api/public" },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
    
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  
};

export default nextConfig;
