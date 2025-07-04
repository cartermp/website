'use client'

import { useState, useEffect } from 'react'

interface ApiKey {
  id: number
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface GeneratedApiKey extends ApiKey {
  token: string
}

export function ApiKeysContent() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<GeneratedApiKey | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/caltrack/api-keys/list')
      const data = await response.json()
      
      if (data.success) {
        setApiKeys(data.api_keys)
      } else {
        setError('Failed to load API keys')
      }
    } catch (err) {
      setError('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for your API key')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/caltrack/api-keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedKey(data.api_key)
        setNewKeyName('')
        setShowModal(false)
        loadApiKeys()
      } else {
        setError(data.error || 'Failed to generate API key')
      }
    } catch (err) {
      setError('Failed to generate API key')
    } finally {
      setGenerating(false)
    }
  }

  const revokeApiKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/caltrack/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        loadApiKeys()
      } else {
        setError(data.error || 'Failed to revoke API key')
      }
    } catch (err) {
      setError('Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage API keys to access your CalTrack data from external applications.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {generatedKey && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 p-6 rounded mb-6">
          <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200">
            API Key Generated Successfully!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Copy this API key now - you won&apos;t be able to see it again.
          </p>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-sm break-all">
            {generatedKey.token}
          </div>
          <button
            onClick={() => copyToClipboard(generatedKey.token)}
            className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={() => setGeneratedKey(null)}
            className="mt-3 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            Done
          </button>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Generate New API Key
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Your API Keys</h2>
        </div>
        
        {apiKeys.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No API keys created yet. Generate your first API key to get started.
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{key.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {formatDate(key.created_at)}
                  </p>
                  {key.last_used_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last used: {formatDate(key.last_used_at)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => revokeApiKey(key.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Using Your API Key</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Include your API key in the request header when calling the CalTrack API:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
{`curl -H "x-api-key: YOUR_API_KEY" \\
     https://yoursite.com/api/v1/caltrack/export/entries`}
        </pre>
        <div className="mt-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Available endpoints:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
            <li>/export/entries</li>
            <li>/export/daily-stats</li>
            <li>/export/summary</li>
            <li>/analytics/trends</li>
            <li>/analytics/patterns</li>
            <li>/analytics/foods</li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate New API Key</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                API Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Mobile App, Dashboard, etc."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                maxLength={100}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateApiKey}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setNewKeyName('')
                  setError('')
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}