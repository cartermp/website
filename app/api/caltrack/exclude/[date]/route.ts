import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateDailyStats } from "../../helpers";

// Define params type for Next.js 15
type RouteParams = Promise<{ date: string }>;

export async function PATCH(
    request: Request,
    { params }: { params: RouteParams }
) {
    try {
        const { is_excluded } = await request.json();
        const resolvedParams = await params;
        const date = resolvedParams.date;

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                { error: "Invalid date format. Use YYYY-MM-DD" },
                { status: 400 }
            );
        }

        // Ensure daily stats exist for this date
        await updateDailyStats(date);

        // Update the excluded status
        await sql`
            UPDATE daily_stats 
            SET is_excluded = ${is_excluded}, updated_at = CURRENT_TIMESTAMP 
            WHERE date = ${date}::date
        `;

        return NextResponse.json({ 
            message: `Day ${date} ${is_excluded ? 'excluded from' : 'included in'} calculations` 
        });
    } catch (error) {
        console.error('Error updating excluded status:', error);
        return NextResponse.json(
            { error: "Failed to update excluded status" },
            { status: 500 }
        );
    }
}