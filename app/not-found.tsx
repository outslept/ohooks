import Link from "next/link";
import { ArrowLeft, BookOpen, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 py-24 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-2.5 text-ui leading-relaxed text-muted-foreground">
          The hook or documentation page you are looking for doesn&apos;t exist, was renamed, or has
          been moved.
        </p>

        <div className="mt-6 w-full overflow-hidden rounded-lg border border-default bg-code text-left font-mono text-xs shadow-2xs">
          <div className="flex items-center justify-between border-b border-subtle bg-code-header px-3.5 py-2 text-2xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Terminal className="size-3" />
              registry
            </span>
            <span>status 404</span>
          </div>
          <div className="space-y-1.5 p-3.5 leading-relaxed">
            <div className="text-muted-foreground">
              <span className="select-none text-secondary">$ </span>
              npx shadcn@latest list @ohook
            </div>
            <div className="text-destructive">
              Error: The requested resource could not be resolved in registry.
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Button variant="primary" leadingIcon={<ArrowLeft />} render={<Link href="/" />}>
            Back to Docs
          </Button>

          <Button variant="secondary" leadingIcon={<BookOpen />} render={<Link href="/llms.txt" />}>
            llms.txt
          </Button>
        </div>
      </div>
    </main>
  );
}
