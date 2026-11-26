import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { SizeProvider } from "@/context/size-context";
import { appDescription, appName, appUrl } from "@/lib/shared";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: appName,
    title: appName,
    description: appDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <RootProvider>
          <SizeProvider defaultSize="default">{children}</SizeProvider>
        </RootProvider>
      </body>
    </html>
  );
}
