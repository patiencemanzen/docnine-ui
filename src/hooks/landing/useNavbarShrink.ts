import { useEffect, useState } from "react"

export function useNavbarShrink(threshold = 20) {
  const [shrunk, setShrunk] = useState(false)

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > threshold)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return shrunk
}
