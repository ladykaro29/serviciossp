import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="relative mt-20 border-t border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-[#020813]"></div>
            <div className="absolute inset-0 bg-mesh opacity-30"></div>
            
            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <Image 
                                src="/LogoServicios-SP.png" 
                                alt="Servicios y Suministros SP Logo" 
                                width={180} 
                                height={60} 
                                className="object-contain brightness-110"
                            />
                        </Link>
                        <p className="text-sm text-white/60 leading-relaxed italic">
                            Blindamos tu hogar y empresa con tecnología de élite en energía y seguridad. Expertos en continuidad operativa en El Vigía.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-6">Explorar</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li><Link href="/productos" className="hover:text-secondary hover:pl-2 transition-all">Catálogo de Productos</Link></li>
                            <li><Link href="/servicios" className="hover:text-secondary hover:pl-2 transition-all">Servicios de Ingeniería</Link></li>
                            <li><Link href="/nosotros" className="hover:text-secondary hover:pl-2 transition-all">Nuestra Historia</Link></li>
                            <li><Link href="/cotizacion" className="hover:text-secondary hover:pl-2 transition-all">Solicitar Presupuesto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-6">Soluciones</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li><Link href="/productos" className="hover:text-secondary transition-all">Energía Solar</Link></li>
                            <li><Link href="/productos" className="hover:text-secondary transition-all">CCTV y Seguridad</Link></li>
                            <li><Link href="/productos" className="hover:text-secondary transition-all">Respaldo Eléctrico</Link></li>
                            <li><Link href="/productos" className="hover:text-secondary transition-all">Redes e IT</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-6">Contacto</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li className="flex flex-col">
                                <span className="text-[10px] text-secondary font-black uppercase">RIF</span>
                                <span className="text-white/80 font-mono tracking-wider font-semibold">J-40403649-0</span>
                            </li>
                            <li className="flex flex-col">
                                <span className="text-[10px] text-secondary font-black uppercase">Email</span>
                                <span className="text-white/80">serviciosysuministrossp@gmail.com</span>
                            </li>
                            <li className="flex flex-col">
                                <span className="text-[10px] text-secondary font-black uppercase">Teléfonos</span>
                                <span className="text-white/80">0414-7550091 / 0414-7433271</span>
                            </li>
                            <li className="flex flex-col">
                                <span className="text-[10px] text-secondary font-black uppercase">Ubicación</span>
                                <span className="text-white/80">El Vigía, Estado Mérida</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black">
                    <div className="text-white/30 text-center md:text-left">
                        © {new Date().getFullYear()} Servicios y Suministros SP. RIF: J-40403649-0. Ingeniería de Vanguardia.
                    </div>
                    <div className="text-white/30">
                        Desarrollado por <Link href="https://kickoffdevelopment.com/" target="_blank" className="text-secondary hover:text-white transition-colors">Kickoff Development</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
