import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOBIX Review",
  description: "Brutalist AI-powered media reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Unbounded + IBM Plex Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&family=IBM+Plex+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body bg-brand text-accent selection:bg-accent selection:text-highlight">
        {children}
      </body>
    </html>
  );
}
