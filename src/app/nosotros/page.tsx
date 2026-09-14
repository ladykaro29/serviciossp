import { AboutSection } from "@/components/layout/AboutSection"
import { Shield, Target, Eye } from "lucide-react"

export default function NosotrosPage() {
  const values = [
    {
      title: "Misión",
      icon: Target,
      description: "Proveer soluciones integrales en seguridad, energía y conectividad que impulsen el progreso y la tranquilidad de nuestros clientes."
    },
    {
      title: "Visión",
      icon: Eye,
      description: "Ser líderes en la región en la implementación de tecnologías sostenibles y sistemas de protección de vanguardia."
    },
    {
      title: "Valores",
      icon: Shield,
      description: "Compromiso, innovación y excelencia técnica en cada uno de nuestros proyectos y suministros."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-black mb-4 tracking-tight">Nuestra Empresa</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Más de una década brindando soluciones tecnológicas confiables para hogares y empresas.
          </p>
        </div>
      </div>

      <AboutSection />

      {/* Mission/Vision/Values */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((item, i) => (
              <div key={i} className="bg-[#041124]/50 backdrop-blur-xl p-10 rounded-[2rem] border border-white/5 hover:border-secondary/50 shadow-2xl transition-all duration-500 group">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <item.icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tight">{item.title}</h2>
                <p className="text-foreground/70 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">
              Talento Especializado
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
              Los expertos detrás de <br />
              tu <span className="text-secondary">tranquilidad</span>
            </h2>
            <p className="text-foreground/70 text-lg">
              Contamos con un equipo multidisciplinario de ingenieros y técnicos certificados apasionados por la innovación y la excelencia técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Ing. Samuel Pérez",
                role: "Director de Proyectos",
                desc: "Especialista en sistemas fotovoltaicos con más de 10 años de experiencia en ingeniería eléctrica.",
                initial: "S"
              },
              {
                name: "Téc. Luis Méndez",
                role: "Jefe de Instalaciones",
                desc: "Experto en despliegue de redes de seguridad CCTV y conectividad industrial de largo alcance.",
                initial: "L"
              },
              {
                name: "Ing. María García",
                role: "Asesoría Energética",
                desc: "Responsable de estudios de carga y optimización de sistemas de respaldo para el sector comercial.",
                initial: "M"
              },
              {
                name: "Téc. Carlos Rivas",
                role: "Soporte Técnico 24/7",
                desc: "Líder del equipo de mantenimiento preventivo y respuesta rápida ante fallas críticas.",
                initial: "C"
              }
            ].map((member, i) => (
              <div key={i} className="group bg-[#041124]/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-secondary/50 transition-all duration-500 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {member.initial}
                </div>
                <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-secondary transition-colors">{member.name}</h3>
                <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Stats */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-black text-secondary tracking-tighter">+500</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-black">Clientes Felices</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-secondary tracking-tighter">+1000</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-black">Instalaciones</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-secondary tracking-tighter">12</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-black">Años Exp.</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-secondary tracking-tighter">24/7</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-black">Soporte</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

