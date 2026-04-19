/**
 * Pousse RESEND_API_KEY et EMAIL_FROM depuis .env.local vers Vercel.
 * Prérequis : https://resend.com → API Key + EMAIL_FROM (ex. Tramelle <onboarding@resend.dev>).
 *
 * Usage : node scripts/push-resend-env-vercel.cjs
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

function parseEnvFile(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const env = parseEnvFile(fs.readFileSync(envPath, "utf8"));
const apiKey = env.RESEND_API_KEY?.trim();
const from = env.EMAIL_FROM?.trim();

if (!apiKey || !from) {
  console.error(
    "Manque RESEND_API_KEY ou EMAIL_FROM dans .env.local.\n" +
      "1) Crée une clé sur https://resend.com/api-keys\n" +
      "2) Ajoute dans .env.local par exemple :\n" +
      "   RESEND_API_KEY=re_xxxxxxxx\n" +
      "   EMAIL_FROM=Tramelle <onboarding@resend.dev>\n" +
      "   (ou une adresse @ton-domaine une fois le domaine vérifié chez Resend)",
  );
  process.exit(1);
}

/**
 * @param {{ name: string; value: string; sensitive: boolean }} o
 * @param {'production' | 'preview' | 'development'} target
 */
function pushVar(o, target) {
  const args = [
    "--yes",
    "vercel@latest",
    "env",
    "add",
    o.name,
    target,
    "--value",
    o.value,
    "--yes",
    "--force",
  ];
  if (o.sensitive) args.push("--sensitive");
  if (target === "preview") args.push("");
  execFileSync("npx", args, { stdio: "inherit", cwd: root });
}

const targets = ["production", "preview", "development"];

for (const target of targets) {
  console.error(`→ ${target} (RESEND_API_KEY)…`);
  pushVar(
    {
      name: "RESEND_API_KEY",
      value: apiKey,
      sensitive: target !== "development",
    },
    target,
  );
  console.error(`→ ${target} (EMAIL_FROM)…`);
  pushVar({ name: "EMAIL_FROM", value: from, sensitive: false }, target);
}

console.error("Terminé. Pense à redéployer sur Vercel.");
