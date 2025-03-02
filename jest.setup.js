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