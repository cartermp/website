'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ShareButton({ date }: { date: string }) {
  const [isSharing, setIsSharing] = useState(false)
  const router = useRouter()

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const shareUrl = `/caltrack/share/${date}`
      await router.push(shareUrl)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
        transition-colors flex items-center justify-center sm:justify-start gap-2"
    >
      {isSharing ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sharing...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          <span className="hidden sm:inline">Share Today&apos;s Report</span>
          <span className="sm:hidden">Share</span>
        </>
      )}
    </button>
  )
}
