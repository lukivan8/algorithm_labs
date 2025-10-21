export function sum(numbers: number[]): number {
    let total = 0;
    for (const value of numbers) {
        total += value;
    }
    return total;
}

// CLI support: allow running `bun src/algorithms/sum.ts 1 2 3`
if (import.meta.main) {
    const args = process.argv.slice(2).map(Number).filter((n) =>
        !Number.isNaN(n)
    );
    // eslint-disable-next-line no-console
    console.log(sum(args));
}
