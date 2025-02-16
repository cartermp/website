import React from 'react'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '../PageHeader'
import { useRouter } from 'next/navigation'

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('PageHeader', () => {
    const mockRouter = {
        push: jest.fn(),
        refresh: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    })

    it('renders with default state (no entry for today)', () => {
        render(<PageHeader />)
        
        expect(screen.getByText('Calorie Tracking')).toBeInTheDocument()
        expect(screen.getByText("Add Today's Calories")).toBeInTheDocument()
        expect(screen.getByRole('link', { name: "Add Today's Calories" })).toHaveAttribute('href', expect.stringMatching(/\/caltrack\/edit\/\d{4}-\d{2}-\d{2}/))
    })

    it('renders with todayEntry=true', () => {
        render(<PageHeader todayEntry={true} />)
        
        expect(screen.getByText('Calorie Tracking')).toBeInTheDocument()
        expect(screen.getByText("Edit Today's Calories")).toBeInTheDocument()
        expect(screen.getByRole('link', { name: "Edit Today's Calories" })).toHaveAttribute('href', expect.stringMatching(/\/caltrack\/edit\/\d{4}-\d{2}-\d{2}/))
    })

    it('renders share button', () => {
        render(<PageHeader />)
        
        // Verify share button is present
        expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
        render(<PageHeader />)
        
        const header = screen.getByRole('heading', { name: 'Calorie Tracking' })
        expect(header).toHaveClass('text-2xl', 'font-bold')
        
        const container = header.parentElement
        expect(container).toHaveClass('flex', 'flex-col', 'sm:flex-row')
    })
}) 