/**
 * @jest-environment node
 */
import { DELETE } from "../delete/[date]/route";
import { sql } from "@/lib/db";
import { updateDailyStats } from "../helpers";

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

describe("DELETE /api/caltrack/delete/[date]", () => {
    beforeEach(() => {
        mockSql.mockClear();
        mockUpdateDailyStats.mockClear();
        (global.Request as jest.Mock).mockImplementation((url) => ({
            url
        }));
    });

    it("should delete entries and update stats for the date", async () => {
        const testDate = "2025-02-22";
        const request = new Request(`http://localhost:3000/api/caltrack/delete/${testDate}`);
        const params = { date: testDate };

        const response = await DELETE(request, { params });
        const data = await response.json();

        // Check SQL was called with correct parameters
        expect(mockSql).toHaveBeenCalledTimes(1);
        const [query, ...queryParams] = mockSql.mock.calls[0];
        expect(query[0]).toContain("DELETE FROM calorie_entries");
        expect(queryParams).toContain(testDate);

        // Check updateDailyStats was called for the date
        expect(mockUpdateDailyStats).toHaveBeenCalledTimes(1);
        expect(mockUpdateDailyStats).toHaveBeenCalledWith(testDate);

        // Check response
        expect(data).toEqual({ success: true });
    });

    it("should handle database errors", async () => {
        const testDate = "2025-02-22";
        const request = new Request(`http://localhost:3000/api/caltrack/delete/${testDate}`);
        const params = { date: testDate };

        mockSql.mockRejectedValueOnce(new Error("Database error"));

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Failed to delete entries" });
    });
});
