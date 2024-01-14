module.exports = {
  excludes: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
  featureFlags: {
    enable_relay_resolver_transform: true,
  },
  language: "typescript",
  schema: "./app/graphql/schema.graphql",
  src: "./app",
};
