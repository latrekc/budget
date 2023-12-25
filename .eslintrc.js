/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:relay/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "relay"],
  root: true,
  overrides: [
    // typescript
    {
      files: ["*.ts", "*.tsx"],
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/member-delimiter-style": 0,
        "@typescript-eslint/interface-name-prefix": 0,
        "@typescript-eslint/no-use-before-define": 0,
        "react/prop-types": 0,
        "react/react-in-jsx-scope": 0,
        "relay/generated-flow-types": 0,
      },
    },

    // config files
    {
      files: ["*.js"],
      env: {
        node: true,
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};
