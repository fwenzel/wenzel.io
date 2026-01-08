import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");
const outDir = path.join(root, "docs");

if (!existsSync(srcDir)) {
  console.error("Missing src/ directory; nothing to build.");
  process.exit(1);
}

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

for (const entry of readdirSync(outDir)) {
  rmSync(path.join(outDir, entry), { recursive: true, force: true });
}

let build;
try {
  ({ build } = await import("esbuild"));
} catch (error) {
  console.error("Missing esbuild. Install it with `npm install` before building.");
  process.exit(1);
}

const copyEntries = readdirSync(srcDir);
for (const entry of copyEntries) {
  if (entry === "js") continue;
  cpSync(path.join(srcDir, entry), path.join(outDir, entry), { recursive: true });
}

const outJsDir = path.join(outDir, "js");
mkdirSync(outJsDir, { recursive: true });

await build({
  entryPoints: [path.join(srcDir, "js", "main.js")],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2018",
  outfile: path.join(outJsDir, "main.js"),
});

console.log("Built docs/ from src/ with bundled JS.");
