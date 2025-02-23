import { sql } from "@/lib/db";
import { updateDailyStats } from "../helpers";

// Mock the sql tagged template literal
jest.mock("@/lib/db", () => ({
    sql: jest.fn().mockImplementation((strings: TemplateStringsArray, ...values: any[]) => {
        // Join the strings with the values to create a complete query string
        const query = strings.reduce((acc, str, i) => {
            return acc + str + (values[i] !== undefined ? values[i] : '');
        }, '');
        return Promise.resolve({ rowCount: 1 });
    })
}));

// Create a properly typed mock after the module is mocked
const mockSql = jest.mocked(sql);

describe("updateDailyStats", () => {
    beforeEach(() => {
        // Clear mock before each test
        mockSql.mockClear();
    });

    it("should call sql with correct query parameters", async () => {
        const testDate = "2025-02-22";
        await updateDailyStats(testDate);

        expect(mockSql).toHaveBeenCalledTimes(1);
        
        // Check the query contains key elements
        const call = mockSql.mock.calls[0];
        const query = (call[0] as unknown as string[]).join('?');
        expect(query).toContain("INSERT INTO daily_stats");
        expect(query).toContain("ON CONFLICT (date) DO UPDATE");
        expect(call.slice(1)).toContain(testDate);
    });

    it("should handle errors gracefully", async () => {
        const testDate = "2025-02-22";
        mockSql.mockRejectedValueOnce(new Error("Database error"));

        await expect(updateDailyStats(testDate)).rejects.toThrow("Database error");
    });
});
