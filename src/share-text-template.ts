export class ShareTextTemplateError extends Error {
  constructor(readonly preset: string, readonly position: number, template: string, reason: string) {
    const before = template.slice(0, position);
    const line = before.split("\n").length;
    const column = position - before.lastIndexOf("\n");
    super(`${preset} at line ${line}, column ${column}: ${reason}`);
    this.name = "ShareTextTemplateError";
  }
}

// Scan source once: substituted values can never become template instructions.
export function renderShareTextTemplate(
  template: string,
  preset: string,
  values: Record<string, { text: string; available: boolean }>,
): string {
  let output = "";
  let condition: { available: boolean; position: number } | undefined;
  const fail = (position: number, reason: string): never => {
    throw new ShareTextTemplateError(preset, position, template, reason);
  };
  const variable = (name: string, position: number) => {
    if (!Object.hasOwn(values, name)) fail(position, `Unknown variable ${JSON.stringify(name)}`);
    return values[name]!;
  };
  const append = (text: string) => { if (!condition || condition.available) output += text; };
  for (let i = 0; i < template.length;) {
    const escaped = ["{{", "}}", "\\"].find(token => template.startsWith(`\\${token}`, i));
    if (escaped) { append(escaped); i += escaped.length + 1; continue; }
    if (template.startsWith("}}", i)) fail(i, "Unexpected closing delimiter");
    if (!template.startsWith("{{", i)) { append(template[i]!); i++; continue; }
    const end = template.indexOf("}}", i + 2);
    if (end === -1) fail(i, "Unclosed template instruction");
    const token = template.slice(i + 2, end);
    if (token.startsWith("#if ")) {
      if (condition) fail(i, "Nested conditions are unsupported");
      condition = { available: variable(token.slice(4), i).available, position: i };
    } else if (token === "/if") {
      if (!condition) fail(i, "Unexpected /if");
      condition = undefined;
    } else {
      append(variable(token, i).text);
    }
    i = end + 2;
  }
  if (condition) fail(condition.position, "Unclosed condition");
  return output;
}
