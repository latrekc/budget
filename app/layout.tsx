import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Budget",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full bg-white" lang="en">
      <body className="h-full">
        <div className="min-h-full">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
