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
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
        transition-colors flex items-center gap-2"
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
        'Share Today\'s Report'
      )}
    </button>
  )
}
