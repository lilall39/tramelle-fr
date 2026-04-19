/**
 * Pousse FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 depuis .env.local vers Vercel.
 * - Production / Preview : --sensitive
 * - Preview : dernier argument "" (toutes les branches preview) — voir issue Vercel CLI #15763
 * - Development : sans --sensitive (Vercel refuse les variables sensibles sur « development »)
 *
 * Usage : node scripts/push-env-vercel.cjs
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const text = fs.readFileSync(envPath, "utf8");
const line = text.split(/\r?\n/).find((l) => l.startsWith("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64="));
if (!line) {
  console.error("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 introuvable dans .env.local");
  process.exit(1);
}
const value = line.slice("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=".length);

function run(args) {
  execFileSync("npx", ["--yes", "vercel@latest", ...args], { stdio: "inherit", cwd: root });
}

console.error("→ production…");
run([
  "env",
  "add",
  "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64",
  "production",
  "--value",
  value,
  "--yes",
  "--force",
  "--sensitive",
]);

console.error("→ preview (toutes les branches)…");
run([
  "env",
  "add",
  "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64",
  "preview",
  "--value",
  value,
  "--yes",
  "--force",
  "--sensitive",
  "",
]);

console.error("→ development (chiffré, non « sensitive » côté Vercel)…");
run([
  "env",
  "add",
  "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64",
  "development",
  "--value",
  value,
  "--yes",
  "--force",
]);

console.error("Terminé.");
