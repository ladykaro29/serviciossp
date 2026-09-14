import { CheckCircle2, Sun, Zap, ShieldCheck, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AboutSection() {
    const points = [
        "Ahorro Energético Inmediato",
        "Ecológico y Sostenible",
        "Aumenta el Valor de tu Propiedad",
        "Independencia Eléctrica Real"
    ]

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 mt-20"> {/* Margin top to account for overlapping hero stats */}
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left: Visual Collage */}
                    <div className="flex-1 relative">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-6 pt-12">
                                <div className="w-full h-48 bg-card/50 rounded-[2rem] border border-white/5 flex items-center justify-center group overflow-hidden">
                                    <Sun className="w-12 h-12 text-secondary/20 group-hover:text-secondary group-hover:scale-110 transition-all duration-500" />
                                </div>
                                <div className="w-full h-64 bg-secondary/5 rounded-[2rem] border border-secondary/10 flex items-center justify-center group overflow-hidden">
                                    <Zap className="w-16 h-16 text-secondary/20 group-hover:text-secondary group-hover:rotate-12 transition-all duration-500" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="w-full h-64 bg-primary/20 rounded-[2rem] border border-white/5 flex items-center justify-center group overflow-hidden">
                                    <ShieldCheck className="w-16 h-16 text-white/5 group-hover:text-secondary group-hover:scale-110 transition-all duration-500" />
                                </div>
                                <div className="w-full h-48 bg-card/50 rounded-[2rem] border border-white/5 flex items-center justify-center group overflow-hidden">
                                    <Battery className="w-12 h-12 text-white/5 group-hover:text-secondary transition-all duration-500" />
                                </div>
                            </div>
                        </div>

                        {/* Center Seal */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass p-4 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                            <div className="w-28 h-28 bg-green-500 rounded-full flex flex-col items-center justify-center text-white font-black text-center text-[10px] p-4 uppercase tracking-tighter shadow-inner">
                                100% Energía Limpia
                            </div>
                        </div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="flex-1 space-y-8">
                        <div className="inline-block px-4 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-secondary/20">
                            Sobre Nosotros
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight">
                            Tu Aliado Estratégico en <br />
                            <span className="text-secondary">Continuidad Operativa</span>
                        </h2>
                        <p className="text-foreground/70 text-lg leading-relaxed">
                            En Servicios y Suministros SP no instalamos paneles; instalamos libertad. Nos especializamos en blindar hogares y empresas contra la inestabilidad eléctrica, utilizando ingeniería de precisión para que nunca más vuelvas a quedarte a oscuras.
                        </p>

                        <div className="space-y-4">
                            <h3 className="font-black text-foreground/50 text-[10px] uppercase tracking-[0.2em]">¿Qué nos hace diferentes?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                {points.map((point, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                                            <CheckCircle2 className="w-5 h-5 text-secondary group-hover:text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground/80">{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button className="bg-secondary hover:bg-secondary/90 text-white px-10 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-secondary/20" asChild>
                                <Link href="/contacto">Contactar Ahora</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

