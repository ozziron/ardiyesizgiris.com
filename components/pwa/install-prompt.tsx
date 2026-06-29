"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault()
    setDeferredPrompt(e as BeforeInstallPromptEvent)
    // Show after a short delay so the page has loaded
    setTimeout(() => setVisible(true), 2000)
  }, [])

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Check if user previously dismissed
    const dismissedAt = sessionStorage.getItem("pwa-install-dismissed")
    if (dismissedAt) {
      const ms = Date.now() - Number(dismissedAt)
      if (ms < 24 * 60 * 60 * 1000) return // don't show again for 24h
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [handleBeforeInstallPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
    if (outcome === "accepted") {
      sessionStorage.removeItem("pwa-install-dismissed")
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem("pwa-install-dismissed", String(Date.now()))
  }

  if (!visible || dismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl bg-white p-4 shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Download className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Uygulamayı Yükle
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Ardiyesiz Giriş'i cihazınıza ekleyerek daha hızlı erişin.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall} className="h-8 text-xs">
              Yükle
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 text-xs"
            >
              Şimdi Değil
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
