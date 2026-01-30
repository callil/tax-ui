import type { TaxReturn } from "./schema";

const RETURNS_FILE = ".tax-returns.json";
const ENV_FILE = ".env";

export async function getReturns(): Promise<Record<number, TaxReturn>> {
  const file = Bun.file(RETURNS_FILE);
  if (await file.exists()) {
    return file.json();
  }
  return {};
}

export async function saveReturn(taxReturn: TaxReturn): Promise<void> {
  const returns = await getReturns();
  returns[taxReturn.year] = taxReturn;
  await Bun.write(RETURNS_FILE, JSON.stringify(returns, null, 2));
}

export async function deleteReturn(year: number): Promise<void> {
  const returns = await getReturns();
  delete returns[year];
  await Bun.write(RETURNS_FILE, JSON.stringify(returns, null, 2));
}

export function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

export async function saveApiKey(key: string): Promise<void> {
  const file = Bun.file(ENV_FILE);
  let content = "";

  if (await file.exists()) {
    content = await file.text();
    if (content.includes("ANTHROPIC_API_KEY=")) {
      content = content.replace(/ANTHROPIC_API_KEY=.*/g, `ANTHROPIC_API_KEY=${key}`);
    } else {
      content = content.trim() + `\nANTHROPIC_API_KEY=${key}\n`;
    }
  } else {
    content = `ANTHROPIC_API_KEY=${key}\n`;
  }

  await Bun.write(ENV_FILE, content);
  process.env.ANTHROPIC_API_KEY = key;
}
