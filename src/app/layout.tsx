import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Akse Digital | Gebze Dijital Ajans — Web Tasarım & Mobil Uygulama",
    template: "%s | Akse Digital",
  },
  description:
    "Kocaeli Gebze merkezli dijital ajans. Web tasarım, mobil uygulama geliştirme, SEO, sosyal medya yönetimi ve dijital pazarlama hizmetleri.",
  keywords: [
    "Gebze dijital ajans",
    "Gebze web tasarım",
    "Kocaeli web sitesi",
    "mobil uygulama geliştirme",
    "SEO hizmeti Gebze",
    "dijital pazarlama Kocaeli",
  ],
  metadataBase: new URL("https://aksedigital.com"),
  openGraph: {
    title: "Akse Digital | Gebze Dijital Ajans",
    description:
      "Web tasarım, mobil uygulama, SEO ve dijital pazarlama çözümleri. Gebze, Kocaeli.",
    url: "https://aksedigital.com",
    siteName: "Akse Digital",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Akse Digital",
              description:
                "Gebze merkezli dijital ajans. Web tasarım, mobil uygulama, SEO hizmetleri.",
              url: "https://aksedigital.com",
              telephone: "+90 555 000 0000",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Gebze",
                addressRegion: "Kocaeli",
                addressCountry: "TR",
              },
              areaServed: ["Gebze", "Kocaeli", "İstanbul"],
              serviceType: [
                "Web Tasarım",
                "Mobil Uygulama",
                "SEO",
                "Dijital Pazarlama",
                "Sosyal Medya Yönetimi",
                "E-Ticaret",
              ],
            }),
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
