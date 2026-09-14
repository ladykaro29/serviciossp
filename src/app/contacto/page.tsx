"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle2, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ContactoPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setSuccess(true)
        setFormData({ name: "", phone: "", email: "", subject: "", message: "" })
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Contact Hero */}
      <section className="bg-primary text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
            Atención Directa
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            Impulsa tu <br />
            <span className="text-secondary">Proyecto</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            ¿Tienes dudas técnicas o necesitas un presupuesto personalizado? Nuestro equipo de expertos está listo para asesorarte.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Side (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#041124]/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
              <h2 className="text-2xl font-black text-foreground mb-4">Canales Directos</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1">RIF de la Empresa</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed font-mono font-bold tracking-wider">J-40403649-0</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1">Sede Principal</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">El Vigía, Estado Mérida<br/>Venezuela</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1">Llámanos</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">0414-7550091 <br/> 0414-7433271</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1">Escríbenos</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed break-all">serviciosysuministrossp<br/>@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1">Horario</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">Lun - Vie: 8AM - 5PM<br/>Sábados: 9AM - 1PM</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-14 rounded-2xl gap-3 shadow-xl shadow-green-900/20" asChild>
                  <Link href="https://wa.me/584147550091" target="_blank">
                    <MessageCircle className="w-6 h-6" /> WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Form Side (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-[#041124]/30 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] border border-white/5 shadow-2xl h-full">
              <div className="max-w-xl">
                {success ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground mb-4 italic">¡Mensaje Enviado!</h2>
                    <p className="text-foreground/60 text-lg">Tu solicitud ha sido recibida. Un asesor de Servicios y Suministros SP te contactará en breve.</p>
                    <Button onClick={() => setSuccess(false)} variant="link" className="mt-8 text-secondary font-black uppercase tracking-widest">Enviar otro mensaje</Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-black text-foreground mb-4">Envíanos un mensaje</h2>
                    <p className="text-foreground/60 mb-10 text-lg">Cuéntanos sobre tu necesidad y un especialista te contactará en menos de 24 horas.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                          <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-white placeholder:text-white/20" 
                            placeholder="Ej. Juan Pérez" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">WhatsApp / Teléfono</label>
                          <input 
                            required
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-white placeholder:text-white/20" 
                            placeholder="Ej. 0414-XXXXXXX" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-white placeholder:text-white/20" 
                          placeholder="tu@correo.com" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Asunto de Interés</label>
                        <select 
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-white/70 appearance-none cursor-pointer"
                        >
                          <option className="bg-[#041124]" value="">Selecciona una opción</option>
                          <option className="bg-[#041124]" value="Sistemas Solares">Sistemas Solares (Paneles/Inversores)</option>
                          <option className="bg-[#041124]" value="Baterías / Respaldo">Baterías / Respaldo</option>
                          <option className="bg-[#041124]" value="Seguridad / CCTV">Sistemas de Seguridad / CCTV</option>
                          <option className="bg-[#041124]" value="Redes e Informática">Redes e Informática</option>
                          <option className="bg-[#041124]" value="Otro Requerimiento">Otro Requerimiento</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Descripción del requerimiento</label>
                        <textarea 
                          required
                          rows={5} 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-white placeholder:text-white/20 resize-none" 
                          placeholder="¿Cómo podemos ayudarte hoy?"
                        ></textarea>
                      </div>

                      <Button 
                        disabled={loading}
                        type="submit" 
                        className="w-full py-8 text-lg font-black bg-secondary hover:bg-secondary/90 text-white rounded-2xl gap-3 shadow-2xl shadow-secondary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {loading ? (
                          <>Procesando... <Loader2 className="w-6 h-6 animate-spin" /></>
                        ) : (
                          <>Solicitar Presupuesto <Send className="w-6 h-6" /></>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
