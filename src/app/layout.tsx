import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Use Inter as bold industrial font
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ServiceWorkerRegister } from "@/components/providers/ServiceWorkerRegister";
import { InstallPwaBanner } from "@/components/layout/InstallPwaBanner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ff6200",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Servicios y Suministros SP - Energía y Seguridad",
  description: "Venta e instalación de inversores híbridos, paneles solares, cámaras de seguridad y sistemas cerrados.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Servicios SP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <AuthProvider>
          <CartProvider>
            <ServiceWorkerRegister />
            <InstallPwaBanner />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

