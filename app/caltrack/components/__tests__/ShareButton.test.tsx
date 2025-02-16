import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ShareButton } from '../ShareButton'
import { useRouter } from 'next/navigation'

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('ShareButton', () => {
    const defaultProps = {
        date: '2024-01-01'
    }

    const mockRouter = {
        push: jest.fn(),
        refresh: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    })

    it('renders with correct text and icon', () => {
        render(<ShareButton {...defaultProps} />)
        
        // Check for both mobile and desktop text
        expect(screen.getByText("Share Today's Report")).toBeInTheDocument()
        expect(screen.getByText("Share")).toBeInTheDocument()
        
        // Check for share icon
        const button = screen.getByRole('button')
        const svg = button.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('navigates to share URL when clicked', async () => {
        render(<ShareButton {...defaultProps} />)
        
        const button = screen.getByRole('button')
        await act(async () => {
            fireEvent.click(button)
        })
        
        // Verify router was called with correct URL
        expect(mockRouter.push).toHaveBeenCalledWith('/caltrack/share/2024-01-01')
    })

    it('shows loading state while sharing', async () => {
        // Mock router.push to be slow
        mockRouter.push.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
        
        render(<ShareButton {...defaultProps} />)
        
        const button = screen.getByRole('button')
        
        // Click the button and wait for state update
        fireEvent.click(button)
        
        // Wait for loading state
        const loadingSpinner = await screen.findByText('Sharing...')
        expect(loadingSpinner).toBeInTheDocument()
        expect(button).toBeDisabled()
        
        // Wait for navigation to complete
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 150))
        })
        
        // Check loading state is removed
        expect(screen.queryByText('Sharing...')).not.toBeInTheDocument()
        expect(button).not.toBeDisabled()
    })

    it('applies correct styling', () => {
        render(<ShareButton {...defaultProps} />)
        
        const button = screen.getByRole('button')
        expect(button).toHaveClass(
            'w-full',
            'sm:w-auto',
            'px-4',
            'py-2',
            'bg-green-600',
            'text-white',
            'rounded',
            'hover:bg-green-700',
            'transition-colors'
        )
    })
}) 