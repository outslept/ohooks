import { createMDX } from 'fumadocs-mdx/next';
import pierreDark from '@pierre/theme/pierre-dark-vibrant';
import pierreLight from '@pierre/theme/pierre-light-vibrant';

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
  reactStrictMode: true,
};

export default withMDX(config);
