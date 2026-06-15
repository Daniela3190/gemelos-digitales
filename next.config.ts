import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Vercel's output file tracer to bundle all data JSONs
  // for the dynamic /gemelo/[id] serverless function.
  // Without this, readFileSync fails at runtime because Vercel
  // can't statically determine which files a dynamic path needs.
  outputFileTracingIncludes: {
    "/gemelo/[id]": ["./public/data/**/*"],
  },
};

export default nextConfig;
