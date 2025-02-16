import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CalorieFormShared } from '../CalorieFormShared'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

// Mock getData
jest.mock('@/lib/getData', () => ({
    getFoodItems: jest.fn().mockResolvedValue([])
}))

// Create mock functions
const mockAddItem = jest.fn()
const mockRemoveItem = jest.fn()
const mockHandleSubmit = jest.fn()
const mockUpdateItem = jest.fn()

// Mock the useCalorieForm hook
jest.mock('@/lib/hooks/useCalorieForm', () => ({
    useCalorieForm: () => ({
        meals: [
            {
                type: 'Breakfast',
                items: [
                    { name: 'Oatmeal', calories: '300' },
                    { name: '', calories: '' }
                ]
            },
            {
                type: 'Lunch',
                items: [
                    { name: 'Sandwich', calories: '400' }
                ]
            },
            {
                type: 'Dinner',
                items: [
                    { name: '', calories: '' }
                ]
            },
            {
                type: 'Snacks',
                items: [
                    { name: '', calories: '' }
                ]
            }
        ],
        error: null,
        isSubmitting: false,
        submitError: null,
        currentFieldRefs: {
            current: Array(4).fill({
                nameRef: { current: null },
                caloriesRef: { current: null }
            })
        },
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateItem: mockUpdateItem,
        getTotalCalories: () => 700,
        handleSubmit: mockHandleSubmit
    })
}))

describe('CalorieFormShared', () => {
    const mockRouter = {
        push: jest.fn(),
        refresh: jest.fn()
    }

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter)
        jest.clearAllMocks()
    })

    it('renders form with initial entries', async () => {
        await act(async () => {
            render(<CalorieFormShared mode="edit" />)
        })
        
        // Check for meal type headings
        expect(screen.getByText('Breakfast')).toBeInTheDocument()
        expect(screen.getByText('Lunch')).toBeInTheDocument()
        expect(screen.getByText('Dinner')).toBeInTheDocument()
        expect(screen.getByText('Snacks')).toBeInTheDocument()

        // Check for initial food items
        expect(screen.getByDisplayValue('Oatmeal')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Sandwich')).toBeInTheDocument()

        // Check for "Add another item" buttons
        const addButtons = screen.getAllByText('+ Add another item')
        expect(addButtons).toHaveLength(4) // One for each meal type
    })

    it('allows adding new entries', async () => {
        await act(async () => {
            render(<CalorieFormShared mode="edit" />)
        })
        
        // Click "Add another item" for Breakfast
        const addButtons = screen.getAllByText('+ Add another item')
        await act(async () => {
            fireEvent.click(addButtons[0])
        })

        // Verify the mock function was called
        expect(mockAddItem).toHaveBeenCalledWith(0)
    })

    it('allows removing entries', async () => {
        await act(async () => {
            render(<CalorieFormShared mode="edit" />)
        })
        
        // Find and click the remove button (✕)
        const removeButtons = screen.getAllByLabelText('Remove item')
        await act(async () => {
            fireEvent.click(removeButtons[0])
        })

        // Verify the mock function was called
        expect(mockRemoveItem).toHaveBeenCalled()
    })

    it('handles form submission', async () => {
        await act(async () => {
            render(<CalorieFormShared mode="edit" />)
        })
        
        // Submit the form
        const submitButton = screen.getByText('Save Changes')
        await act(async () => {
            fireEvent.click(submitButton)
        })

        // Verify the mock function was called
        expect(mockHandleSubmit).toHaveBeenCalled()
    })

    it('displays error messages', async () => {
        // Re-mock useCalorieForm with an error
        const useCalorieFormMock = require('@/lib/hooks/useCalorieForm')
        jest.spyOn(useCalorieFormMock, 'useCalorieForm').mockReturnValueOnce({
            ...useCalorieFormMock.useCalorieForm(),
            error: { message: 'Please fill in all required fields' }
        })

        await act(async () => {
            render(<CalorieFormShared mode="edit" />)
        })
        
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument()
    })

    it('handles keyboard shortcuts', async () => {
        await act(async () => {
            render(<CalorieFormShared mode="edit" />)
        })
        
        // Simulate Cmd+Enter for form submission
        await act(async () => {
            fireEvent.keyDown(screen.getByTestId('calorie-form'), {
                key: 'Enter',
                metaKey: true
            })
        })

        // Verify the mock function was called
        expect(mockHandleSubmit).toHaveBeenCalled()
    })
}) 