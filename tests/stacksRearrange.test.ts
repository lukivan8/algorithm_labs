import { describe, expect, it } from "vitest";
import { rearrangeStacks } from "../src/algorithms/stacksRearrange";

function allSorted(stacks: number[][]): boolean {
    return stacks.every((stack, i) => stack.every((v) => v === i + 1));
}

function applyMoves(
    initial: number[][],
    moves: Array<[number, number]>,
): number[][] {
    const stacks = initial.map((s) => s.slice());
    for (const [from1, to1] of moves) {
        const from = from1 - 1, to = to1 - 1;
        const val = stacks[from].pop();
        if (val === undefined) throw new Error("Invalid move: pop from empty");
        stacks[to].push(val);
    }
    return stacks;
}

describe("Lab 3 – stacks rearrangement", () => {
    it("example from the task text", () => {
        const stacks = [[1, 2], [3, 1], [3]]; // bottom..top
        const res = rearrangeStacks(stacks);
        expect(res.possible).toBe(true);
        expect(allSorted(res.finalStacks)).toBe(true);
        // Moves are valid and reproduce final stacks
        const reproduced = applyMoves(stacks, res.moves);
        expect(reproduced).toEqual(res.finalStacks);
    });

    it("already sorted → zero moves", () => {
        const stacks = [[1, 1], [2], [3, 3, 3]];
        const res = rearrangeStacks(stacks);
        expect(res.possible).toBe(true);
        expect(res.moves.length).toBe(0);
        expect(allSorted(res.finalStacks)).toBe(true);
    });

    it("handles empty stacks and mixed contents", () => {
        const stacks = [[], [2, 1, 2], [3], [1, 3, 2, 1]];
        const res = rearrangeStacks(stacks);
        expect(res.possible).toBe(true);
        expect(allSorted(res.finalStacks)).toBe(true);
    });

    it("rejects invalid labels", () => {
        const stacks = [[1, 2], [4]]; // 4 is out of range for N=2
        const res = rearrangeStacks(stacks);
        expect(res.possible).toBe(false);
    });

    it("randomized small cases (deterministic count)", () => {
        const runs = 20;
        for (let r = 0; r < runs; r++) {
            const n = 4;
            const stacks: number[][] = Array.from({ length: n }, () => []);
            // put two of each type 1..n and shuffle
            const items: number[] = [];
            for (let t = 1; t <= n; t++) items.push(t, t);
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
            // round-robin distribute bottom..top
            let idx = 0;
            for (const v of items) {
                stacks[idx % n].push(v);
                idx++;
            }

            const res = rearrangeStacks(stacks);
            expect(res.possible).toBe(true);
            expect(allSorted(res.finalStacks)).toBe(true);
            expect(applyMoves(stacks, res.moves)).toEqual(res.finalStacks);
        }
    });
});
