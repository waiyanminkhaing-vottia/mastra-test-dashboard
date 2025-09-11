import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    plugins: {
      prettier: (await import("eslint-plugin-prettier")).default,
      "simple-import-sort": (await import("eslint-plugin-simple-import-sort")).default,
      "unused-imports": (await import("eslint-plugin-unused-imports")).default,
      import: (await import("eslint-plugin-import")).default,
    },
    rules: {
      "prettier/prettier": "error",
      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Remove unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { 
          vars: "all", 
          varsIgnorePattern: "^_", 
          args: "after-used", 
          argsIgnorePattern: "^_" 
        }
      ],
      // Import rules
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".turbo/**",
      "coverage/**",
      "*.log",
    ],
  },
];

export default eslintConfig;
