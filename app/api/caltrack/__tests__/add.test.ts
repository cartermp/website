/**
 * @jest-environment node
 */
import { POST } from "../add/route";
import { sql } from "@/lib/db";
import { updateDailyStats } from "../helpers";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/db", () => ({
    sql: jest.fn()
}));

jest.mock("../helpers", () => ({
    updateDailyStats: jest.fn()
}));

// Create a simple Response mock
class MockResponse {
    status: number;
    body: any;

    constructor(body: any, init?: { status?: number }) {
        this.status = init?.status || 200;
        this.body = JSON.stringify(body);
    }

    async json() {
        return JSON.parse(this.body);
    }

    static json(body: any, init?: { status?: number }) {
        return new MockResponse(body, init);
    }
}

// Mock NextResponse
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn().mockImplementation((body, init) => MockResponse.json(body, init))
    }
}));

// Add web API types for test environment
declare global {
    var Response: typeof Response;
    var Request: typeof Request;
}

global.Response = MockResponse as any;
global.Request = jest.fn() as any;

// Create properly typed mocks after modules are mocked
const mockSql = jest.mocked(sql);
const mockUpdateDailyStats = jest.mocked(updateDailyStats);

describe("POST /api/caltrack/add", () => {
    beforeEach(() => {
        mockSql.mockClear();
        mockUpdateDailyStats.mockClear();
        (global.Request as jest.Mock).mockImplementation((url, init) => ({
            json: async () => JSON.parse(init?.body as string)
        }));
    });

    const mockEntries = [
        {
            date: "2025-02-22",
            meal_type: "Breakfast",
            meal_name: "Oatmeal",
            calories: 300
        },
        {
            date: "2025-02-22",
            meal_type: "Lunch",
            meal_name: "Sandwich",
            calories: 500
        },
        {
            date: "2025-02-23",
            meal_type: "Breakfast",
            meal_name: "Toast",
            calories: 200
        }
    ];

    it("should insert entries and update stats", async () => {
        const request = new Request("http://localhost:3000/api/caltrack/add", {
            method: "POST",
            body: JSON.stringify({ entries: mockEntries })
        });

        const response = await POST(request);
        const data = await response.json();

        // Check SQL was called with correct parameters
        expect(mockSql).toHaveBeenCalledTimes(1);
        const [query] = mockSql.mock.calls[0];
        expect(query[0]).toContain("INSERT INTO calorie_entries");

        // Check updateDailyStats was called for each unique date
        expect(mockUpdateDailyStats).toHaveBeenCalledTimes(2);
        expect(mockUpdateDailyStats).toHaveBeenCalledWith("2025-02-22");
        expect(mockUpdateDailyStats).toHaveBeenCalledWith("2025-02-23");

        // Check response
        expect(data).toEqual({ success: true });
    });

    it("should handle invalid request body", async () => {
        const request = new Request("http://localhost:3000/api/caltrack/add", {
            method: "POST",
            body: "invalid json"
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toHaveProperty("error");
    });

    it("should handle database errors", async () => {
        const request = new Request("http://localhost:3000/api/caltrack/add", {
            method: "POST",
            body: JSON.stringify({ entries: mockEntries })
        });

        mockSql.mockRejectedValueOnce(new Error("Database error"));

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Failed to save entries" });
    });
});
