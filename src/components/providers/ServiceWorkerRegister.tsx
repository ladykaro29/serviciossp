"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(registration => {
            console.log("✅ PWA Service Worker registrado con éxito:", registration.scope)
          })
          .catch(err => {
            console.warn("⚠️ PWA Service Worker fallo al registrar:", err)
          })
      })
    }
  }, [])

  return null
}
