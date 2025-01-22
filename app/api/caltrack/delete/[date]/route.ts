import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const csvFile = path.join(process.cwd(), 'data', 'calorie_tracking.csv')
    const fileContent = await fs.readFile(csvFile, 'utf-8')
    
    // Parse existing entries
    const { data } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    })
    
    // Filter out entries for the specified date
    const filteredEntries = data.filter((entry: any) => entry.date !== params.date)
    
    // Convert back to CSV
    const csv = Papa.unparse(filteredEntries)
    
    // Write back to file
    await fs.writeFile(csvFile, csv)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete entries:', error)
    return NextResponse.json(
      { error: 'Failed to delete entries' },
      { status: 500 }
    )
  }
}
