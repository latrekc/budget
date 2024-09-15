/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:json/recommended",
    "plugin:import/recommended",
    "plugin:perfectionist/recommended-natural",
    "plugin:prettier/recommended",
    "next/core-web-vitals",
  ],
  overrides: [
    {
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:perfectionist/recommended-natural",
        "plugin:prettier/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:relay/recommended",
      ],
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "tsconfig.json",
      },
      plugins: ["relay", "perfectionist"],
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            format: ["strictCamelCase"],
            leadingUnderscore: "allowSingleOrDouble",
            selector: "variableLike",
          },
          {
            format: ["strictCamelCase", "UPPER_CASE", "PascalCase"],
            modifiers: ["const"],
            selector: "variable",
          },
          {
            format: ["PascalCase"],
            selector: "enumMember",
          },
          {
            format: ["camelCase", "PascalCase"],
            selector: "function",
          },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            ignoreRestSiblings: true,
            varsIgnorePattern: "^_",
          },
        ],
        "perfectionist/sort-imports": 0,
        "perfectionist/sort-named-imports": 0,
        "react/prop-types": 1,
        "react/react-in-jsx-scope": 0,
        "relay/generated-flow-types": 0,
      },
      settings: {
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
          node: true,
          typescript: true,
        },
        react: {
          version: "detect",
        },
      },
    },
  ],
  plugins: ["import", "json", "relay", "perfectionist", "@next/next"],
  root: true,
  rules: {
    "perfectionist/sort-imports": 0,
    "perfectionist/sort-named-imports": 0,
  },
};
