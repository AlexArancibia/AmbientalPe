import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "AMBIENTALPE - Sistema de Monitoreo Ambiental",
    template: "%s | AMBIENTALPE",
  },
  description:
    "Sistema integral de gestión y monitoreo ambiental para empresas. Gestión de equipos, cotizaciones, órdenes de servicio y reportes de cumplimiento ambiental.",
  keywords: [
    "monitoreo ambiental",
    "gestión ambiental",
    "equipos ambientales",
    "cotizaciones",
    "órdenes de servicio",
    "reportes ambientales",
    "cumplimiento ambiental",
    "calibración equipos",
  ],
  authors: [{ name: "AMBIENTALPE Team" }],
  creator: "AMBIENTALPE",
  publisher: "AMBIENTALPE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL!),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.SITE_URL!,
    title: "AMBIENTALPE - Sistema de Monitoreo Ambiental",
    description:
      "Sistema integral de gestión y monitoreo ambiental para empresas. Gestión de equipos, cotizaciones y reportes de cumplimiento.",
    siteName: "AMBIENTALPE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AMBIENTALPE - Sistema de Monitoreo Ambiental",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMBIENTALPE - Sistema de Monitoreo Ambiental",
    description:
      "Sistema integral de gestión y monitoreo ambiental para empresas. Gestión de equipos, cotizaciones y reportes de cumplimiento.",
    images: ["/og-image.jpg"],
    creator: "@ambientalpe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  return {
    title: title ? `${title} | AMBIENTALPE` : defaultMetadata.title,
    description: description || defaultMetadata.description,
    keywords: keywords || defaultMetadata.keywords,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title || defaultMetadata.openGraph?.title,
      description: description || defaultMetadata.openGraph?.description,
      images: image ? [{ url: image }] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title || defaultMetadata.twitter?.title,
      description: description || defaultMetadata.twitter?.description,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
  };
}
