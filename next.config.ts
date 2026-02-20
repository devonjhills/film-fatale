import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/vi/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
    ];
  },

  // Performance optimizations
  // removed lucide-react and @radix-ui/react-icons from optimizePackageImports

  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    resolveAlias: {
      "@": "./src",
    },
  },

  // Bundle analyzer for production (Webpack only)
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack optimizations in production builds
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 10,
          chunks: "all",
        },
        common: {
          name: "common",
          minChunks: 2,
          priority: 5,
          chunks: "all",
          enforce: true,
        },
      };
    }

    return config;
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Power Preference for performance
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
