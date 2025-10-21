export type Bounds = { x1: [number, number]; x2: [number, number] };

export type ILPResult = {
    x1: number;
    x2: number;
    value: number;
};

export type BranchStep = {
    x1: number;
    x2RelaxUpper: number;
    ub: number;
    candidates: Array<{ x2: number; feasible: boolean; value: number | null }>; // null value if infeasible
    bestAfter: ILPResult | null;
};

// Maximize c1*x1 + c2*x2 subject to:
//   a11*x1 + a12*x2 <= b1
//   a21*x1 + a22*x2 <= b2
//   bounds on x1, x2 (inclusive) and integrality
export function solveILP2D(
    c1: number,
    c2: number,
    a11: number,
    a12: number,
    b1: number,
    a21: number,
    a22: number,
    b2: number,
    bounds: Bounds,
): ILPResult {
    let best: ILPResult = { x1: 0, x2: 0, value: -Infinity };
    for (
        let x1 = Math.ceil(bounds.x1[0]);
        x1 <= Math.floor(bounds.x1[1]);
        x1++
    ) {
        const x2maxFromC1 = (b1 - a11 * x1) / a12;
        const x2maxFromC2 = (b2 - a21 * x1) / a22;
        const x2UpperRelax = Math.min(x2maxFromC1, x2maxFromC2, bounds.x2[1]);
        const x2LowerRelax = bounds.x2[0];
        if (x2UpperRelax < x2LowerRelax) continue;
        const ub = c1 * x1 + c2 * x2UpperRelax;
        if (ub <= best.value) continue;
        const x2maxInt = Math.floor(x2UpperRelax);
        const x2minInt = Math.ceil(x2LowerRelax);
        for (let x2 = x2minInt; x2 <= x2maxInt; x2++) {
            if (a11 * x1 + a12 * x2 <= b1 && a21 * x1 + a22 * x2 <= b2) {
                const val = c1 * x1 + c2 * x2;
                if (val > best.value) best = { x1, x2, value: val };
            }
        }
    }
    return best;
}

export function solveILP2DTrace(
    c1: number,
    c2: number,
    a11: number,
    a12: number,
    b1: number,
    a21: number,
    a22: number,
    b2: number,
    bounds: Bounds,
): {
    result: ILPResult;
    steps: BranchStep[];
    feasible: Array<{ x1: number; x2: number; value: number }>;
} {
    let best: ILPResult = { x1: 0, x2: 0, value: -Infinity };
    const steps: BranchStep[] = [];
    const feasible: Array<{ x1: number; x2: number; value: number }> = [];

    for (
        let x1 = Math.ceil(bounds.x1[0]);
        x1 <= Math.floor(bounds.x1[1]);
        x1++
    ) {
        const x2maxFromC1 = (b1 - a11 * x1) / a12;
        const x2maxFromC2 = (b2 - a21 * x1) / a22;
        const x2UpperRelax = Math.min(x2maxFromC1, x2maxFromC2, bounds.x2[1]);
        const x2LowerRelax = bounds.x2[0];
        const ub = c1 * x1 + c2 * x2UpperRelax;
        const candidates: Array<
            { x2: number; feasible: boolean; value: number | null }
        > = [];

        if (x2UpperRelax >= x2LowerRelax && ub > best.value) {
            const x2maxInt = Math.floor(x2UpperRelax);
            const x2minInt = Math.ceil(x2LowerRelax);
            for (let x2 = x2minInt; x2 <= x2maxInt; x2++) {
                const feas = a11 * x1 + a12 * x2 <= b1 &&
                    a21 * x1 + a22 * x2 <= b2;
                if (feas) {
                    const val = c1 * x1 + c2 * x2;
                    candidates.push({ x2, feasible: true, value: val });
                    feasible.push({ x1, x2, value: val });
                    if (val > best.value) best = { x1, x2, value: val };
                } else {
                    candidates.push({ x2, feasible: false, value: null });
                }
            }
        }

        steps.push({
            x1,
            x2RelaxUpper: x2UpperRelax,
            ub,
            candidates,
            bestAfter: best.value === -Infinity ? null : { ...best },
        });
    }

    feasible.sort((a, b) => b.value - a.value);
    return { result: best, steps, feasible };
}

// CLI usage example
if (import.meta.main) {
    // Example corresponds to the lab statement
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
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(res));
}
