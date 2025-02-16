import { renderHook, act } from '@testing-library/react'
import { useCalorieForm } from '../useCalorieForm'
import { useRouter } from 'next/navigation'
import type { CalorieEntry } from '../../types'

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('useCalorieForm', () => {
    const mockRouter = {
        push: jest.fn(),
        refresh: jest.fn()
    }

    const mockInitialEntries: CalorieEntry[] = [
        { date: '2024-02-15', meal_type: 'Breakfast', meal_name: 'Oatmeal', calories: 300 },
        { date: '2024-02-15', meal_type: 'Lunch', meal_name: 'Sandwich', calories: 400 }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
        
        // Mock fetch
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('initializes with empty meals when no initial entries', () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            mode: 'add'
        }))

        // Should have all meal types with one empty item each
        expect(result.current.meals).toHaveLength(4) // Breakfast, Lunch, Dinner, Snacks
        result.current.meals.forEach(meal => {
            expect(meal.items).toHaveLength(1)
            expect(meal.items[0]).toEqual({ name: '', calories: '' })
        })
    })

    it('initializes with provided entries', () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            initialEntries: mockInitialEntries,
            mode: 'edit'
        }))

        const breakfast = result.current.meals.find(m => m.type === 'Breakfast')
        expect(breakfast?.items[0]).toEqual({ name: 'Oatmeal', calories: 300 })

        const lunch = result.current.meals.find(m => m.type === 'Lunch')
        expect(lunch?.items[0]).toEqual({ name: 'Sandwich', calories: 400 })
    })

    it('adds new items', () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            mode: 'add'
        }))

        act(() => {
            result.current.addItem(0) // Add to Breakfast
        })

        expect(result.current.meals[0].items).toHaveLength(2)
        expect(result.current.meals[0].items[1]).toEqual({ name: '', calories: '' })
    })

    it('removes items but keeps at least one', () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            initialEntries: mockInitialEntries,
            mode: 'edit'
        }))

        // Add an extra item to breakfast
        act(() => {
            result.current.addItem(0)
        })

        // Remove the first item
        act(() => {
            result.current.removeItem(0, 0)
        })

        const breakfast = result.current.meals.find(m => m.type === 'Breakfast')
        expect(breakfast?.items).toHaveLength(1)

        // Try to remove the last item - should keep one empty item
        act(() => {
            result.current.removeItem(0, 0)
        })

        expect(result.current.meals[0].items).toHaveLength(1)
        expect(result.current.meals[0].items[0]).toEqual({ name: '', calories: '' })
    })

    it('updates items', () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            mode: 'add'
        }))

        act(() => {
            result.current.updateItem(0, 0, 'name', 'Toast')
            result.current.updateItem(0, 0, 'calories', '200')
        })

        expect(result.current.meals[0].items[0]).toEqual({ name: 'Toast', calories: '200' })
    })

    it('calculates total calories', () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            initialEntries: mockInitialEntries,
            mode: 'edit'
        }))

        expect(result.current.getTotalCalories()).toBe(700) // 300 + 400
    })

    it('validates form before submission', async () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            mode: 'add'
        }))

        // Try to submit with empty form
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() } as any)
        })

        expect(result.current.error?.message).toBe('Please add at least one meal with both name and calories')
    })

    it('submits form successfully in add mode', async () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            mode: 'add'
        }))

        // Add a valid meal
        act(() => {
            result.current.updateItem(0, 0, 'name', 'Toast')
            result.current.updateItem(0, 0, 'calories', '200')
        })

        // Mock successful API response
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({})
        })

        // Submit form
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() } as any)
        })

        // Verify API call
        expect(global.fetch).toHaveBeenCalledWith('/api/caltrack/add', expect.any(Object))
        expect(mockRouter.push).toHaveBeenCalledWith('/caltrack')
    })

    it('submits form successfully in edit mode', async () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            initialEntries: mockInitialEntries,
            mode: 'edit'
        }))

        // Mock successful API responses
        ;(global.fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true }) // DELETE request
            .mockResolvedValueOnce({ ok: true }) // POST request

        // Submit form
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() } as any)
        })

        // Verify API calls
        expect(global.fetch).toHaveBeenCalledWith('/api/caltrack/delete/2024-02-15', expect.any(Object))
        expect(global.fetch).toHaveBeenCalledWith('/api/caltrack/add', expect.any(Object))
        expect(mockRouter.push).toHaveBeenCalledWith('/caltrack')
    })

    it('handles API errors', async () => {
        const { result } = renderHook(() => useCalorieForm({
            date: '2024-02-15',
            initialEntries: mockInitialEntries,
            mode: 'edit'
        }))

        // Mock API error
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

        // Submit form
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() } as any)
        })

        expect(result.current.submitError).toBe('API Error')
        expect(result.current.isSubmitting).toBe(false)
    })
}) 