// Basic root layout for app router migration
import type { ReactNode } from "react";
import "../globals.css";

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full">{children}</body>
    </html>
  );
}
