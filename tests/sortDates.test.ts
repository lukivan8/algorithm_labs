import { describe, expect, it } from "vitest";
import { parseYmdKey, sortDatesDescending } from "../src/algorithms/sortDates";

describe("parseYmdKey", () => {
    it("parses valid ymd", () => {
        expect(parseYmdKey("2024-09-30")).toBe(20240930);
    });

    it("rejects invalid", () => {
        expect(parseYmdKey("2024-13-01")).toBeNull();
    });
});

describe("sortDatesDescending", () => {
    it("sorts in descending order", () => {
        const input = ["2022-12-01", "2024-01-01", "2023-01-01"];
        expect(sortDatesDescending(input)).toEqual([
            "2024-01-01",
            "2023-01-01",
            "2022-12-01",
        ]);
    });

    it("filters invalid values", () => {
        const input = ["2024-01-01", "bad", "2024-01-02"];
        expect(sortDatesDescending(input)).toEqual([
            "2024-01-02",
            "2024-01-01",
        ]);
    });
});
