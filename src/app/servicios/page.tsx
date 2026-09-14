import { Wrench, ShieldCheck, Zap, Wifi, Camera, Sun, PenTool as Tool, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ServiciosPage() {
  const services = [
    {
      title: "Instalación de Energía Solar",
      icon: Sun,
      description: "Diseño y montaje completo de sistemas fotovoltaicos, desde paneles hasta bancos de baterías de litio o gel.",
      features: ["Estudio de carga", "Instalación de inversores", "Certificación de eficiencia"]
    },
    {
      title: "Sistemas de Seguridad CCTV",
      icon: Camera,
      description: "Implementación de redes de monitoreo con cámaras IP y analógicas de alta resolución con acceso remoto.",
      features: ["Configuración de DVR/NVR", "Detección de movimiento", "Visión nocturna a color"]
    },
    {
      title: "Redes y Conectividad",
      icon: Wifi,
      description: "Enlaces inalámbricos de larga distancia, redes mesh y estructurado de cableado para empresas y hogares.",
      features: ["Enlaces punto a punto", "Configuración de routers AX", "Optimización de cobertura"]
    },
    {
      title: "Mantenimiento Preventivo",
      icon: Tool,
      description: "Planes de revisión periódica para asegurar que tus sistemas de energía y seguridad operen al 100%.",
      features: ["Limpieza de paneles", "Prueba de baterías", "Limpieza de lentes y sensores"]
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary/20 opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Servicios de <span className="text-gradient">Élite</span></h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Ingeniería de precisión aplicada a tu seguridad y autonomía energética. No solo instalamos equipos, construimos sistemas de alta resiliencia.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {services.map((service, i) => (
              <div key={i} className="group glass-dark p-10 rounded-[2.5rem] border border-white/5 hover:border-secondary transition-all duration-500 shadow-2xl hover:shadow-secondary/10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-3 group-hover:text-secondary transition-colors uppercase tracking-tight">{service.title}</h2>
                    <p className="text-foreground/70 mb-6 leading-relaxed italic font-medium">
                      {service.description}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-black text-foreground/80">
                          <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="bg-[#041124]/50 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 flex items-center gap-4">
                <Clock className="w-10 h-10 text-secondary" />
                ¿Soporte técnico urgente?
              </h2>
              <p className="text-foreground/70 text-lg leading-relaxed">
                Nuestro equipo de élite está disponible para resolver fallas críticas en tus sistemas de seguridad o energía de forma inmediata.
              </p>
            </div>
            <div className="shrink-0">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-black px-12 h-16 rounded-2xl text-lg shadow-2xl shadow-secondary/20" asChild>
                <Link href="https://wa.me/584147550091" target="_blank">Llamar Ahora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

