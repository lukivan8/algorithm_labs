import React, { useMemo, useState } from 'react';
import { rearrangeStacks } from '../algorithms/stacksRearrange';

type Stack = number[];

function parseInput(raw: string): { stacks: Stack[]; error?: string } {
  const text = raw.trim();
  if (!text) return { stacks: [], error: 'Пустой ввод' };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const n = Number(lines[0]);
  if (!Number.isInteger(n) || n <= 0) return { stacks: [], error: 'Некорректное N' };
  if (lines.length - 1 < n) return { stacks: [], error: 'Недостаточно строк для стопок' };
  const stacks: Stack[] = [];
  for (let i = 0; i < n; i++) {
    const parts = lines[i + 1].split(/\s+/).map(Number);
    if (parts.length === 0) return { stacks: [], error: `Пустая строка ${i + 2}` };
    const k = parts[0];
    const items = parts.slice(1, 1 + k);
    if (items.length !== k) return { stacks: [], error: `Несовпадение количества k на строке ${i + 2}` };
    stacks.push(items);
  }
  return { stacks };
}

const sample = `3\n2 1 2\n2 3 1\n1 3`;

export default function StacksLab() {
  const [input, setInput] = useState<string>(sample);

  const parsed = useMemo(() => parseInput(input), [input]);
  const result = useMemo(() => {
    if (parsed.error) return null;
    return rearrangeStacks(parsed.stacks);
  }, [parsed]);

  return (
    <div className="card p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium mb-2">Ввод</h3>
        <textarea
          className="w-full h-56 bg-card border border-border rounded-md p-3 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {parsed.error ? (
          <p className="mt-2 text-sm text-red-400">{parsed.error}</p>
        ) : (
          <p className="mt-2 text-sm text-muted">N={parsed.stacks.length}. Формат: первая строка N, далее k и k значений (снизу вверх).</p>
        )}
      </div>
      <div>
        <h3 className="font-medium mb-2">Результат</h3>
        {!result ? (
          <p className="text-sm text-muted">Исправьте ввод, чтобы увидеть решение.</p>
        ) : !result.possible ? (
          <pre className="text-sm">0</pre>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted mb-1">Ходы (from to):</div>
              <pre className="text-sm max-h-64 overflow-auto">{result.moves.map((m) => m.join(' ')).join('\n')}</pre>
            </div>
            <div>
              <div className="text-sm text-muted mb-1">Итоговые стопки (снизу вверх):</div>
              <pre className="text-sm">{JSON.stringify(result.finalStacks)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


