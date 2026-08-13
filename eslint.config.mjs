import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Previous site, kept as a reference for real content/specs (doc/plan.md §4), not part of
    // this app's build or lint surface.
    "old/**",
    // Raw and deployed third-party-style 3D assets are classic browser scripts, not application
    // source. They are exercised through the embedded story rather than transpiled by Next/ESLint.
    "3dObject/**",
    "public/3d/**",
  ]),
]);

export default eslintConfig;
