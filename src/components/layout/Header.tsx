"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, Mail, MapPin, Phone, Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"

export function Header() {
    const { totalItems } = useCart()

    return (
        <div className="w-full">
            {/* Top Bar - Navy Background */}
            <div className="bg-primary text-white py-2 text-[10px] uppercase tracking-widest border-b border-white/10 hidden md:block">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-secondary font-black">RIF:</span>
                            <span className="text-white/90 font-mono tracking-wider">J-40403649-0</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Mail className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                            <span className="text-white/80 group-hover:text-white transition-colors">serviciosysuministrossp@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <MapPin className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                            <span className="text-white/80 group-hover:text-white transition-colors">El Vigía, Mérida</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Phone className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                            <span className="text-white/80 group-hover:text-white transition-colors">0414-7550091</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                            <Link href="#" className="text-white/40 hover:text-secondary transition-colors"><Facebook className="w-3.5 h-3.5" /></Link>
                            <Link href="#" className="text-white/40 hover:text-secondary transition-colors"><Instagram className="w-3.5 h-3.5" /></Link>
                            <Link href="#" className="text-white/40 hover:text-secondary transition-colors"><Twitter className="w-3.5 h-3.5" /></Link>
                        </div>
                        <Link href="/cotizacion" className="font-black text-secondary hover:text-white transition-colors">Solicitar Cotización</Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation - Sticky */}
            <header className="sticky top-0 z-50 w-full bg-[#020813]/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group transition-transform hover:scale-105">
                        <Image 
                            src="/LogoServicios-SP.png" 
                            alt="Servicios y Suministros SP Logo" 
                            width={180} 
                            height={60} 
                            className="object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {[
                            { name: "Inicio", href: "/" },
                            { name: "Productos", href: "/productos" },
                            { name: "Servicios", href: "/servicios" },
                            { name: "Nosotros", href: "/nosotros" },
                            { name: "Contacto", href: "/contacto" },
                        ].map((item) => (
                            <Link 
                                key={item.name}
                                href={item.href} 
                                className="text-[11px] uppercase tracking-[0.2em] font-black text-white/70 hover:text-secondary transition-all relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link href="/cotizacion">
                            <Button variant="ghost" size="icon" className="relative text-white hover:text-secondary hover:bg-white/5 h-12 w-12 rounded-2xl">
                                <ShoppingCart className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                        {totalItems}
                                    </span>
                                )}
                            </Button>
                        </Link>
                        
                        <Button className="hidden sm:flex bg-secondary hover:bg-secondary/90 text-white font-black px-6 h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-secondary/10" asChild>
                            <Link href="/contacto">Consulta Gratis</Link>
                        </Button>

                        {/* Mobile Menu Trigger */}
                        <Button variant="ghost" size="icon" className="lg:hidden text-white h-12 w-12 rounded-2xl hover:bg-white/5">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </header>
        </div>
    )
}

