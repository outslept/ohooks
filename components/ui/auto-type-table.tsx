import fs from "node:fs";
import path from "node:path";
import {
  createGenerator,
  type DocEntry,
  type GeneratedDoc,
  type GenerateOptions,
  type Generator,
  type RawTag,
} from "fumadocs-typescript";
import {
  TypeTable,
  type ParameterNode,
  type TypeNode,
} from "@/components/ui/type-table";
import "server-only";

let generatorInstance: Generator | undefined;

function getGenerator(): Generator {
  if (!generatorInstance) {
    generatorInstance = createGenerator();
  }
  return generatorInstance;
}

export interface AutoTypeTableProps {
  path?: string;
  name?: string;
  type?: string;
  options?: GenerateOptions;
  generator?: Generator;
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function resolveSourcePath(inputPath?: string): string {
  if (!inputPath) return "index.ts";

  const hooksDir = path.join(process.cwd(), "hooks");
  const baseName = path.basename(inputPath);
  const directPath = path.join(hooksDir, baseName);

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  const parsed = path.parse(baseName);
  const camelBase = `${toCamelCase(parsed.name)}${parsed.ext || ".ts"}`;
  const camelPath = path.join(hooksDir, camelBase);

  if (fs.existsSync(camelPath)) {
    return camelPath;
  }

  return directPath;
}

function stripBackticks(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("`") && trimmed.endsWith("`") && trimmed.length >= 2) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function cleanLeadingDash(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/^\s*[-–—:]\s*/, "").trim();
  return cleaned || undefined;
}

interface ParsedTags {
  map: Record<string, string>;
  params: ParameterNode[];
}

function parseTags(
  tags?: RawTag[] | Record<string, string>
): ParsedTags {
  const map: Record<string, string> = {};
  const params: ParameterNode[] = [];

  if (!tags) return { map, params };

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (!tag || typeof tag.name !== "string") continue;
      const text = (tag.text ?? "").trim();

      if (tag.name === "param" || tag.name === "arg" || tag.name === "argument") {
        const paramMatch = text.match(
          /^(?:\{([^}]+)\}\s+)?(\[?[\w.$]+\]?)\s*(?:[-–—:]\s*(.*))?$/s
        );
        if (paramMatch) {
          const [, rawType, rawName, rawDesc] = paramMatch;
          params.push({
            name: rawName.replace(/^\[|\]$/g, ""),
            type: rawType?.trim(),
            description: cleanLeadingDash(rawDesc),
          });
        }
      } else {
        map[tag.name] = text;
      }
    }
    return { map, params };
  }

  return { map: tags, params };
}

function splitTopLevelParams(paramList: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < paramList.length; i++) {
    const ch = paramList[i];
    if (ch === "(" || ch === "<" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === ">" || ch === "}" || ch === "]") depth--;

    if (ch === "," && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

function extractFunctionParameters(
  typeStr: string,
  jsdocParams: ParameterNode[]
): ParameterNode[] | undefined {
  const fnMatch = typeStr.match(/^(?:<[^>]+>\s*)?\((.*)\)\s*=>\s*(.+)$/s);
  if (!fnMatch) {
    return jsdocParams.length > 0 ? jsdocParams : undefined;
  }

  const rawParams = splitTopLevelParams(fnMatch[1]);
  if (rawParams.length === 0) {
    return jsdocParams.length > 0 ? jsdocParams : undefined;
  }

  const jsdocMap = new Map(jsdocParams.map((p) => [p.name, p]));

  return rawParams.map((part) => {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) {
      const cleanName = part.trim();
      const existing = jsdocMap.get(cleanName.replace(/\?$/, ""));
      return {
        name: cleanName,
        type: existing?.type,
        description: existing?.description,
      };
    }

    const rawName = part.slice(0, colonIdx).trim();
    const rawType = part.slice(colonIdx + 1).trim();
    const lookupName = rawName.replace(/^\.\.\.|\?$/g, "");
    const existing = jsdocMap.get(lookupName);

    return {
      name: rawName,
      type: rawType || existing?.type,
      description: existing?.description,
    };
  });
}

function summarizeType(rawType: string): {
  displayType: string;
  fullType?: string;
} {
  const normalized = rawType.replace(/\s+/g, " ").trim();

  const fnMatch = normalized.match(/^((?:<[^>]+>\s*)?)\((.*)\)\s*=>\s*(.+)$/);
  if (fnMatch && normalized.length > 56) {
    const [, generics, paramsStr, returnType] = fnMatch;
    const params = splitTopLevelParams(paramsStr);
    const shortParams = params
      .map((p) => p.split(":")[0]?.trim())
      .filter(Boolean)
      .join(", ");
    const shortReturn =
      returnType.length > 28 ? `${returnType.slice(0, 25)}...` : returnType;
    const summary = `${generics}(${shortParams}) => ${shortReturn}`;

    if (summary.length < normalized.length) {
      return { displayType: summary, fullType: rawType };
    }
  }

  if (normalized.length > 68) {
    const unionParts = normalized
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    if (unionParts.length > 3) {
      return {
        displayType: `${unionParts.slice(0, 3).join(" | ")} | ...`,
        fullType: rawType,
      };
    }
  }

  return { displayType: rawType };
}

function extractDefaultAndCleanDescription(
  rawDescription?: string,
  tagsMap: Record<string, string> = {}
): { description?: string; defaultValue?: string } {
  const explicitTag = tagsMap.default ?? tagsMap.defaultValue;
  let description = rawDescription?.trim();
  let defaultValue = explicitTag ? stripBackticks(explicitTag) : undefined;

  if (!description) {
    return { description: undefined, defaultValue };
  }

  const inlineDefaultRegex =
    /\s*(?:\((?:default|defaults to)\s*:?\s*`?([^`)]+)`?\)|\[(?:default|defaults to)\s*:?\s*`?([^`\]]+)`?\])\s*\.?\s*$/i;

  const match = description.match(inlineDefaultRegex);
  if (match) {
    const extracted = (match[1] ?? match[2])?.trim();
    if (!defaultValue && extracted) {
      defaultValue = stripBackticks(extracted);
    }
    description = description.replace(inlineDefaultRegex, "").trim();
  }

  return {
    description: description || undefined,
    defaultValue,
  };
}

const OUTPUT_INTERFACE_PATTERN =
  /(Info|Controls|Return|Returns|Result|State|Snapshot|Metrics|Entry|Payload|Actions|Methods)$/i;

function isInputInterface(interfaceName?: string): boolean {
  if (!interfaceName) return true;
  return !OUTPUT_INTERFACE_PATTERN.test(interfaceName);
}

function mapDocEntryToTypeNode(
  entry: DocEntry,
  interfaceName?: string
): TypeNode {
  const { map: tags, params: jsdocParams } = parseTags(
    entry.tags as RawTag[] | Record<string, string> | undefined
  );

  const { description, defaultValue } = extractDefaultAndCleanDescription(
    entry.description,
    tags
  );

  const isInput = isInputInterface(interfaceName);
  const rawSimplified = (entry as { simplifiedType?: string }).simplifiedType;

  const { displayType, fullType } = rawSimplified
    ? {
        displayType: rawSimplified,
        fullType:
          entry.type && rawSimplified !== entry.type ? entry.type : undefined,
      }
    : summarizeType(entry.type);

  const parameters = extractFunctionParameters(entry.type, jsdocParams);

  const isDeprecated = Boolean(
    (entry as { deprecated?: boolean }).deprecated ||
      tags.deprecated !== undefined
  );

  return {
    description,
    type: displayType,
    typeDescription: fullType,
    default: defaultValue,
    required: isInput ? entry.required : false,
    optional: !entry.required,
    deprecated: isDeprecated,
    parameters,
    returns: cleanLeadingDash(tags.returns ?? tags.return),
  };
}

export async function AutoTypeTable({
  path: filePath,
  name,
  type,
  options,
  generator = getGenerator(),
}: AutoTypeTableProps) {
  const resolvedPath = resolveSourcePath(filePath);

  const output = (await generator.generateDocumentation(
    {
      path: resolvedPath,
      content: type,
    },
    name,
    options
  )) as GeneratedDoc[];

  const showInterfaceTitle = !name && output.length > 1;

  return (
    <>
      {output.map((doc) => (
        <TypeTable
          key={doc.name}
          title={showInterfaceTitle ? doc.name : undefined}
          type={Object.fromEntries(
            doc.entries.map((entry) => [
              entry.name,
              mapDocEntryToTypeNode(entry, doc.name),
            ])
          )}
        />
      ))}
    </>
  );
}
