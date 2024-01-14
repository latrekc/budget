module.exports = {
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
  productionBrowserSourceMaps: true,
};
