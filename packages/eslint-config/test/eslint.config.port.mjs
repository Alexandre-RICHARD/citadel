/*
  Infos
  On utilise pas "eslint-config-next" qui est trop contraignant sur les version à utilise. On réimplémente à la main ce que cela implémentait

  Package nécessaire (les versions sont cohérentes entre elles)
    "@eslint/js": "^9.39.5",
    "@next/eslint-plugin-next": "^16.3.2",
    "@vitest/eslint-plugin": "^1.6.27",
    "eslint": "^9.20.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-promise": "^7.3.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-simple-import-sort": "^14.0.0",
    "prettier": "^3.9.6",
    "typescript-eslint": "^8.67.0",
*/

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from 'typescript-eslint';
import globals from "globals";

import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import pluginPromise from "eslint-plugin-promise";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import vitest from '@vitest/eslint-plugin'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  globalIgnores([
    ".next/**",
    ".cache/**",
    "dist/**",
    "next-env.d.ts",
    "node_modules/**",
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
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  pluginPromise.configs['flat/recommended'],

  // Main config
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
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
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'simple-import-sort': simpleImportSort,
      vitest,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // JS rules
      "no-alert": "warn",
      "no-console": "warn",
      // We allow to reassign acc in reduce
      "no-param-reassign": [
        "error",
        {
          "props": true,
          "ignorePropertyModificationsFor": [
            "acc",
          ]
        }
      ],
      "no-constant-condition": ["error", { "checkLoops": "all" }],
      "no-await-in-loop": "error",
      "consistent-return": "error",
      "no-void": ["error", { "allowAsStatement": true }],

      // React
      "react/no-danger": "error",
      "react/no-array-index-key": "error",
      "react/jsx-props-no-spreading": ["error", {
        "exceptions": [],
      }],
      // All of following rules should be temporary and fixes
      // =======================
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/preserve-manual-memoization": "off",
      // =======================

      // Typescript
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { "prefer": "type-imports", "fixStyle": "inline-type-imports" }
      ],

      "no-unused-vars": "off",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error", {
        "functions": false,
        "classes": true,
        "variables": true,
        "allowNamedExports": false,
        "enums": true,
        "typedefs": true,
        "ignoreTypeReferences": true
      }],

      // Promises & Imports
      "promise/catch-or-return": ["error", { "allowFinally": true }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  // Override
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
  // We want to work with zustand reducer without return (mutable state)
  {
    files: [
      "src/store/utils/**",
      "src/feature/auth/connectedUser/connectedUser.slice.ts",
      "src/feature/notification/notification.slice.ts"
    ],
    rules: {
      "no-param-reassign": [
        "error",
        {
          "props": true,
          "ignorePropertyModificationsFor": [
            "state",
          ]
        }
      ],
    }
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
    files: [
      "src/react/component/organism/node/NodeForm/mapper/toFormValues.mapper.test.ts",
    ],
    rules: {
      "vitest/no-conditional-expect": "off",
    }
  },
  {
    files: ["src/common/helper/log/appropriateLog.ts"],
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["src/feature/auth/keycloak/initializeKeycloak.ts"],
    rules: {
      "no-param-reassign": "off",
    },
  },
  {
    files: ["src/components/organisms/Table/index.tsx"],
    rules: {
      "react/no-array-index-key": "off",
    },
  },

  // Prettier (doit être à la fin)
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          "trailingComma": "es5",
          "tabWidth": 2,
          "semi": true,
          "singleQuote": true,
          "bracketSpacing": true,
          "bracketSameLine": false,
          "endOfLine": "auto",
          "quoteProps": "consistent",
        },
      ],
    },
  },
]);
