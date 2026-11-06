"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone, Share } from "lucide-react"

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showAndroidBanner, setShowAndroidBanner] = useState(false)
  const [showIosBanner, setShowIosBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) return

    // Android / Chromium PWA trigger
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowAndroidBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // iOS Safari detection
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isIos && isSafari && !isStandalone) {
      // Show iOS instruction banner only on mobile devices
      setShowIosBanner(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowAndroidBanner(false)
    }
    setDeferredPrompt(null)
  }

  if (dismissed) return null

  if (showAndroidBanner && deferredPrompt) {
    return (
      <aside aria-label="Instalar aplicación" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-[#071329] border border-secondary/40 text-white p-4 rounded-3xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">Instalar App en tu Teléfono</h4>
              <p className="text-[11px] text-white/60">
                Accede más rápido y úsala a pantalla completa como una app nativa.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
          <button
            onClick={() => setDismissed(true)}
            className="flex-1 px-3 py-2 text-xs font-bold text-white/60 hover:text-white bg-white/5 rounded-xl"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 px-4 py-2 text-xs font-black text-slate-950 bg-secondary hover:bg-secondary/90 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-secondary/20"
          >
            <Download className="w-4 h-4" /> Instalar App
          </button>
        </div>
      </aside>
    )
  }

  if (showIosBanner) {
    return (
      <aside aria-label="Instalar en iPhone" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-[#071329] border border-secondary/40 text-white p-4 rounded-3xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
              <Share className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">Instalar en tu iPhone</h4>
              <p className="text-[11px] text-white/70 mt-1">
                Toca el botón <strong>Compartir (⎋)</strong> en la barra de Safari y selecciona <strong>&quot;Agregar al inicio&quot; (➕)</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    )
  }

  return null
}

