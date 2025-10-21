import { describe, expect, it } from "vitest";
import { sum } from "../src/algorithms/sum";

describe("sum", () => {
    it("sums numbers", () => {
        expect(sum([1, 2, 3])).toBe(6);
    });

    it("handles empty array", () => {
        expect(sum([])).toBe(0);
    });
});
