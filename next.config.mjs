import { createMDX } from "fumadocs-mdx/next";
import pierreDark from "@pierre/theme/pierre-dark-vibrant";
import pierreLight from "@pierre/theme/pierre-light-vibrant";

const withMDX = createMDX({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: pierreLight,
        dark: pierreDark,
      },
      defaultColor: false,
    },
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
