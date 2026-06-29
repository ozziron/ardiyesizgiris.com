"use client"

import { useState, useEffect, useCallback } from "react"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [justCameOnline, setJustCameOnline] = useState(false)

  const handleOnline = useCallback(() => {
    setOffline(false)
    setJustCameOnline(true)
    setShowBanner(true)
    setTimeout(() => {
      setShowBanner(false)
      setJustCameOnline(false)
    }, 3000)
  }, [])

  const handleOffline = useCallback(() => {
    setOffline(true)
    setJustCameOnline(false)
    setShowBanner(true)
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined") return

    setOffline(!navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  if (!showBanner) return null

  if (offline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md animate-in slide-in-from-top-2 duration-200">
        <WifiOff className="h-4 w-4" />
        <span>İnternet bağlantısı kesildi. Bazı özellikler kullanılamayabilir.</span>
      </div>
    )
  }

  if (justCameOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md animate-in slide-in-from-top-2 duration-200">
        <Wifi className="h-4 w-4" />
        <span>İnternet bağlantısı geri geldi.</span>
      </div>
    )
  }

  return null
}
