/**
 * extract-n8n.ts
 *
 * Reads all n8n workflow JSON files from the "../n8n amplify scripts/" directory,
 * extracts AI prompts from LLM/agent nodes and relevant HTTP-request nodes,
 * deduplicates them, assigns domain.task keys, and writes a SQL seed file to
 * supabase/seed/prompts.sql.
 *
 * Usage:
 *   npx tsx lib/prompts/extract-n8n.ts
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface N8nNode {
  type: string;
  name: string;
  parameters: Record<string, unknown>;
}

interface N8nWorkflow {
  name?: string;
  nodes: N8nNode[];
}

interface ExtractedPrompt {
  key: string;
  template: string;
  modelOverride: string;
  description: string;
  sourceWorkflow: string;
  sourceNode: string;
}

// ---------------------------------------------------------------------------
// Domain key assignment rules
// Ordered from most specific to least specific.
// ---------------------------------------------------------------------------

function assignKey(
  nodeName: string,
  templateSnippet: string,
  workflowName: string
): string {
  const name = nodeName.toLowerCase();
  const snippet = templateSnippet.toLowerCase();
  const wf = workflowName.toLowerCase();

  // Translation first — most specific
  if (
    name.includes("translat") ||
    snippet.includes("translating spiritual")
  ) {
    return "translation.content";
  }

  // Research (Perplexity system prompts)
  if (
    (snippet.includes("marketing and content researcher") ||
      snippet.includes("marketing research expert") ||
      snippet.includes("marketing and content expert")) &&
    snippet.includes("art of living")
  ) {
    if (wf.includes("translat")) return "research.translated";
    return "research.regional";
  }

  // Wisdom — questions for Gurudev
  if (
    name.includes("questions for gurudev") ||
    snippet.includes("crafting profound questions for gurudev")
  ) {
    return "wisdom.questions";
  }

  // Wisdom — quote finder / curator
  if (
    name.includes("quote finder") ||
    name.includes("quote generator") ||
    snippet.includes("expert curator of wisdom from gurudev") ||
    snippet.includes("extracting meaningful quotes of gurudev")
  ) {
    return "wisdom.quotes";
  }

  // Image — quote image
  if (
    name.includes("generate image prompt") ||
    snippet.includes("beautifully render a spiritual quote")
  ) {
    return "image.quote";
  }

  // Image — ad creative
  if (
    name.includes("photography") ||
    snippet.includes("photography-style image prompt") ||
    snippet.includes("photography style image prompt")
  ) {
    return "image.ad-creative";
  }

  // Ads — national ad copy
  if (wf.includes("national ad") && name.includes("ad copywriter")) {
    return "ads.national";
  }

  // Ads — generic ad copy
  if (
    name.includes("ad copywriter") ||
    snippet.includes("headline") && snippet.includes("sub‑headline")
  ) {
    return "ads.copy";
  }

  // Copy — multi-channel (email + whatsapp + instagram + facebook in one prompt)
  if (
    (snippet.includes("whatsapp") &&
      snippet.includes("instagram") &&
      snippet.includes("email")) ||
    (name.includes("content maker") &&
      (snippet.includes("intro talk") || snippet.includes("introductory talk")))
  ) {
    if (snippet.includes("intro") || snippet.includes("introductory talk")) {
      return "copy.intro-talk";
    }
    return "copy.email"; // canonical for the multi-channel block
  }

  // Copy — channel-specific
  if (name.includes("instagram")) return "copy.instagram";
  if (name.includes("facebook")) return "copy.facebook";
  if (name.includes("whatsapp")) return "copy.whatsapp";
  if (name.includes("email") || name.includes("marketing email")) {
    return "copy.email";
  }

  // Fallback
  return "misc.unknown";
}

// ---------------------------------------------------------------------------
// Model override resolution
// ---------------------------------------------------------------------------

function resolveModelOverride(
  workflowFile: string,
  nodeType: string,
  promptKey: string
): string {
  // Perplexity HTTP nodes
  if (nodeType === "httpRequest") return "perplexity/sonar-pro";

  // Look up the LLM model used in this workflow (from our earlier analysis)
  const wf = workflowFile.toLowerCase();

  if (
    wf.includes("copy blocks and image prompts") ||
    wf.includes("researcher and content maker")
  ) {
    return "anthropic/claude-3-7-sonnet-latest";
  }
  if (
    wf.includes("aol ad creator") ||
    wf.includes("national ad creator") ||
    wf.includes("national ad _ creation")
  ) {
    // Image prompts use Anthropic, copy uses OpenAI gpt-4o-mini
    if (promptKey.startsWith("image.")) return "anthropic/claude-3-7-sonnet-20250219";
    return "openai/gpt-4o-mini";
  }
  if (wf.includes("quotes and research") && !wf.includes("translat")) {
    // Quote nodes use OpenAI gpt-4.1-mini; research uses Perplexity
    if (promptKey.startsWith("research.")) return "perplexity/sonar-pro";
    return "openai/gpt-4.1-mini";
  }
  if (wf.includes("translat") && wf.includes("quotes research")) {
    if (promptKey.startsWith("research.")) return "perplexity/sonar-pro";
    return "openai/gpt-4.1-nano";
  }
  if (wf.includes("translat") && wf.includes("copy blocks")) {
    return "openai/gpt-4.1";
  }
  if (wf.includes("amplify quote") || wf.includes("gurudev_quote")) {
    if (promptKey.startsWith("research.")) return "perplexity/sonar-pro";
    return "openai/gpt-4o-mini";
  }

  return "openai/gpt-4o-mini"; // safe default
}

// ---------------------------------------------------------------------------
// SQL escaping
// ---------------------------------------------------------------------------

function escapeSql(s: string): string {
  // Escape single quotes by doubling them (standard SQL)
  return s.replace(/'/g, "''");
}

// ---------------------------------------------------------------------------
// Main extraction logic
// ---------------------------------------------------------------------------

// lib/prompts/ -> project root is ../../  -> parent of project root is ../../../
// The n8n workflow files live at "../n8n amplify scripts/" relative to the project root,
// i.e. ../../../n8n amplify scripts relative to this file's location.
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const N8N_DIR = path.resolve(PROJECT_ROOT, "../n8n amplify scripts");
const OUT_SQL = path.resolve(PROJECT_ROOT, "supabase/seed/prompts.sql");

const WORKFLOW_FILES = [
  "AOL Ad Creator v6.json",
  "Amplify 2.0 _ Copy Blocks and Image Prompts.json",
  "Amplify 2.0 _ Intro Workshop _ Quotes and Research.json",
  "Amplify 2.0 _ National Ad Creator.json",
  "Amplify 2.0 _ National Ad _ Creation Webhooks.json",
  "Amplify 2.1 _ Intro Workshop _ Quotes Research translated.json",
  "Amplify 2.1 _ Translated Copy Blocks, Intro Talks and Image Prompts Intro Talk.json",
  "Amplify Quote n8n Workflow.json",
  "Amplify Researcher and Content Maker.json",
  "gurudev_quote_workflow.json",
];

function extractFromWorkflow(
  filePath: string,
  fileName: string
): ExtractedPrompt[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const wf: N8nWorkflow = JSON.parse(raw);

  const found: ExtractedPrompt[] = [];
  const nodes = wf.nodes ?? [];

  for (const node of nodes) {
    const ntype: string = node.type ?? "";
    const params = node.parameters ?? {};
    const nodeName: string = node.name ?? "";

    let template: string | undefined;

    // LangChain agent / LLM nodes — prompt is in parameters.text or parameters.systemMessage
    if (
      ntype.includes("langchain") ||
      ntype.includes("agent") ||
      ntype.includes("openAi") ||
      ntype.includes("Anthropic") ||
      ntype.includes("gemini")
    ) {
      const raw =
        (params.text as string | undefined) ??
        (params.prompt as string | undefined) ??
        (params.systemMessage as string | undefined);
      if (raw && raw.length > 80) {
        // Strip leading "=" that n8n uses to signal expression mode
        template = raw.startsWith("=") ? raw.slice(1) : raw;
      }
    }

    // HTTP-request nodes calling Perplexity — extract the system message
    if (ntype === "n8n-nodes-base.httpRequest") {
      const bodyRaw = (params.jsonBody as string | undefined) ?? "";
      const url = (params.url as string | undefined) ?? "";
      if (url.includes("perplexity.ai") && bodyRaw.includes("messages")) {
        try {
          const bodyStr = bodyRaw.startsWith("=") ? bodyRaw.slice(1) : bodyRaw;
          // Extract system message content via a lightweight regex
          const sysMatch = bodyStr.match(
            /"role"\s*:\s*"system"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"/
          );
          if (sysMatch) {
            template = sysMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          }
        } catch {
          // non-JSON body — skip
        }
      }
    }

    if (!template || template.trim().length < 40) continue;

    const key = assignKey(nodeName, template, fileName);
    // Skip fully unknown that have no real content
    if (key === "misc.unknown") continue;

    const modelOverride = resolveModelOverride(fileName, ntype === "n8n-nodes-base.httpRequest" ? "httpRequest" : "agent", key);

    found.push({
      key,
      template,
      modelOverride,
      description: `Extracted from n8n workflow: ${fileName} | Node: ${nodeName}`,
      sourceWorkflow: fileName,
      sourceNode: nodeName,
    });
  }

  return found;
}

function deduplicatePrompts(prompts: ExtractedPrompt[]): ExtractedPrompt[] {
  // Keep the best representative per key:
  // - prefer the longest template (most complete), then first encountered
  const byKey = new Map<string, ExtractedPrompt>();

  for (const p of prompts) {
    const existing = byKey.get(p.key);
    if (!existing || p.template.length > existing.template.length) {
      byKey.set(p.key, p);
    }
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}

function generateSql(prompts: ExtractedPrompt[]): string {
  const now = new Date().toISOString();
  const lines: string[] = [];

  lines.push(`-- =============================================================================`);
  lines.push(`-- Amplify AOL — Prompt Seed File`);
  lines.push(`-- Phase 1: Foundation — n8n workflow prompt extraction`);
  lines.push(`-- Extracted: ${now}`);
  lines.push(`-- Source: n8n amplify scripts/ (10 workflow JSON files)`);
  lines.push(`-- Total prompts: ${prompts.length}`);
  lines.push(`-- =============================================================================`);
  lines.push(``);
  lines.push(`-- All inserts are idempotent — running this file multiple times is safe.`);
  lines.push(`-- New edits must create new version rows (never UPDATE existing rows).`);
  lines.push(``);

  for (const p of prompts) {
    const escapedTemplate = escapeSql(p.template.trim());
    const escapedDescription = escapeSql(p.description);

    lines.push(`-- Source: ${p.sourceWorkflow} | Node: ${p.sourceNode}`);
    lines.push(
      `INSERT INTO prompts (key, version, template, model_override, description, is_active, created_at)`
    );
    lines.push(
      `VALUES (`
    );
    lines.push(`  '${p.key}',`);
    lines.push(`  1,`);
    lines.push(`  '${escapedTemplate}',`);
    lines.push(`  '${p.modelOverride}',`);
    lines.push(`  '${escapedDescription}',`);
    lines.push(`  true,`);
    lines.push(`  now()`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (key) WHERE is_active = true DO NOTHING;`);
    lines.push(``);
  }

  lines.push(`-- =============================================================================`);
  lines.push(`-- Verification: confirm all v1 seed prompts are present`);
  lines.push(`-- =============================================================================`);
  lines.push(`SELECT key, version, model_override, is_active`);
  lines.push(`FROM prompts`);
  lines.push(`WHERE version = 1`);
  lines.push(`ORDER BY key;`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
  console.log(`\nAmplify AOL — n8n Prompt Extractor`);
  console.log(`===================================`);
  console.log(`Source directory: ${N8N_DIR}`);
  console.log(`Output SQL file:  ${OUT_SQL}\n`);

  const allPrompts: ExtractedPrompt[] = [];
  const perFileStats: Record<string, number> = {};

  for (const fileName of WORKFLOW_FILES) {
    const filePath = path.join(N8N_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`  [WARN] File not found: ${fileName}`);
      continue;
    }

    try {
      const found = extractFromWorkflow(filePath, fileName);
      perFileStats[fileName] = found.length;
      allPrompts.push(...found);
      console.log(`  [OK]   ${fileName}: ${found.length} prompt(s) found`);
    } catch (err) {
      console.error(`  [ERR]  ${fileName}: ${(err as Error).message}`);
    }
  }

  const deduped = deduplicatePrompts(allPrompts);

  console.log(`\nSummary`);
  console.log(`-------`);
  console.log(`Total raw prompts extracted : ${allPrompts.length}`);
  console.log(`Unique prompts (after dedup): ${deduped.length}`);
  console.log(`\nDeduped prompt keys:`);
  for (const p of deduped) {
    console.log(`  ${p.key.padEnd(30)} <- ${p.sourceWorkflow}`);
  }

  const sql = generateSql(deduped);
  fs.mkdirSync(path.dirname(OUT_SQL), { recursive: true });
  fs.writeFileSync(OUT_SQL, sql, "utf8");

  console.log(`\nSQL seed file written to: ${OUT_SQL}`);
  console.log(`Done.\n`);
}

main();
