"use client"

import { useEffect } from "react"

/**
 * Radix UI dropdown / select / popover / dialog açıldığında, içeride kullanılan
 * `react-remove-scroll` kütüphanesi <body> elementine inline style ile
 * `padding-right` (ve bazı sürümlerde `margin-right`) ekleyerek native
 * scrollbar kaybolduğunda layout shift'i kompanse etmeye çalışır.
 *
 * Ancak biz `html { scrollbar-gutter: stable; overflow-y: scroll }`
 * tanımıyla scrollbar'ı her zaman görünür/rezerve tutuyoruz; bu nedenle
 * react-remove-scroll'un eklediği padding 1-2px ölçüsünde içeriği sola
 * kaydırıyor.
 *
 * react-remove-scroll inline style'ı `!important` ile yazdığı için CSS
 * tarafından override edilemiyor. Bu component MutationObserver ile
 * body inline style değişikliklerini izler ve bu padding/margin'leri
 * runtime'da siler.
 */
export function ScrollLockGuard() {
  useEffect(() => {
    if (typeof document === "undefined") return
    const body = document.body

    const strip = () => {
      if (body.style.paddingRight) body.style.paddingRight = ""
      if (body.style.marginRight) body.style.marginRight = ""
    }

    strip()
    const observer = new MutationObserver(strip)
    observer.observe(body, { attributes: true, attributeFilter: ["style"] })
    return () => observer.disconnect()
  }, [])

  return null
}
