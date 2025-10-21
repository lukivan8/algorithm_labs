export type YMD = `${number}-${number}-${number}`;

/**
 * Sort a list of ISO-like dates (YYYY-MM-DD) in descending order.
 * - Pure, no side-effects; does not mutate the input array
 * - Ignores invalid entries (filters them out)
 */
export function sortDatesDescending(input: readonly string[]): string[] {
    const parsed = input
        .map((s) => ({ s, k: parseYmdKey(s) }))
        .filter((x): x is { s: string; k: number } => x.k !== null);

    const cmp: Comparator<{ s: string; k: number }> = (a, b) => a.k - b.k;
    const sortedPairs = quickSortDescIterative(parsed, cmp);
    return sortedPairs.map((x) => x.s);
}

type Comparator<T> = (a: T, b: T) => number;

function quickSortDescIterative<T>(arr: T[], cmp: Comparator<T>): T[] {
    const a = arr.slice();
    const stack: Array<[number, number]> = [[0, a.length - 1]];

    while (stack.length) {
        const [lo, hi] = stack.pop()!;
        if (lo >= hi) continue;

        const pivot = a[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
            if (cmp(a[j], pivot) > 0) {
                [a[i], a[j]] = [a[j], a[i]];
                i++;
            }
        }
        [a[i], a[hi]] = [a[hi], a[i]];

        const leftSize = i - 1 - lo;
        const rightSize = hi - (i + 1);
        if (leftSize > rightSize) {
            if (lo < i - 1) stack.push([lo, i - 1]);
            if (i + 1 < hi) stack.push([i + 1, hi]);
        } else {
            if (i + 1 < hi) stack.push([i + 1, hi]);
            if (lo < i - 1) stack.push([lo, i - 1]);
        }
    }
    return a;
}

/**
 * Convert YYYY-MM-DD into a numeric comparable key: yyyymmdd
 * Returns null for invalid inputs.
 */
export function parseYmdKey(ymd: string): number | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    return year * 10000 + month * 100 + day;
}

// CLI: `bun src/algorithms/sortDates.ts 2023-01-01 2024-05-10 ...`
if (import.meta.main) {
    const args = process.argv.slice(2);
    const sorted = sortDatesDescending(args);
    // eslint-disable-next-line no-console
    console.log(sorted.join("\n"));
}
