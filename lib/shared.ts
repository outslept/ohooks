import type { InferPageType } from "fumadocs-core/source";
import { source } from "@/lib/source";

export const appName = "ohooks";
export const appDescription = "react hooks by outslept.";
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://ohooks.vercel.app";
export const registryBaseUrl = `${appUrl}/r`;

export const docsRoute = "/";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const gitConfig = {
  user: "outslept",
  repo: "ohooks",
  branch: "main",
};

export function getPageImageUrl(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}
