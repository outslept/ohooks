import { createHighlights } from "fumadocs-core/highlight/highlights";
import { rehypeCodeFromHighlighter } from "fumadocs-core/mdx-plugins/rehype-code.core";
import { createMDX } from "fumadocs-mdx/next";
import { pierreDark, pierreLight } from "@pierre/highlights/themes";

const highlighter = createHighlights({
  themes: {
    light: pierreLight,
    dark: pierreDark,
  },
});

const withMDX = createMDX({
  mdxOptions: {
    rehypeCodeOptions: false,
    rehypePlugins: (v) => [
      () =>
        rehypeCodeFromHighlighter(({ transformers }) =>
          highlighter.override({ shikiTransformers: transformers }),
        ),
      ...v,
    ],
  },
});

/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), fullscreen=(self), screen-wake-lock=(self), clipboard-write=(self)",
          },
        ],
      },
    ];
  },
};

export default withMDX(config);
