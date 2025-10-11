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
      "vue/require-typed-ref": "error",
      "vue/block-order": [
        "error",
        { order: ["script", "template", "style"] },
      ],
      "vue/first-attribute-linebreak": [
        "error",
        {
          singleline: "beside",
          multiline: "below",
        },
      ],
      // Enforce new line between each tag
      "vue/padding-line-between-tags": [
        "error",
        [{
          blankLine: "always",
          prev: "*",
          next: "*",
        }],
      ],
      "vue/singleline-html-element-content-newline": [
        "error",
        {
          ignoreWhenNoAttributes: true,
          ignoreWhenEmpty: true,
        },
      ],
      // Enforce PascalCase for component names
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        {
          registeredComponentsOnly: true,
          ignores: [],
        },
      ],

      // Enforce <script setup lang="ts"> on .vue files
      "vue/block-lang": [
        "error",
        { script: { lang: "ts" } },
      ],

      // Enforce <script setup> on .vue files
      "vue/component-api-style": [
        "error",
        ["script-setup"],
      ],

      // Enforce typed emits
      "vue/define-emits-declaration": ["error", "type-based"],

      // Enforce order of define macros
      "vue/define-macros-order": ["error", { order: ["defineProps", "defineEmits"] }],

      "vue/new-line-between-multi-line-property": ["error", { minLineOfMultilineProperty: 2 }],
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
