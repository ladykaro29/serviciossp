import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter as bold industrial font
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Servicios y Suministros SP - Energía y Seguridad",
  description: "Venta e instalación de inversores híbridos, paneles solares, cámaras de seguridad y sistemas cerrados.",
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
        <CartProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

