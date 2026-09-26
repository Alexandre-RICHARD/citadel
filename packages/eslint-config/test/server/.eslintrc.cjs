const projectsName = ["errorLog", "gameDeathCounter", "testing"];

const restrictedZones = projectsName.flatMap((targetProject) =>
  projectsName
    .filter((fromProject) => fromProject !== targetProject)
    .map((fromProject) => ({
      target: `src/projects/${targetProject}`,
      from: `src/projects/${fromProject}`,
      message: `Ce fichier appartenant au projet "${targetProject}" n'a pas le droit d'importer une ressource provenant du projet "${fromProject}".`,
    }))
);

module.exports = {
  ignorePatterns: [
    "node_modules",
    "report",
    "build",
    ".eslintrc.cjs",
    "esbuild.config.mjs",
    "vite.config.ts",
    "vitest.config.ts",
    "vitest.setup.ts",
    "alex-specs",
    // TODO Gérer le dossier todo
    "toDo"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:import/recommended",
    "airbnb-base",
    "airbnb-typescript",
    "plugin:vitest/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: [
    "@stylistic",
    "simple-import-sort",
    "@typescript-eslint",
    "promise",
    "import",
    "vitest"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.test.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {

    // Import rules
    "import/no-extraneous-dependencies": "off",
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",
    "import/first": "error",
    "import/no-unused-modules": ["warn", { "missingExports ": true, "unusedExports": true }],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/extensions": ["error", "ignorePackages"],
    "no-restricted-imports": ["error", {
      patterns: [
        {
          group: ["**/alex-specs/**"],
          message: "Should import only from @specs",
        },
      ],
    }],
    // Restricted import for Projects
    "import/no-restricted-paths": [
      "error",
      {
        zones: restrictedZones,
      },
    ],
  },
};
