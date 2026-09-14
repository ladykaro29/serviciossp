import Link from "next/link"
import { ArrowRight, Sun, Zap, Home, Settings } from "lucide-react"

export function ServicesSection() {
    const services = [
        {
            title: "Instalación de Paneles",
            description: "Generando tu propia electricidad del sol, puedes reducir significativamente tus facturas mensuales.",
            icon: Sun,
            link: "#"
        },
        {
            title: "Sistemas de Energía",
            description: "Sistemas híbridos y off-grid que te mantienen conectado cuando la red eléctrica falla.",
            icon: Zap,
            link: "#"
        },
        {
            title: "Paneles Residenciales",
            description: "Soluciones estéticas y eficientes diseñadas específicamente para techos residenciales.",
            icon: Home,
            link: "#"
        },
        {
            title: "Mantenimiento y Limpieza",
            description: "Asegura la máxima eficiencia de tu sistema con nuestros planes de mantenimiento anual.",
            icon: Settings,
            link: "#"
        }
    ]

    return (
        <section className="py-24 bg-primary text-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-block px-3 py-1 bg-secondary text-white text-xs font-bold uppercase rounded-sm mb-4">
                            Nuestros Servicios
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Soluciones solares completas <br />
                            con servicios de reparación
                        </h2>
                        <p className="mt-4 text-gray-400">
                            Estamos encontrando formas de llevar energía a más personas de más maneras, porque potenciar el progreso significa proporcionar el respaldo necesario.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors">
                            &lt;
                        </button>
                        <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors">
                            &gt;
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, i) => (
                        <div key={i} className="bg-white text-primary p-8 rounded-lg group hover:-translate-y-2 transition-transform duration-300">
                            <div className="mb-6">
                                <service.icon className="w-12 h-12 text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                {service.description}
                            </p>
                            <Link href={service.link} className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-primary hover:text-secondary hover:underline transition-colors decoration-2 underline-offset-4">
                                Leer Más
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
