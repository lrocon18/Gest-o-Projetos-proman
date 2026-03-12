import { useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Logo Grupo Proman Engenharia (imagem oficial: círculo verde, GRUPO PROMAN® Engenharia).
 */
export default function Logo({ className = '' }: { className?: string }) {
  const [imgError, setImgError] = useState(false)
  const pathname = useLocation().pathname
  const base = pathname.split('/').filter(Boolean)[0]
  const logoSrc = base ? `/${base}/logo.png` : '/logo.png'

  if (imgError) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-xs uppercase tracking-wider text-[var(--muted)]">Grupo</span>
        <span className="text-xl font-black uppercase text-[#2F523E] dark:text-[#3dd68c]">Proman</span>
        <span className="text-sm italic text-[#E58B2E]">Engenharia</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 bg-transparent ${className}`}>
      <img
        src={logoSrc}
        alt="Grupo Proman Engenharia"
        className="h-12 w-auto max-h-14 object-contain flex-shrink-0 bg-transparent"
        style={{ background: 'transparent' }}
        onError={() => setImgError(true)}
      />
    </div>
  )
}
