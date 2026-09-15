import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nawemedia.com"),
  title: "NAWEMEDIA · Formulario de Onboarding DJ",
  description: "Completá tus datos y material para que NAWEMEDIA construya tu Electronic Press Kit.",
  alternates: {
    canonical: "https://www.nawemedia.com/press-kit-web_formulario-DJ",
  },
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
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
