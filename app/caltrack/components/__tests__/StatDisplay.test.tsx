import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatDisplay } from '../ui/stat-display'

describe('StatDisplay', () => {
    const defaultProps = {
        label: 'Test Stat',
        value: '100'
    }

    it('renders label and value correctly', () => {
        render(<StatDisplay {...defaultProps} />)
        
        expect(screen.getByText('Test Stat:')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('renders with custom valueColor', () => {
        render(<StatDisplay {...defaultProps} valueColor="text-red-600" />)
        
        const valueElement = screen.getByText('100')
        expect(valueElement).toHaveClass('text-red-600')
    })

    it('renders with custom className', () => {
        render(<StatDisplay {...defaultProps} className="custom-class" />)
        
        const container = screen.getByText('Test Stat:').closest('div')
        expect(container).toHaveClass('custom-class')
    })

    it('applies correct default styling', () => {
        render(<StatDisplay {...defaultProps} />)
        
        const label = screen.getByText('Test Stat:')
        expect(label).toHaveClass('text-gray-600', 'dark:text-gray-400')
        
        const value = screen.getByText('100')
        expect(value).toHaveClass('ml-2', 'font-medium')
    })

    it('renders with different value types', () => {
        const { rerender } = render(<StatDisplay {...defaultProps} value={42} />)
        expect(screen.getByText('42')).toBeInTheDocument()
        
        rerender(<StatDisplay {...defaultProps} value={3.14} />)
        expect(screen.getByText('3.14')).toBeInTheDocument()
        
        rerender(<StatDisplay {...defaultProps} value="N/A" />)
        expect(screen.getByText('N/A')).toBeInTheDocument()
    })
}) 