import { ApiKeysContent } from '../components/ApiKeysContent'
import { Suspense } from 'react'
import Loading from '../loading'

export const revalidate = 0
export const dynamic = "force-dynamic"

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading />}>
        <ApiKeysContent />
      </Suspense>
    </div>
  )
}