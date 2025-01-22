import { CalorieForm } from '../components/CalorieForm'

export default function AddCaloriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Add Today's Calories
      </h1>
      
      <CalorieForm />
    </div>
  )
}
