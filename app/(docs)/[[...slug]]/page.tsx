import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/spacious/page";
import { findNeighbour } from "fumadocs-core/page-tree";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from "@/lib/shared";
import { source } from "@/lib/source";

export default async function Page(props: PageProps<"/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${encodeURI(page.path)}`;
  const neighbours = findNeighbour(source.pageTree, page.url);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        single: true,
        list: {
          className:
            "[&_code]:rounded-none [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit [&>div[data-ready]]:border-0",
        },
        footer: (
          <EditOnGitHub
            href={githubUrl}
            className="mt-2 text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          />
        ),
      }}
      footer={{
        enabled: false,
      }}
    >
      <header className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DocsTitle className="mb-0 min-w-0 tracking-tight wrap-break-word">
            {page.data.title}
          </DocsTitle>

          <div className="flex shrink-0 items-center gap-1.5 [&_button]:h-7 [&_button]:rounded-md [&_button]:border-border [&_button]:bg-control [&_button]:text-foreground [&_button]:shadow-control [&_button]:hover:border-border-hover [&_button]:hover:bg-muted/60 dark:[&_button]:hover:bg-accent">
            <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />

            <Button
              variant="secondary"
              size="icon-compact"
              disabled={!neighbours.previous}
              aria-label={
                neighbours.previous
                  ? `Previous: ${String(neighbours.previous.name)}`
                  : "No previous page"
              }
              title={neighbours.previous ? String(neighbours.previous.name) : undefined}
              render={neighbours.previous ? <Link href={neighbours.previous.url} /> : undefined}
            >
              <ArrowLeft className="text-muted-foreground" />
            </Button>

            <Button
              variant="secondary"
              size="icon-compact"
              disabled={!neighbours.next}
              aria-label={
                neighbours.next ? `Next: ${String(neighbours.next.name)}` : "No next page"
              }
              title={neighbours.next ? String(neighbours.next.name) : undefined}
              render={neighbours.next ? <Link href={neighbours.next.url} /> : undefined}
            >
              <ArrowRight className="text-muted-foreground" />
            </Button>
          </div>
        </div>

        {page.data.description && (
          <DocsDescription className="mb-0 max-w-[65ch] text-[0.9375rem]/relaxed text-muted-foreground">
            {page.data.description}
          </DocsDescription>
        )}
      </header>

      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>

      <footer className="mt-10 flex items-center justify-between gap-4 pt-6">
        {neighbours.previous ? (
          <Button variant="secondary" render={<Link href={neighbours.previous.url} />}>
            <ArrowLeft className="text-muted-foreground" />
            <span>{neighbours.previous.name}</span>
          </Button>
        ) : (
          <div />
        )}

        {neighbours.next ? (
          <Button variant="secondary" render={<Link href={neighbours.next.url} />}>
            <span>{neighbours.next.name}</span>
            <ArrowRight className="text-muted-foreground" />
          </Button>
        ) : (
          <div />
        )}
      </footer>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
