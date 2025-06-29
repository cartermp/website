import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    root = null
    rootMargin = ''
    thresholds = []
}

// Mock for React 19 compatibility
global.React = {
    ...global.React,
    useTransition: () => [false, jest.fn()],
    useDeferredValue: (value) => value,
}

// Mock Web APIs for Next.js API routes
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// Simple mocks for Web APIs
global.Request = class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url
    this.method = init.method || 'GET'
    this.headers = new Map()
    if (init.headers) {
      if (init.headers instanceof Map) {
        this.headers = new Map(init.headers)
      } else if (typeof init.headers.entries === 'function') {
        for (const [key, value] of init.headers.entries()) {
          this.headers.set(key, value)
        }
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
    }
  }
  
  headers = {
    get: jest.fn((key) => this.headers.get(key)),
    set: jest.fn((key, value) => this.headers.set(key, value)),
    has: jest.fn((key) => this.headers.has(key)),
  }
}

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map()
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value)
      })
    }
  }
  
  json() {
    return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body)
  }
  
  text() {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body))
  }
}

global.Headers = class MockHeaders extends Map {
  constructor(init) {
    super()
    if (init) {
      if (typeof init.entries === 'function') {
        for (const [key, value] of init.entries()) {
          this.set(key, value)
        }
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value)
        })
      }
    }
  }
}

// Mock fetch
global.fetch = jest.fn()

// Mock NextResponse
global.NextResponse = {
  json: jest.fn((data, init = {}) => {
    const response = new global.Response(JSON.stringify(data), {
      status: init.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    })
    return response
  })
}