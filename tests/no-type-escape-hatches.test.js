const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Only TypeScript sources can use these escape hatches.
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);

// Directories that never contain first-party source we control.
const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "__generated__",
  "coverage",
  "dist",
  "build",
  "playwright-report",
  "test-results",
  "e2e",
]);

// This guard file itself mentions the forbidden constructs in prose.
const SELF = path.resolve(__filename);

// Files explicitly allowed to keep an escape hatch. Keep this list short and
// justified — every entry is a known, deliberate exception, not a TODO.
const EXCEPTIONS = new Set(
  [
    // Prisma's `$extends` model context has no public static type; the
    // `findFirst` call is cast to `any` by design.
    "app/lib/prisma.ts",
  ].map((relativePath) => path.resolve(ROOT, relativePath)),
);

// `@ts-nocheck` disables type-checking for a whole file.
const TS_NOCHECK_PATTERN = /@ts-nocheck\b/;

// Silencing the rules via an eslint-disable comment is itself an escape hatch —
// it is just another way to sneak in `any` / skip type-checking, so it is
// penalized too (covers -line, -next-line and whole-file /* eslint-disable */).
const ESLINT_DISABLE_PATTERN =
  /eslint-disable(?:-next-line|-line)?[^\n]*(?:no-explicit-any|ban-ts-comment)/;

// Explicit `any` type usage, mirroring @typescript-eslint/no-explicit-any:
// annotations (`: any`), assertions (`as any`, `<any>`), arrays (`any[]`),
// generics (`Record<string, any>`), returns (`=> any`) and unions (`| any`).
const EXPLICIT_ANY_PATTERN =
  /:\s*any\b|\bas\s+any\b|<\s*any\s*>|\bany\s*\[\]|<[^<>]*\bany\b[^<>]*>|=>\s*any\b|[|&]\s*any\b|\bany\s*[|&]/;

/** Recursively collect all source files under `dir`. */
function collectSourceFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...collectSourceFiles(path.join(dir, entry.name)));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      const fullPath = path.join(dir, entry.name);
      if (fullPath !== SELF && !EXCEPTIONS.has(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

describe("TypeScript escape-hatch guard", () => {
  const sourceFiles = collectSourceFiles(ROOT);

  test("there are source files to check", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  test("no source uses @ts-nocheck, an explicit `any`, or disables the rules", () => {
    const offenders = [];

    for (const file of sourceFiles) {
      const lines = fs.readFileSync(file, "utf-8").split("\n");
      lines.forEach((line, index) => {
        const kind = TS_NOCHECK_PATTERN.test(line)
          ? "@ts-nocheck"
          : ESLINT_DISABLE_PATTERN.test(line)
            ? "eslint-disable of no-explicit-any/ban-ts-comment"
            : EXPLICIT_ANY_PATTERN.test(line)
              ? "explicit any"
              : null;
        if (kind) {
          offenders.push(
            `${path.relative(ROOT, file)}:${index + 1} (${kind}): ${line.trim()}`,
          );
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
