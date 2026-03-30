/**
 * Mustache-style variable injection for prompt templates.
 *
 * Replaces {{varName}} patterns with the corresponding value from `vars`.
 * Missing variables are replaced with empty strings (never throws on missing vars).
 */
export function renderPrompt(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
}
