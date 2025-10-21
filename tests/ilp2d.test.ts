import { describe, expect, it } from "vitest";
import { solveILP2D, solveILP2DTrace } from "../src/algorithms/ilp2d";

describe("ILP 2D Branch-and-Bound", () => {
    it("solves the lab problem", () => {
        const res = solveILP2D(
            3,
            2,
            3,
            7,
            21,
            1,
            1,
            14,
            { x1: [0, 4], x2: [0, 3] },
        );
        expect(3 * res.x1 + 7 * res.x2).toBeLessThanOrEqual(21);
        expect(res.x1 + res.x2).toBeLessThanOrEqual(14);
        expect(res.x1).toBeGreaterThanOrEqual(0);
        expect(res.x1).toBeLessThanOrEqual(4);
        expect(res.x2).toBeGreaterThanOrEqual(0);
        expect(res.x2).toBeLessThanOrEqual(3);

        // Check optimal value by enumeration
        const brute: Array<[number, number, number]> = [];
        for (let x1 = 0; x1 <= 4; x1++) {
            for (let x2 = 0; x2 <= 3; x2++) {
                if (3 * x1 + 7 * x2 <= 21 && x1 + x2 <= 14) {
                    brute.push([x1, x2, 3 * x1 + 2 * x2]);
                }
            }
        }
        const best = brute.reduce((m, t) => (t[2] > m[2] ? t : m));
        expect(res.value).toBe(best[2]);
    });

    it("pure solver equals traced solver on lab instance", () => {
        const pure = solveILP2D(
            3,
            2,
            3,
            7,
            21,
            1,
            1,
            14,
            { x1: [0, 4], x2: [0, 3] },
        );

        const traced = solveILP2DTrace(
            3,
            2,
            3,
            7,
            21,
            1,
            1,
            14,
            { x1: [0, 4], x2: [0, 3] },
        ).result;

        expect(pure).toEqual(traced);
    });
});
