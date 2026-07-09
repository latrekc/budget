module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/transactions",
        permanent: false,
      },
    ];
  },
  compiler: {
    relay: {
      excludes: [
        "**/node_modules/**",
        "**/__mocks__/**",
        "**/__generated__/**",
      ],
      language: "typescript",
      schema: "./app/graphql/schema.graphql",
      // This should match relay.config.js
      src: "./app",
    },
  },
  // Browser source maps roughly double the peak memory of the client-bundle
  // serialization step. They're useful for debugging a real deployment but
  // pointless for the e2e build, which sets E2E_LEAN_BUILD=1 to stay under the
  // CI memory cap (the OOM killer SIGKILLs `next build` otherwise).
  productionBrowserSourceMaps: process.env.E2E_LEAN_BUILD !== "1",
};
