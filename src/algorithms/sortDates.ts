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
    // Hybrid: insertion sort for small arrays, merge sort for larger
    const sortedPairs = parsed.length <= 64
        ? insertionSortDesc(parsed, cmp)
        : mergeSortDesc(parsed, cmp);
    return sortedPairs.map((x) => x.s);
}

type Comparator<T> = (a: T, b: T) => number;

function mergeSortDesc<T>(arr: T[], cmp: Comparator<T>): T[] {
    if (arr.length <= 1) return arr.slice();
    const mid = Math.floor(arr.length / 2);
    const left = mergeSortDesc(arr.slice(0, mid), cmp);
    const right = mergeSortDesc(arr.slice(mid), cmp);
    return mergeDesc(left, right, cmp);
}

function mergeDesc<T>(a: T[], b: T[], cmp: Comparator<T>): T[] {
    const out: T[] = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
        if (cmp(a[i], b[j]) > 0) {
            out.push(a[i++]);
        } else {
            out.push(b[j++]);
        }
    }
    while (i < a.length) out.push(a[i++]);
    while (j < b.length) out.push(b[j++]);
    return out;
}

function insertionSortDesc<T>(arr: T[], cmp: Comparator<T>): T[] {
    const a = arr.slice();
    for (let i = 1; i < a.length; i++) {
        const key = a[i];
        let j = i - 1;
        while (j >= 0 && cmp(a[j], key) < 0) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
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
