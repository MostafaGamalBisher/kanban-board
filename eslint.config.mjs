import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Import rules.
 *
 * Architecture — the dependency direction is:
 *
 *   app/  ->  features/  ->  core/  <-  server/
 *
 * Each layer below lists what it must NOT import. `server-only` (node 2.2)
 * adds a build-time guard for indirect import chains that lint cannot see.
 *
 * ESLint gives each file the options of the LAST matching block, so every
 * block must repeat the project-wide restrictions: `layer()` appends them.
 */
const projectWide = [
  {
    regex: '^cn(/.*)?$',
    message:
      "Import `cn` from '@/lib/utils': it knows the custom text sizes, the raw package does not.",
  },
];

const layer = (message, ...regexes) => ({
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        ...regexes.map((regex) => ({ regex, message })),
        ...projectWide,
      ],
    },
  ],
});

/** Matches a relative path that climbs out into one of the given top-level folders. */
const escapesInto = (...folders) => `^(\\.\\./)+(${folders.join('|')})(/|$)`;

/**
 * UI text must come from the i18n dictionaries, never from literals in JSX.
 * `react/jsx-no-literals` covers text children; the selector below covers
 * the attributes that carry user-facing text. `alt=""` stays allowed for
 * decorative images.
 */
const noUiLiterals = {
  'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true }],
  'no-restricted-syntax': [
    'error',
    {
      selector:
        'JSXAttribute[name.name=/^(aria-label|aria-description|placeholder|title|alt)$/] > Literal[value=/\\S/]',
      message: 'User-facing attribute text must come from the i18n dictionary.',
    },
  ],
};

/**
 * RTL: physical direction utilities (ml-4, left-0, text-right, …) break the
 * Arabic layout. This rule rejects them in any string (className, cn()
 * arguments, config arrays) and suggests the logical equivalent. Classes
 * with an explicit `ltr:` or `rtl:` variant are intentional and allowed.
 */
const PHYSICAL_TO_LOGICAL = {
  ml: 'ms',
  mr: 'me',
  pl: 'ps',
  pr: 'pe',
  left: 'start',
  right: 'end',
  'scroll-ml': 'scroll-ms',
  'scroll-mr': 'scroll-me',
  'scroll-pl': 'scroll-ps',
  'scroll-pr': 'scroll-pe',
  'border-l': 'border-s',
  'border-r': 'border-e',
  'rounded-l': 'rounded-s',
  'rounded-r': 'rounded-e',
  'rounded-tl': 'rounded-ss',
  'rounded-tr': 'rounded-se',
  'rounded-bl': 'rounded-es',
  'rounded-br': 'rounded-ee',
  'text-left': 'text-start',
  'text-right': 'text-end',
  'float-left': 'float-start',
  'float-right': 'float-end',
  'clear-left': 'clear-start',
  'clear-right': 'clear-end',
};
const PHYSICAL_CLASS = new RegExp(
  `^(${Object.keys(PHYSICAL_TO_LOGICAL)
    .sort((a, b) => b.length - a.length)
    .join('|')})(?=-|$)`
);

/**
 * `md:hover:!-ml-4` → { variants: ['md', 'hover'], prefix: 'md:hover:!-',
 * utility: 'ml-4' }. Colons inside [arbitrary] values do not split.
 */
function splitClass(token) {
  const parts = token.split(/:(?![^[]*\])/);
  const last = parts.pop() ?? '';
  const modifiers = /^!?-?/.exec(last)?.[0] ?? '';
  const variants = parts.length ? `${parts.join(':')}:` : '';
  return {
    variants: parts,
    prefix: variants + modifiers,
    utility: last.slice(modifiers.length),
  };
}

const rtlPlugin = {
  rules: {
    'no-physical-direction': {
      meta: {
        type: 'problem',
        messages: {
          physical:
            '`{{token}}` is a physical direction and breaks the Arabic (RTL) layout. Use `{{logical}}` instead.',
        },
        schema: [],
      },
      create(context) {
        const check = (node, text) => {
          for (const token of text.split(/\s+/)) {
            if (!token) continue;
            const { variants, prefix, utility } = splitClass(token);
            if (variants.some((v) => v === 'ltr' || v === 'rtl')) continue;
            const match = PHYSICAL_CLASS.exec(utility);
            if (!match) continue;
            // Keep variants and modifiers: md:hover:!-ml-2 → md:hover:!-ms-2
            const logical =
              prefix +
              PHYSICAL_TO_LOGICAL[match[1]] +
              utility.slice(match[1].length);
            context.report({
              node,
              messageId: 'physical',
              data: { token, logical },
            });
          }
        };
        return {
          Literal(node) {
            if (typeof node.value === 'string') check(node, node.value);
          },
          TemplateElement(node) {
            check(node, node.value.cooked ?? '');
          },
        };
      },
    },
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/utils.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: projectWide }] },
  },

  {
    files: ['src/core/**/*.ts'],
    rules: layer(
      'core/ is framework-free: relative imports within core/ and `zod` only.',
      '^(?!zod$)(?!\\.{1,2}/)',
      escapesInto(
        'app',
        'features',
        'server',
        'components',
        'lib',
        'config',
        'i18n',
        'data'
      )
    ),
  },
  {
    // Tests in core/ may also use Node's test runner and assertions.
    // Production core/ code may not: it must run in the browser too.
    files: ['src/core/**/*.test.ts'],
    rules: layer(
      'core/ tests: relative imports, `zod`, `node:test` and `node:assert` only.',
      '^(?!zod$)(?!node:test$)(?!node:assert(/strict)?$)(?!\\.{1,2}/)',
      escapesInto(
        'app',
        'features',
        'server',
        'components',
        'lib',
        'config',
        'i18n',
        'data'
      )
    ),
  },
  {
    files: ['src/server/**/*.ts'],
    rules: layer(
      'server/ must not depend on UI code.',
      '^react(-dom)?(/|$)',
      '^@/(features|components)(/|$)',
      escapesInto('features', 'components')
    ),
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: layer(
      'UI code must not import server code or raw data; data arrives as props from Server Components.',
      '^@/(server|data)(/|$)',
      escapesInto('server', 'data')
    ),
  },
  {
    files: ['src/app/**/*.tsx', 'src/features/**/*.tsx'],
    rules: noUiLiterals,
  },
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/features/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/config/**/*.ts',
    ],
    plugins: { rtl: rtlPlugin },
    rules: { 'rtl/no-physical-direction': 'error' },
  },
]);
