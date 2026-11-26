import { NextResponse } from "next/server";
import { getAllRegistryItems, getRegistryItemByName, toKebabCase } from "@/scripts/registry";

export const revalidate = false;

export async function GET(_request: Request, { params }: RouteContext<"/r/[name]">) {
  const { name } = await params;
  const item = getRegistryItemByName(name);

  if (!item) {
    return NextResponse.json({ error: `Registry item "${name}" not found.` }, { status: 404 });
  }

  return NextResponse.json(item);
}

export function generateStaticParams() {
  const items = getAllRegistryItems();
  const params: Array<{ name: string }> = [];

  for (const item of items) {
    params.push({ name: `${item.name}.json` });
    const kebab = toKebabCase(item.name);
    if (kebab !== item.name) {
      params.push({ name: `${kebab}.json` });
    }
  }

  return params;
}
