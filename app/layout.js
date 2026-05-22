import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata = {
  title: "PRDbot - Automated Enforcer",
  description:
    "AI-powered GitHub issue validation that ensures every task aligns with your product requirements. Stop shipping misaligned features.",
  openGraph: {
    title: "PRDbot - Automated Enforcer",
    description: "AI-powered GitHub issue validation that ensures every task aligns with your product requirements.",
    url: "https://prdbot.vercel.app",
    siteName: "PRDbot",
    images: [
      {
        url: "https://prdbot.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRDbot - Automated Enforcer",
    description: "AI-powered GitHub issue validation that ensures every task aligns with your product requirements.",
    images: ["https://prdbot.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark h-full antialiased">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:wght@100..900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col bg-gh-bg text-gh-text-main">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
