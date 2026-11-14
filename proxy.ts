import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';

const { rewrite: rewriteDocsMp } = rewritePath(
  `${docsRoute}/*path`,
  `${docsContentRoute}/*path/content.md`,
);

const { rewrite: rewriteSuffixMd } = rewritePath(
  `${docsRoute}/*path.md`,
  `${docsContentRoute}/*path/content.md`,
);

function isShadcnCliRequest(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';
  return (
    accept.includes('application/vnd.shadcn.v1+json') ||
    userAgent === 'shadcn' ||
    userAgent.startsWith('shadcn/')
  );
}

const addVaryHeaders = (response: NextResponse) => {
  response.headers.set('Vary', 'Accept, User-Agent');
  return response;
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isShadcnCliRequest(request) && !pathname.startsWith('/r/')) {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const targetItem = lastSegment || 'all';
    const destination = targetItem.endsWith('.json')
      ? `/r/${targetItem}`
      : `/r/${targetItem}.json`;

    return addVaryHeaders(
      NextResponse.rewrite(new URL(destination, request.nextUrl)),
    );
  }

  if (pathname.endsWith('.md')) {
    const result = rewriteSuffixMd(pathname);
    if (result) {
      return addVaryHeaders(
        NextResponse.rewrite(new URL(result, request.nextUrl)),
      );
    }
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocsMp(pathname);
    if (result) {
      return addVaryHeaders(
        NextResponse.rewrite(new URL(result, request.nextUrl)),
      );
    }
  }

  return addVaryHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|og|llms).*)'],
};
