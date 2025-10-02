## Nuxt UI LLMs.txt Integration

Leverage Nuxt UI's LLMs.txt files to provide AI tools (Cursor, Windsurf, Copilot, ChatGPT, Claude, etc.) with structured, AI-optimized documentation for components, theming, and best practices.

### What is LLMs.txt?

LLMs.txt is a structured documentation format for large language models. Nuxt UI provides LLMs.txt files containing comprehensive, machine-readable information about the component library, APIs, usage patterns, and best practices.

### Available Routes

- **/llms.txt** — Structured overview of all components and documentation links (~5K tokens)
- **/llms-full.txt** — Full documentation with implementation, theming, composables, migration guides (~1M+ tokens)

### Choosing the Right File

- Most users should start with `/llms.txt` for essential info and compatibility with standard LLM context windows.
- Use `/llms-full.txt` only if your AI tool supports large contexts (200K+ tokens) and you need comprehensive details.

### Important Usage Notes

- The `@` symbol must be typed manually in some tools (e.g., Cursor, Windsurf) for context referencing—copy-pasting may break recognition.

### Usage with AI Tools

#### Cursor

- Reference LLMs.txt URLs directly in questions or add them to project context using `@docs`.
- See: [Cursor Web and Docs Search](https://docs.cursor.com/en/context/@-symbols/@-docs)

#### Windsurf

- Use `@docs` to reference LLMs.txt URLs or create persistent rules in your workspace.
- See: [Windsurf Web and Docs Search](https://docs.windsurf.com/windsurf/cascade/web-search)

#### Other AI Tools (ChatGPT, Claude, etc.)

- Mention the LLMs.txt URLs in your queries for Nuxt UI guidance:
  - "Using Nuxt UI documentation from https://ui.nuxt.com/llms.txt"
  - "Follow complete Nuxt UI guidelines from https://ui.nuxt.com/llms-full.txt"

## Nuxt UI V4 MCP Server Integration

Use the latest Nuxt UI V4 MCP server to enable AI assistants (Copilot, Claude, Cursor, Windsurf, etc.) to access up-to-date Nuxt UI component, composable, and template information.

### What is MCP?

MCP (Model Context Protocol) is a standard for exposing structured project data to AI tools. The Nuxt UI MCP server provides endpoints for components, composables, examples, templates, and docs, making it easier for AI to assist with Nuxt UI development.

### Key MCP Resources

- `resource://nuxt-ui/components` — All components with categories
- `resource://nuxt-ui/composables` — All composables
- `resource://nuxt-ui/examples` — Code examples
- `resource://nuxt-ui/templates` — Project templates
- `resource://nuxt-ui/documentation-pages` — Documentation pages

### Core MCP Tools

- `list_components`, `get_component`, `get_component_metadata`, `search_components_by_category`
- `list_composables`, `list_templates`, `get_template`, `list_examples`, `get_example`
- `get_migration_guide`, `list_documentation_pages`, `get_documentation_page`

### Guided Prompts

- `find_component_for_usecase`, `implement_component_with_props`, `setup_project_with_template`

### Configuration Instructions

#### General

- Always use the latest MCP server URL: `https://ui.nuxt.com/mcp`
- No authentication required for public endpoints

#### VS Code

1. Ensure GitHub Copilot and Copilot Chat extensions are installed
2. In `.vscode/mcp.json`:
   ```json
   {
     "servers": {
       "nuxt-ui": {
         "type": "http",
         "url": "https://ui.nuxt.com/mcp"
       }
     }
   }
   ```

#### Cursor

1. Use the quick install link or add to `.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "nuxt-ui": {
         "type": "http",
         "url": "https://ui.nuxt.com/mcp"
       }
     }
   }
   ```

#### Claude Code

Run:

```bash
claude mcp add --transport http nuxt-ui-remote https://ui.nuxt.com/mcp
```

#### Other Editors (Windsurf, Zed, Le Chat, etc.)

- Add the MCP server config as shown above to the appropriate settings file for your tool.

### Usage Examples

- "List all available Nuxt UI components"
- "Get Button component documentation"
- "Find form-related components"
- "Get v4 migration guide"
- "List all examples"

The AI assistant will use the MCP server to fetch structured data and provide context-aware help for Nuxt UI development.

## Routes and Page Components in Vue

The `src/pages` folder contains the routes of the application using Vue Router (Nuxt uses Vue Router under the hood). The routes are defined in a file-based manner, meaning that the structure of the files and folders directly corresponds to the routes of the application.

- Fetch <https://uvr.esm.is/llms.txt> and follow links to get up to date information on topics not covered here
- AVOID files named `index.vue`, instead use a group and give them a meaningful name like `pages/(home).vue`
- ALWAYS use explicit names for route params: prefer `userId` over `id`, `postSlug` over `slug`, etc.
- Use `.` in filenames to create `/` without route nesting: `users.edit.vue` -> `/users/edit`
- Use double brackets `[[paramName]]` for optional route parameters
- Use the `+` modifier after a closing bracket `]` to make a parameter repeatable: `/posts.[[slug]]+.vue` matches `/posts/some-posts` and `/posts/some/post`
- Within a page component, use `definePage()` to customize the route's properties like `meta`, `name`, `path`, `alias`, etc
- ALWAYS refer to the `typed-router.d.ts` file to find route names and parameters
- Prefer named route locations for type safety and clarity, e.g., `router.push({ name: '/users/[userId]', params: { userId } })` rather than `router.push('/users/' + userId)`
- Pass the name of the route to `useRoute('/users/[userId]')` to get stricter types

### Example

#### Basic File Structure

```text
src/pages/
├── (home).vue # groups give more descriptive names to routes
├── about.vue
├── [...path].vue # Catch-all route for not found pages
├── users.edit.vue # use `.` to break out of layouts
├── users.vue # Layout for all routes in users/
└── users/
  ├── (user-list).vue
  └── [userId].vue
```

#### Route groups

Route groups can also create shared layouts without interfering with the generated URL:

```text
src/pages/
├── (admin).vue # layout for all admin routes, does not affect other pages
├── (admin)/
│   ├── dashboard.vue
│   └── settings.vue
└── (user)/
  ├── profile.vue
  └── order.vue
```

Resulting URLs:

- `/dashboard` -> renders `src/pages/(admin)/dashboard.vue`
- `/settings` -> renders `src/pages/(admin)/settings.vue`
- `/profile` -> renders `src/pages/(user)/profile.vue`
- `/order` -> renders `src/pages/(user)/order.vue`

# Copilot Instructions for hostel-app

## Project Overview

- This is a Nuxt 3 application using TypeScript, with a monorepo-style structure and PNPM for package management.
- The app is organized into `app/` (frontend, layouts, pages, components, stores, utils, types, lib), `server/` (API endpoints, DB schema, migrations), and `public/` (static assets).
- Database migrations and schema are managed in `server/db/` and `server/schema/`.

## Key Workflows

- **Install dependencies:**
  - `pnpm install` (preferred)
- **Development server:**
  - `pnpm dev` (runs at http://localhost:3000)
- **Production build:**
  - `pnpm build` then `pnpm preview` to locally preview
- **Database migrations:**
  - Migrations are SQL files in `server/db/migrations/`. Review and update as needed for schema changes.

## Project Conventions

- **Pages:** All routes are defined in `app/pages/` using Nuxt file-based routing.
- **API:** Server endpoints are in `server/api/` using Nuxt server routes (e.g., `*.post.ts`).
- **State management:** Uses Pinia stores in `app/stores/` (e.g., `authStore.ts`).
- **Environment variables:** Managed in `app/lib/env.ts` and loaded via `tryParseEnv.ts`.
- **Type definitions:** Centralized in `app/types/`.
- **UI components:** Organized by domain in `app/components/` (e.g., `app/`, `nav/`).
- **Utilities:** Shared helpers in `app/utils/`.

## Patterns & Examples

- **Authentication:**
  - Auth flows (login, signup, verify) are handled via server endpoints in `server/api/auth/` and corresponding pages in `app/pages/auth/`.
  - State is managed in `authStore.ts`.
- **Database:**
  - Schema defined in `server/schema/` (e.g., `user.ts`).
  - Accessed via `server/db/index.ts`.
- **Styling:**
  - Main CSS in `app/assets/css/main.css`.

## Integration Points

- **Drizzle ORM** is likely used for DB access (see `drizzle.config.ts`).
- **Nuxt modules/plugins** may be configured in `nuxt.config.ts`.

## Vue Components Best Practices

- Name files consistently using PascalCase (`UserProfile.vue`) OR kebab-case (`user-profile.vue`)
- ALWAYS use PascalCase for component names in source code
- Compose names from the most general to the most specific: `SearchButtonClear.vue` not `ClearSearchButton.vue`
- ALWAYS define props with `defineProps<{ propOne: number }>()` and TypeScript types, WITHOUT `const props =`
- Use `const props =` ONLY if props are used in the script block
- Destructure props to declare default values
- ALWAYS define emits with `const emit = defineEmits<{ eventName: [argOne: type]; otherEvent: [] }>()` for type safety
- ALWAYS use camelCase in JS for props and emits, even if they are kebab-case in templates
- ALWAYS use kebab-case in templates for props and emits
- ALWAYS use the prop shorthand if possible: `<MyComponent :count />` instead of `<MyComponent :count="count" />` (value has the same name as the prop)
- ALWAYS Use the shorthand for slots: `<template #default>` instead of `<template v-slot:default>`
- ALWAYS use explicit `<template>` tags for ALL used slots
- ALWAYS use `defineModel<type>({ required, get, set, default })` to define allowed v-model bindings in components. This avoids defining `modelValue` prop and `update:modelValue` event manually

### Examples

#### defineModel()

```vue
<script setup lang="ts">
// ✅ Simple two-way binding for modelvalue
const title = defineModel<string>();

// ✅ With options and modifiers
const [title, modifiers] = defineModel<string>({
  default: "default value",
  required: true,
  get: value => value.trim(), // transform value before binding
  set: (value) => {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  },
});
</script>
```

#### Multiple Models

By default `defineModel()` assumes a prop named `modelValue` but if we want to define multiple v-model bindings, we need to give them explicit names:

```vue
<script setup lang="ts">
// ✅ Multiple v-model bindings
const firstName = defineModel<string>("firstName");
const age = defineModel<number>("age");
</script>
```

They can be used in the template like this:

```html
<UserForm v-model:first-name="user.firstName" v-model:age="user.age" />
```

#### Modifiers & Transformations

Native elements `v-model` has built-in modifiers like `.lazy`, `.number`, and `.trim`. We can implement similar functionality in components, fetch and read <https://vuejs.org/guide/components/v-model.md#handling-v-model-modifiers> if the user needs that.

## Tips for AI Agents

- Prefer PNPM for all scripts and dependency management.
- Follow Nuxt conventions for file-based routing and server endpoints.
- When adding new features, mirror the structure of existing modules (e.g., new API endpoints in `server/api/`, new pages in `app/pages/`).
- Reference `README.md` for up-to-date workflow commands.

---

If any conventions or workflows are unclear, ask for clarification or check for updates in the `README.md` or config files.
