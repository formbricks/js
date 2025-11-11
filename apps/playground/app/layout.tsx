// Basic root layout for app router migration
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "../globals.css";

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="en" className="h-full bg-slate-50">
      <head>
        {/* Pass nonce to client for Formbricks */}
        <meta name="csp-nonce" content={nonce} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
