import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Allow HMR from both IPv4 localhost and IPv6 [::1] loopback
  // Fixes: "Blocked cross-origin request to /_next/webpack-hmr from [::1]"
  allowedDevOrigins: ["localhost", "[::1]"],

  experimental: {
    // Enables Turbopack's filesystem cache for faster incremental dev builds.
    // The "Slow filesystem" warning is cosmetic — actual compile times improved.
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: false,
  },
};


// Skip Sentry wrapping entirely in dev — Turbopack ignores all webpack-based
// Sentry options anyway, so wrapping in dev only adds startup overhead with no benefit.
if (isDev) {
  module.exports = nextConfig;
} else {
  module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG || "tennis-suite",
    project: process.env.SENTRY_PROJECT || "tennis-suite-nextjs",

    // Only upload source maps in CI/production
    silent: !process.env.CI,

    // Updated API: replaces deprecated reactComponentAnnotation
    webpack: {
      reactComponentAnnotation: {
        enabled: true,
      },
      // Updated API: replaces deprecated disableLogger
      treeshake: {
        removeDebugLogging: true,
      },
    },

    // Tunnel Sentry events through Next.js to avoid ad-blockers
    tunnelRoute: "/monitoring",

    // Hide source maps from the browser bundle
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
  });
}
