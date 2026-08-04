import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({ // Titulos
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const manrope = Manrope({ // Parrafos
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NexoPixel X",
  description: "Landing Page",
  openGraph: {
    title: 'Nexo Pixel | Transformamos tu visión en realidad',
    description: 'Desarrollamos soluciones web, móviles y de escritorio diseñadas para escalar tu marca, optimizar tus procesos y ofrecer la mejor experiencia a tus usuarios.',
    url: 'https://nexo-pixel-x.vercel.app',
    siteName: 'Nexo Pixel',
    images: [
      {
        url: 'https://nexo-pixel-x.vercel.app', 
        width: 1200,
        height: 630,
        alt: 'Portada de Nexo Pixel',
      },
    ],
    locale: 'es_VE',
    type: 'website',
  },
};

export default async function RootLayout({
children,
params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {

  const { locale } = await params;

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Header></Header>
          {children}
          <Footer></Footer>
          </NextIntlClientProvider>
      </body>
    </html>
  );
}