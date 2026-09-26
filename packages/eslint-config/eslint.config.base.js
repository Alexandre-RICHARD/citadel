/*
  Package nécessaire (les versions sont cohérentes entre elles)
    "@eslint/js": "^9.39.5",
    "@vitest/eslint-plugin": "^1.6.27",
    "eslint": "^9.39.5",
    "eslint-config-prettier": "^10.1.8",
    "eslint-import-resolver-alias": "^1.1.2",
    "eslint-plugin-import-x": "^4.17.1",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-promise": "^7.3.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.5",
    "eslint-plugin-simple-import-sort": "^14.0.0",
    "prettier": "^3.9.6",
    "typescript-eslint": "^8.68.0",

    @stylistic TODO
    "@tanstack/eslint-plugin-query": "^5.91.2", // TODO
*/

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import globals from "globals";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import pluginPromise from "eslint-plugin-promise";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import vitest from "@vitest/eslint-plugin";
import { importX } from "eslint-plugin-import-x";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  globalIgnores([
    ".cache/**",
    "dist/**",
    "node_modules/**",
    "alex-specs/**",
    "src/reserve/**", // TODO
    "build/**",
    "report/**",
    "**/*.config.*",
    "src/infra/api/**",
    "scripts/**/*"
  ]),

  // TypeScript (Strict + Stylistique)
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Désactive le type-checking pour les fichiers JS/MJS/CJS de configuration
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },

  js.configs.recommended,
  importX.flatConfigs.recommended,
  pluginPromise.configs["flat/recommended"],

  // Main config
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      vitest,
    },
    settings: {
    //   settings: {
    //   'import-x/resolver': {
    //     typescript: true,
    //     node: true,
    //   },
    // },
      // "import-x/resolver": {
      //   alias: {
      //     map: [
      //       ["@", path.resolve("./src")],
      //       ["@styles", path.resolve("./src/styles")],
      //     ],
      //     extensions: [".ts", ".tsx", ".json"],
      //   },
      //   node: {
      //     extensions: [".ts", ".tsx"],
      //   },
      // },
    },
    rules: {
      // JS rules
      "no-alert": "warn",
      "no-console": "warn",
      // We allow to reassign acc in reduce
      "no-param-reassign": [
        "error",
        {
          props: true,
          ignorePropertyModificationsFor: ["acc"],
        },
      ],
      "no-constant-condition": ["error", { checkLoops: "all" }],
      "no-await-in-loop": "error",
      "consistent-return": "error",
      "no-void": ["error", { allowAsStatement: true }],

      // Typescript
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error", {
        "functions": true,
        "classes": true,
        "variables": true,
        "allowNamedExports": true,
        "enums": true,
        "typedefs": true,
        "ignoreTypeReferences": true
      }],

      // Promises & Imports
      "promise/catch-or-return": ["error", { "allowFinally": true }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Imports
      "import-x/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "always",
          tsx: "always",
          js: "always",
          jsx: "always",
        },
      ],
      "import-x/no-extraneous-dependencies": "error",
      "import-x/no-default-export": "error",
      "import-x/first": "error",
      "import-x/no-dynamic-require": "warn",
      "import-x/no-nodejs-modules": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/alex-specs/**"],
              message: "Should import only from @specs",
            },
          ],
        },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },

  // Override
  {
    files: ["vite.config.ts"],
    rules: {
      "import-x/no-nodejs-modules": "off",
    },
  },
  {
    files: ["vitest-setup.ts"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  {
    files: [
      "src/middleware.ts",
      "src/infra/config/configApi.ts"
    ],
    rules: {
      "no-param-reassign": "off",
    }
  },
  {
    files: ["src/vite-env.d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  // Configuration isolée pour VITEST
  {
    files: [
      "__tests__/**/*",
      "**/*.mock.ts",
      "**/*.mock.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "vitest*"
    ],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-empty-function": "off",
      "promise/always-return": "off",
      "promise/catch-or-return": "off"
    }
  },
  {
    files: ["vite.config.ts", "vitest.config.ts"],
    rules: {
      "import-x/no-default-export": "off",
    },
  },

  // Prettier (doit être à la fin)
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          trailingComma: "all",
          printWidth: 80,
          useTabs: true,
          tabWidth: 2,
          semi: true,
          singleQuote: false,
          jsxSingleQuote: false,
          bracketSpacing: true,
          bracketSameLine: false,
          endOfLine: "auto",
          quoteProps: "consistent",
          arrowParens: "always",
          singleAttributePerLine: true,
        },
      ],
    },
  },
]);
