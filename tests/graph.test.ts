import { describe, expect, it } from "vitest";
import { createGraph, hasCycle } from "../src/algorithms/graph";

describe("graph cycle detection", () => {
    it("undirected without cycle", () => {
        const g = createGraph(4, [[0, 1], [1, 2]], false);
        expect(hasCycle(g, false)).toBe(false);
    });

    it("undirected with cycle", () => {
        const g = createGraph(3, [[0, 1], [1, 2], [2, 0]], false);
        expect(hasCycle(g, false)).toBe(true);
    });

    it("directed without cycle", () => {
        const g = createGraph(4, [[0, 1], [1, 2], [2, 3]], true);
        expect(hasCycle(g, true)).toBe(false);
    });

    it("directed with cycle", () => {
        const g = createGraph(3, [[0, 1], [1, 2], [2, 1]], true);
        expect(hasCycle(g, true)).toBe(true);
    });
});
