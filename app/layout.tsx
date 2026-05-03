import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RedResizer — Free RedBubble Image Resizer",
  description: "Resize any image to exact RedBubble product dimensions in seconds. Free, no signup, works in your browser. T-shirts, stickers, posters and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
