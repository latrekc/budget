module.exports = {
  productionBrowserSourceMaps: true,
  compiler: {
    relay: {
      // This should match relay.config.js
      src: "./app",
      language: "typescript",
      schema: "./app/graphql/schema.graphql",
      excludes: [
        "**/node_modules/**",
        "**/__mocks__/**",
        "**/__generated__/**",
      ],
    },
  },
};
