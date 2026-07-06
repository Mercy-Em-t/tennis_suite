import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project slugs (fill in from sentry.io)
  org: process.env.SENTRY_ORG || "tennis-suite",
  project: process.env.SENTRY_PROJECT || "tennis-suite-nextjs",

  // Only upload source maps in CI/production to keep dev builds fast
  silent: !process.env.CI,

  // Automatically annotate React components with Sentry data
  reactComponentAnnotation: {
    enabled: true,
  },

  // Disable the Sentry telemetry tunnel in dev to avoid noise
  tunnelRoute: "/monitoring",

  // Hide source maps from the browser bundle
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically tree-shake Sentry logger statements in production
  disableLogger: true,
});
