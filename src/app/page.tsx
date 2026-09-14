import { Hero } from "@/components/layout/Hero"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Shield, Wifi, Battery, Sun, Wrench, CheckCircle2, MessageCircle, BarChart3, Globe, ShieldCheck } from "lucide-react"

export default function Home() {
  const categories = [
    { name: "Energía Solar", icon: Sun, description: "Paneles y sistemas completos", href: "/productos?category=Energía Solar" },
    { name: "Inversores", icon: Zap, description: "Híbridos y Off-grid", href: "/productos?category=INVERSORES" },
    { name: "Baterías", icon: Battery, description: "Respaldo energético confiable", href: "/productos?category=BATERIAS" },
    { name: "Seguridad", icon: Shield, description: "Cámaras y monitoreo", href: "/productos?category=CAMARAS" },
    { name: "Redes", icon: Wifi, description: "Enlaces y conectividad", href: "/productos?category=ROUTER- SWITCH- REPETIDOR" },
    { name: "Servicios", icon: Wrench, description: "Instalación y mantenimiento", href: "/servicios" },
  ]

  const features = [
    {
      title: "Ingeniería de Vanguardia",
      description: "Utilizamos software de simulación para optimizar cada vatio de tu instalación solar.",
      icon: BarChart3
    },
    {
      title: "Respaldo Certificado",
      description: "Todos nuestros equipos cuentan con garantía oficial y soporte técnico local.",
      icon: ShieldCheck
    },
    {
      title: "Conectividad Total",
      description: "Monitorea tu consumo de energía y tus cámaras de seguridad desde tu smartphone.",
      icon: Globe
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Categories Grid */}
      <section className="pt-48 pb-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Soluciones que <span className="text-secondary">Transforman</span> <br />
                tu calidad de vida
              </h2>
              <p className="text-foreground/70 mt-4 text-lg">Invertir en energía solar y seguridad no es un gasto, es la libertad de no depender de factores externos. Equipamos tu espacio con lo mejor del mercado global.</p>
            </div>
            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white font-bold h-12 px-6 rounded-xl transition-all" asChild>
              <Link href="/productos">Ver Catálogo Completo <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.href} className="group block h-full">
                  <div className="glass-dark hover:bg-white/5 hover:shadow-[0_0_30px_rgba(255,98,0,0.1)] hover:-translate-y-2 transition-all duration-500 p-8 rounded-3xl border border-white/5 h-full flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-lg group-hover:text-secondary transition-colors">{cat.name}</h3>
                  <p className="text-[10px] text-foreground/60 leading-relaxed uppercase tracking-widest font-black">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Why Us with Image */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 relative order-2 lg:order-1">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-secondary rounded-[3rem] rotate-6 opacity-10"></div>
                <div className="absolute inset-0 border-2 border-primary/10 rounded-[3rem] -rotate-3"></div>
                <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                  <Image 
                    src="/technician-detail.png" 
                    alt="Technician work" 
                    fill 
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Experience Badge */}
              <div className="absolute -bottom-6 -right-6 lg:right-10 bg-white p-8 rounded-3xl shadow-2xl border border-border animate-bounce duration-[4000ms]">
                <div className="text-4xl font-black text-primary leading-none">10+</div>
                <div className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Años Líderes</div>
              </div>
            </div>

            <div className="flex-1 space-y-10 order-1 lg:order-2">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest rounded-full">
                  ¿Por qué Servicios y Suministros SP?
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                  Más que tecnología, <br />
                  brindamos <span className="text-secondary">Tranquilidad Real</span>
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed italic border-l-4 border-secondary pl-6">
                  "No solo vendemos equipos; diseñamos sistemas de respaldo que protegen lo que más valoras. En El Vigía, somos la garantía de que tu inversión está en manos expertas."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "Equipos Originales",
                  "Instalación en 48h",
                  "Garantía de Fábrica",
                  "Soporte Post-Venta",
                  "Financiamiento Disponible",
                  "Proyectos Llave en Mano"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-10 h-16 rounded-2xl shadow-xl transition-all hover:scale-105" asChild>
                  <Link href="/nosotros">Conoce Nuestra Historia</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Installations Gallery */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                Proyectos Ejecutados
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                Nuestras <span className="text-secondary">Instalaciones</span> <br />
                más recientes
              </h2>
              <p className="text-foreground/70 mt-4 text-lg">La mejor prueba de nuestra calidad es el trabajo terminado. Ingeniería aplicada con acabados de primera clase.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Respaldo Energético",
                category: "Inversores y Baterías",
                location: "Residencial El Vigía",
                image: "/inverter_installation_real_1776996300000_1776997524603.png"
              },
              {
                title: "Seguridad Inteligente",
                category: "Cámaras CCTV 4K",
                location: "Centro Comercial",
                image: "/cctv_installation_real_1776996300001_1776997539323.png"
              },
              {
                title: "Perímetro Blindado",
                category: "Cercas Eléctricas",
                location: "Hacienda Agropecuaria",
                image: "/electric_fence_installation_real_1776996300002_1776997554085.png"
              }
            ].map((project, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl border border-white/5">
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020813] via-[#020813]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">{project.category}</div>
                  <h3 className="text-2xl font-black text-white mb-2">{project.title}</h3>
                  <div className="flex items-center gap-2 text-white/50 text-sm font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {project.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-24 bg-white text-primary overflow-hidden relative border-y border-border">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-primary">
            ¿Listo para tomar el <span className="text-secondary">control</span> total?
          </h2>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto font-medium">
            Deja de preocuparte por la red eléctrica. Agenda una auditoría energética gratuita hoy mismo y descubre cómo podemos blindar tu propiedad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-black px-12 h-16 rounded-2xl text-lg shadow-xl shadow-secondary/20 transition-transform hover:scale-105" asChild>
              <Link href="/contacto">Contactar Ahora</Link>
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-black px-10 h-16 rounded-2xl text-lg shadow-xl shadow-green-900/20 transition-transform hover:scale-105 gap-3" asChild>
              <Link href="https://wa.me/584147550091" target="_blank" className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-white" /> <span>WhatsApp</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

