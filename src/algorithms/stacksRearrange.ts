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

    // Перемещение контейнера
    const move = (from: number, to: number) => {
        const container = stacks[from].pop();
        if (container !== undefined) {
            stacks[to].push(container);
            moves.push([from + 1, to + 1]);
        }
    };

    // Найти вспомогательную стопку (не target и не exclude)
    const findAux = (exclude1: number, exclude2: number): number => {
        for (let i = 0; i < n; i++) {
            if (i !== exclude1 && i !== exclude2) return i;
        }
        return (exclude1 + 1) % n;
    };

    // Переместить верхний элемент в его домашнюю стопку или aux
    const moveTop = (from: number, target: number) => {
        const top = stacks[from][stacks[from].length - 1];
        const home = top - 1;
        const to = home === from ? findAux(from, target) : home;
        move(from, to);
    };

    // Убрать не-type элементы со стопки
    const clearNonType = (stackIdx: number, type: number, target: number) => {
        while (
            stacks[stackIdx].length > 0 &&
            stacks[stackIdx][stacks[stackIdx].length - 1] !== type
        ) {
            moveTop(stackIdx, target);
        }
    };

    // Переместить все элементы типа type в целевую стопку
    const collectType = (from: number, type: number, target: number) => {
        while (stacks[from].includes(type)) {
            clearNonType(from, type, target);
            if (stacks[from].length > 0) move(from, target);
        }
    };

    // Есть ли в стопке элементы не равные type
    const hasNonType = (idx: number, type: number) =>
        stacks[idx].some((v) => v !== type);

    // Основной алгоритм: обрабатываем каждый тип по очереди
    for (let type = 1; type <= n; type++) {
        const target = type - 1;
        const buffer = (target + 1) % n;

        // 1. Очищаем target: если сверху t, а ниже чужие — снимаем t в buffer, пока не откроется чужой, и уводим его «домой»
        while (hasNonType(target, type) && stacks[target].length > 0) {
            while (
                stacks[target].length > 0 &&
                stacks[target][stacks[target].length - 1] === type
            ) {
                move(target, buffer);
            }
            if (stacks[target].length === 0) break;
            const v = stacks[target][stacks[target].length - 1];
            const home = v - 1;
            move(target, home);
        }
        // Вернуть t из buffer на target
        collectType(buffer, type, target);

        // 3. Собираем type из всех остальных стопок
        for (let i = 0; i < n; i++) {
            if (i !== target) {
                collectType(i, type, target);
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
