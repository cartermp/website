import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { FoodAutocomplete } from '../FoodAutocomplete'
import { getFoodItems } from '@/lib/getData'

// Mock the getData module
jest.mock('@/lib/getData', () => ({
    getFoodItems: jest.fn()
}))

const mockFoodItems = [
    { meal_name: 'Yogurt', calories: 150 },
    { meal_name: 'Banana', calories: 105 },
    { meal_name: 'Protein Bar', calories: 200 }
]

describe('FoodAutocomplete', () => {
    const defaultProps = {
        value: '',
        calories: '',
        onNameChange: jest.fn(),
        onCaloriesChange: jest.fn(),
        disabled: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Setup default mock implementation
        ;(getFoodItems as jest.Mock).mockResolvedValue(mockFoodItems)
    })

    it('shows loading state initially', async () => {
        // Create a promise that we can resolve later
        let resolvePromise: (value: any) => void
        const promise = new Promise(resolve => {
            resolvePromise = resolve
        })

        // Mock getFoodItems to return our controlled promise
        ;(getFoodItems as jest.Mock).mockImplementation(() => promise)

        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} />)
        })

        // Check loading state
        expect(screen.getByPlaceholderText(/loading food items/i)).toBeInTheDocument()

        // Resolve the promise to complete the test
        await act(async () => {
            resolvePromise(mockFoodItems)
            await promise
        })
    })

    it('loads and displays food items on focus', async () => {
        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} />)
        })
        
        // Wait for items to load
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
        })

        // Click the input to show suggestions
        const input = screen.getByRole('textbox')
        await act(async () => {
            fireEvent.focus(input)
        })

        // Check if all items are displayed
        await waitFor(() => {
            mockFoodItems.forEach(item => {
                expect(screen.getByText(item.meal_name)).toBeInTheDocument()
                expect(screen.getByText(`${item.calories} cal`)).toBeInTheDocument()
            })
        })
    })

    it('filters suggestions based on input', async () => {
        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} />)
        })
        
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await act(async () => {
            fireEvent.change(input, { target: { value: 'yo' } })
        })

        // Should only show Yogurt
        expect(screen.getByText('Yogurt')).toBeInTheDocument()
        expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    })

    it('selects item and calls onChange handlers when clicking a suggestion', async () => {
        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} />)
        })
        
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await act(async () => {
            fireEvent.focus(input)
        })

        // Click the first suggestion
        await act(async () => {
            fireEvent.click(screen.getByText('Yogurt'))
        })

        expect(defaultProps.onNameChange).toHaveBeenCalledWith('Yogurt')
        expect(defaultProps.onCaloriesChange).toHaveBeenCalledWith('150')
    })

    it('closes suggestion list when clicking outside', async () => {
        await act(async () => {
            render(
                <div>
                    <div data-testid="outside">Outside</div>
                    <FoodAutocomplete {...defaultProps} />
                </div>
            )
        })
        
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
        })

        // Show suggestions
        const input = screen.getByRole('textbox')
        await act(async () => {
            fireEvent.focus(input)
        })

        // Verify suggestions are shown
        await waitFor(() => {
            expect(screen.getByText('Yogurt')).toBeInTheDocument()
        })

        // Click outside
        await act(async () => {
            fireEvent.mouseDown(screen.getByTestId('outside'))
        })

        // Verify suggestions are hidden
        await waitFor(() => {
            expect(screen.queryByText('Yogurt')).not.toBeInTheDocument()
        })
    })

    it('handles error when loading food items', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        ;(getFoodItems as jest.Mock).mockRejectedValue(new Error('Failed to load'))

        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} />)
        })
        
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
        })

        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it('handles disabled state', async () => {
        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} disabled={true} />)
        })
        
        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
    })

    it('preserves input value when no suggestion is selected', async () => {
        await act(async () => {
            render(<FoodAutocomplete {...defaultProps} />)
        })
        
        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await act(async () => {
            fireEvent.change(input, { target: { value: 'New Food' } })
        })

        expect(defaultProps.onNameChange).toHaveBeenCalledWith('New Food')
        expect(defaultProps.onCaloriesChange).not.toHaveBeenCalled()
    })

    describe('Keyboard Navigation', () => {
        beforeEach(async () => {
            await act(async () => {
                render(<FoodAutocomplete {...defaultProps} />)
            })
            
            await waitFor(() => {
                expect(screen.queryByPlaceholderText(/loading food items/i)).not.toBeInTheDocument()
            })

            // Show suggestions
            const input = screen.getByRole('textbox')
            await act(async () => {
                fireEvent.focus(input)
            })
        })

        it('navigates through suggestions with arrow keys', async () => {
            const input = screen.getByRole('textbox')

            // Initially no item should be highlighted
            expect(screen.queryByText('Yogurt')).not.toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')

            // Press arrow down to highlight first item
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowDown' })
            })
            const yogurtItem = screen.getByText('Yogurt')
            expect(yogurtItem.parentElement).toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')

            // Press arrow down again to highlight second item
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowDown' })
            })
            const bananaItem = screen.getByText('Banana')
            expect(bananaItem.parentElement).toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')
            expect(yogurtItem.parentElement).not.toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')

            // Press arrow up to go back to first item
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowUp' })
            })
            expect(yogurtItem.parentElement).toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')
            expect(bananaItem.parentElement).not.toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')
        })

        it('selects highlighted suggestion with Enter key', async () => {
            const input = screen.getByRole('textbox')

            // Navigate to first item
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowDown' })
            })

            // Press Enter to select
            await act(async () => {
                fireEvent.keyDown(input, { key: 'Enter' })
            })

            expect(defaultProps.onNameChange).toHaveBeenCalledWith('Yogurt')
            expect(defaultProps.onCaloriesChange).toHaveBeenCalledWith('150')
            expect(screen.queryByText('Yogurt')).not.toBeInTheDocument() // List should close
        })

        it('selects highlighted suggestion with Tab key', async () => {
            const input = screen.getByRole('textbox')

            // Navigate to second item
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowDown' })
                fireEvent.keyDown(input, { key: 'ArrowDown' })
            })

            // Press Tab to select
            await act(async () => {
                fireEvent.keyDown(input, { key: 'Tab' })
            })

            expect(defaultProps.onNameChange).toHaveBeenCalledWith('Banana')
            expect(defaultProps.onCaloriesChange).toHaveBeenCalledWith('105')
            expect(screen.queryByText('Banana')).not.toBeInTheDocument() // List should close
        })

        it('closes suggestions with Escape key', async () => {
            const input = screen.getByRole('textbox')

            // Verify suggestions are shown
            expect(screen.getByText('Yogurt')).toBeInTheDocument()

            // Press Escape
            await act(async () => {
                fireEvent.keyDown(input, { key: 'Escape' })
            })

            // Verify suggestions are hidden
            expect(screen.queryByText('Yogurt')).not.toBeInTheDocument()
        })

        it('does not select anything when no suggestion is highlighted', async () => {
            const input = screen.getByRole('textbox')

            // Press Enter without highlighting any suggestion
            await act(async () => {
                fireEvent.keyDown(input, { key: 'Enter' })
            })

            expect(defaultProps.onNameChange).not.toHaveBeenCalled()
            expect(defaultProps.onCaloriesChange).not.toHaveBeenCalled()
            expect(screen.getByText('Yogurt')).toBeInTheDocument() // List should stay open
        })

        it('respects boundaries when navigating with arrow keys', async () => {
            const input = screen.getByRole('textbox')

            // Try to go up when no item is selected (should stay at -1)
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowUp' })
            })
            const yogurtItem = screen.getByText('Yogurt')
            expect(yogurtItem.parentElement).not.toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')

            // Go to last item
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowDown' })
                fireEvent.keyDown(input, { key: 'ArrowDown' })
                fireEvent.keyDown(input, { key: 'ArrowDown' })
            })
            const proteinBarItem = screen.getByText('Protein Bar')
            expect(proteinBarItem.parentElement).toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')

            // Try to go beyond last item (should stay on last item)
            await act(async () => {
                fireEvent.keyDown(input, { key: 'ArrowDown' })
            })
            expect(proteinBarItem.parentElement).toHaveClass('bg-purple-100', 'dark:bg-purple-900/30')
        })
    })
}) 