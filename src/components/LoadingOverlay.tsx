interface LoadingOverlayProps {
  message?: string
}

export default function LoadingOverlay({ message = 'Isso pode demorar alguns segundos!' }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50"
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      <div className="bg-[var(--surf)] border border-[var(--bdr)] rounded-2xl shadow-xl px-8 py-6 max-w-sm text-center">
        <div className="w-10 h-10 border-2 border-[#2F523E] dark:border-[#3dd68c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text)] font-medium">{message}</p>
      </div>
    </div>
  )
}
