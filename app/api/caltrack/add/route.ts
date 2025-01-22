import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(request: Request) {
  try {
    const { entries } = await request.json()
    
    const csvFile = path.join(process.cwd(), 'data', 'calorie_tracking.csv')
    const fileContent = await fs.readFile(csvFile, 'utf-8')
    
    // Parse existing entries
    const { data: existingData } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    })
    
    // Add new entries
    const allEntries = [...existingData, ...entries]
    
    // Convert back to CSV
    const csv = Papa.unparse(allEntries)
    
    // Write back to file
    await fs.writeFile(csvFile, csv)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save entries:', error)
    return NextResponse.json(
      { error: 'Failed to save entries' },
      { status: 500 }
    )
  }
}
