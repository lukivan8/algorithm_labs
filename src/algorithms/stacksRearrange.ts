export type Move = [number, number]; // 1-based indices: [from, to]

export type RearrangeResult = {
    possible: boolean;
    moves: Move[];
    finalStacks: number[][];
};

function top<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

function findAuxiliary(n: number, excludeA: number, excludeB: number): number {
    for (let j = 0; j < n; j++) if (j !== excludeA && j !== excludeB) return j;
    return excludeA;
}

/**
 * Rearrange N stacks such that stack i (1-based) contains only items of type i.
 * Allowed operation: move top item from any stack to top of any other stack.
 * The algorithm is not optimal but guarantees termination if all items are in 1..N.
 */
export function rearrangeStacks(stacksInput: number[][]): RearrangeResult {
    const n = stacksInput.length;
    const stacks = stacksInput.map((s) => s.slice());
    const moves: Move[] = [];

    // Валидация
    for (const stack of stacks) {
        if (stack.some((v) => v < 1 || v > n)) {
            return { possible: false, moves: [], finalStacks: stacks };
        }
    }

    // Проверка на завершенность
    const isComplete = () =>
        stacks.every((stack, idx) => stack.every((c) => c === idx + 1));

    if (isComplete()) return { possible: true, moves: [], finalStacks: stacks };

    // Найти вспомогательную стопку (не target и не exclude)
    const findAux = (exclude1: number, exclude2: number): number => {
        for (let i = 0; i < n; i++) {
            if (i !== exclude1 && i !== exclude2) return i;
        }
        return (exclude1 + 1) % n;
    };

    const hasWrongType = (stack: number[], type: number) =>
        stack.some((c) => c !== type);

    for (let type = 1; type <= n; type++) {
        const target = type - 1;
        const buffer = (target + 1) % n; // вспомогательная стопка

        // Фаза 1: освободить целевой стек
        while (
            stacks[target].length > 0 && hasWrongType(stacks[target], type)
        ) {
            const topVal = stacks[target].pop()!;
            const destination = topVal === type ? buffer : topVal - 1;
            stacks[destination].push(topVal);
            moves.push([target + 1, destination + 1]);
        }

        // Фаза 2: собрать все type в целевой стек
        for (let i = 0; i < n; i++) {
            if (i === target) continue;
            while (stacks[i].includes(type)) {
                // Убираем препятствия сверху
                while (
                    stacks[i].length > 0 &&
                    stacks[i][stacks[i].length - 1] !== type
                ) {
                    const topVal = stacks[i].pop()!;
                    let dest = topVal - 1;
                    if (dest === i) dest = findAux(i, target); // не перемещать в тот же стек
                    stacks[dest].push(topVal);
                    moves.push([i + 1, dest + 1]);
                }
                if (stacks[i].length > 0) {
                    stacks[i].pop();
                    stacks[target].push(type);
                    moves.push([i + 1, target + 1]);
                }
            }
        }
    }

    // Финальная проверка
    if (!isComplete()) {
        return { possible: false, moves, finalStacks: stacks };
    }

    return { possible: true, moves, finalStacks: stacks };
}

// CLI: parse problem format and print moves
if (import.meta.main) {
    const lines = require("fs").readFileSync(0, "utf8").trim().split(/\r?\n/);
    const n = Number(lines[0]);
    const stacks: number[][] = [];
    for (let i = 0; i < n; i++) {
        const parts = lines[i + 1].trim().split(/\s+/).map(Number);
        const k = parts[0];
        const items = parts.slice(1, 1 + k);
        stacks.push(items); // bottom..top per statement
    }
    const res = rearrangeStacks(stacks);
    if (!res.possible) {
        // eslint-disable-next-line no-console
        console.log("0");
    } else {
        // Print each move
        for (const [a, b] of res.moves) {
            // eslint-disable-next-line no-console
            console.log(a + " " + b);
        }
    }
}
