import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Battery, Users, ThumbsUp, Wrench, Play } from "lucide-react"

export function Hero() {
    return (
        <section className="relative bg-[#020813] min-h-[85vh] flex items-center pt-20 pb-32">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-dark text-secondary font-bold tracking-widest text-xs uppercase animate-in fade-in slide-in-from-left-4 duration-1000">
                            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                            Expertos en Energía Solar desde 2015
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white leading-[0.9] animate-in fade-in slide-in-from-left-6 duration-1000 delay-200">
                            Blindaje <br />
                            <span className="text-gradient">Energético</span> <br />
                            Total
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
                            No permitas que los cortes eléctricos detengan tu vida. Asegura la continuidad de tu hogar o empresa con tecnología solar de clase mundial y soporte técnico certificado en El Vigía.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-black px-10 h-16 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-secondary/20 transition-all hover:scale-105 active:scale-95" asChild>
                                <Link href="/productos">Explorar Catálogo <ArrowRight className="ml-2 w-5 h-5" /></Link>
                            </Button>
                            
                            <button className="group flex items-center gap-4 text-white font-bold hover:text-secondary transition-colors">
                                <div className="w-14 h-14 rounded-2xl glass-dark flex items-center justify-center group-hover:bg-secondary/20 transition-all">
                                    <Play className="w-6 h-6 fill-white group-hover:fill-secondary" />
                                </div>
                                <span className="text-sm uppercase tracking-widest">Ver Proyectos</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="flex-1 relative w-full max-w-2xl lg:max-w-none animate-in fade-in zoom-in duration-1000 delay-400">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                            <Image 
                                src="/hero-solar.png" 
                                alt="Solar Installation" 
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020813] via-transparent to-transparent opacity-60"></div>
                            
                            {/* Floating Card inside image */}
                            <div className="absolute bottom-8 left-8 right-8 glass-dark p-6 rounded-3xl border border-white/10 flex items-center gap-6">
                                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-white shrink-0">
                                    <ThumbsUp className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white">+500</div>
                                    <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Clientes Satisfechos</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Orbiting Elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 glass rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center text-center p-4 hidden md:flex animate-bounce duration-[3000ms]">
                            <Zap className="w-10 h-10 text-secondary mb-2" />
                            <div className="text-sm font-black text-white uppercase leading-none">Ahorro <br />Inmediato</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="absolute bottom-0 w-full transform translate-y-1/2 z-30">
                <div className="container mx-auto px-4">
                    <div className="glass-dark rounded-[3rem] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                                <Users className="w-8 h-8" />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">12 Años</h3>
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mt-2">De Experiencia Técnica</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-500 group border-y md:border-y-0 md:border-x border-white/5">
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">Garantía</h3>
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mt-2">En todos los equipos</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                                <Wrench className="w-8 h-8" />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">+1000</h3>
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mt-2">Obras Ejecutadas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

