const js = require("@eslint/js");
const importX = require("eslint-plugin-import-x");
const perfectionist = require("eslint-plugin-perfectionist");
const prettier = require("eslint-plugin-prettier");
const nextPlugin = require("@next/eslint-plugin-next");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const relayPlugin = require("eslint-plugin-relay");
const pluginJest = require("eslint-plugin-jest");

module.exports = [
  // Base configuration for all files
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        browser: true,
        es2021: true,
        node: true,
        React: "readonly",
      },
    },
    plugins: {
      "import-x": importX,
      perfectionist,
      prettier,
      "@next/next": nextPlugin,
    },
    rules: {
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "no-undef": "off", // TypeScript handles this
    },
  },
  // Next.js specific
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  // TypeScript and React files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "import-x": importX,
      perfectionist,
      prettier,
      "react-hooks": reactHooksPlugin,
      relay: relayPlugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...relayPlugin.configs.recommended.rules,
      ...importX.configs.recommended.rules,
      ...importX.configs.typescript.rules,
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
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "react/react-in-jsx-scope": "off",
      "relay/generated-flow-types": "off",
      "no-undef": "off",
    },
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import-x/resolver": {
        node: true,
        typescript: true,
      },
      react: {
        version: "detect",
      },
    },
  },
  // Prettier config (should be last)
  {
    rules: {
      ...prettier.configs.recommended.rules,
    },
  },
  // jest
  {
    files: ["**/*.spec.js", "**/*.test.js", "**/*.test.ts", "**/*.test.tsx"],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
  // Ignore patterns
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "coverage/**",
      "app/graphql/schema.graphql",
    ],
  },
];
