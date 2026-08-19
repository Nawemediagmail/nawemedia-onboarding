import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAWEMEDIA · Formulario de Onboarding DJ",
  description: "Completá tus datos y material para que NAWEMEDIA construya tu Electronic Press Kit.",
  openGraph: {
    title: "NAWEMEDIA · Formulario de Onboarding DJ",
    description: "Completá tus datos y material para que NAWEMEDIA construya tu Electronic Press Kit.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
