// @ts-check
import antfu from "@antfu/eslint-config";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  antfu({
    type: "app",
    vue: true,
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
    ignores: [".pnpm-store/**", "**/migrations/*", ".github/**"],
  }, {
    rules: {
      "vue/max-attributes-per-line": ["error", {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      }],
      "ts/no-redeclare": "off",
      "ts/consistent-type-definitions": ["off"],
      "no-console": ["warn"],
      "antfu/no-top-level-await": ["off"],
      "node/prefer-global/process": ["off"],
      "node/no-process-env": ["error"],
      "antfu/top-level-functions": ["off"],
      "perfectionist/sort-imports": ["error", {
        tsconfigRootDir: ".",
      }],
      "unicorn/filename-case": ["error", {
        case: "camelCase",
        ignore: ["README.md", "pnpm-workspace.yaml"],
      }],
    },
  }),
  {
    rules: {
      // Enforce <template> at top of file, then script, then style
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
    },
  },
);
