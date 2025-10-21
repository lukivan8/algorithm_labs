import React, { useMemo, useState } from 'react';
import { createGraph, hasCycle } from '../algorithms/graph';

type Edge = [number, number];

function parseInput(raw: string): { n: number; edges: Edge[]; error?: string } {
  const text = raw.trim();
  if (!text) return { n: 0, edges: [], error: 'Пустой ввод' };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const headerNums = lines[0].split(/\s+/).map(Number);
  if (headerNums.length < 1) return { n: 0, edges: [], error: 'Первая строка: "V [E]"' };
  const n = headerNums[0];
  let m = headerNums.length >= 2 ? headerNums[1] : lines.length - 1; // если E не указано — берём все строки
  if (!Number.isInteger(n) || n <= 0) return { n: 0, edges: [], error: 'Некорректное V' };
  const edges: Edge[] = [];
  m = Math.min(m, lines.length - 1);
  for (let i = 0; i < m; i++) {
    const row = lines[i + 1];
    if (!row) return { n, edges, error: 'Недостаточно строк для рёбер' };
    const [uStr, vStr] = row.split(/\s+/);
    const u = Number(uStr), v = Number(vStr);
    if (!Number.isInteger(u) || !Number.isInteger(v)) return { n, edges, error: `Неверное ребро на строке ${i + 2}` };
    if (u < 0 || u >= n || v < 0 || v >= n) return { n, edges, error: `Вершины вне диапазона на строке ${i + 2}` };
    edges.push([u, v]);
  }
  return { n, edges };
}

function layoutCircle(n: number, radius = 120, cx = 150, cy = 150): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }
  return pts;
}

const presets: Array<{ label: string; text: string; directed?: boolean }> = [
  { label: 'Цикл 5 (неорг.)', text: `5 5\n0 1\n1 2\n2 3\n3 4\n4 0`, directed: false },
  { label: 'Дерево 5', text: `5 4\n0 1\n0 2\n1 3\n1 4`, directed: false },
  { label: 'DAG 5', text: `5 5\n0 1\n0 2\n1 3\n2 3\n3 4`, directed: true },
  { label: 'Напр. цикл 3', text: `3 3\n0 1\n1 2\n2 0`, directed: true },
  { label: 'Двудольный без цикла', text: `6 5\n0 3\n0 4\n1 4\n1 5\n2 5`, directed: false },
];

const sample = presets[0].text;

export default function GraphLab() {
  const [input, setInput] = useState<string>(sample);
  const [directed, setDirected] = useState<boolean>(presets[0].directed ?? false);
  const [presetIdx, setPresetIdx] = useState<number>(0);

  const parsed = useMemo(() => parseInput(input), [input]);
  const result = useMemo(() => {
    if (parsed.error) return null;
    const g = createGraph(parsed.n, parsed.edges, directed);
    return { hasCycle: hasCycle(g, directed), n: parsed.n, edges: parsed.edges };
  }, [parsed, directed]);

  const positions = useMemo(() => layoutCircle(parsed.error ? 0 : parsed.n), [parsed]);

  return (
    <div className="card p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium mb-2">Ввод</h3>
        <div className="flex items-center gap-3 mb-2">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={directed} onChange={(e) => setDirected(e.target.checked)} />
            Направленный граф
          </label>
          <button
            className="px-3 py-1 rounded-md bg-accent text-background hover:bg-accent-strong text-sm"
            onClick={() => {
              const next = (presetIdx + 1) % presets.length;
              setPresetIdx(next);
              setInput(presets[next].text);
              if (typeof presets[next].directed === 'boolean') setDirected(!!presets[next].directed);
            }}
          >
            Сгенерировать (#{presetIdx + 1})
          </button>
        </div>
        <textarea
          className="w-full h-52 bg-card border border-border rounded-md p-3 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <p className="mt-2 text-sm text-muted">Формат: первая строка "V E", далее E строк с парами вершин "u v" (0..V-1).</p>
        {parsed.error && <p className="text-sm text-red-400 mt-2">{parsed.error}</p>}
      </div>

      <div>
        <h3 className="font-medium mb-2">Визуализация и результат</h3>
        {!result ? (
          <p className="text-sm text-muted">Исправьте ввод, чтобы увидеть результат.</p>
        ) : (
          <div className="space-y-3">
            <div className="text-sm">Цикл: <span className={result.hasCycle ? 'text-accent' : 'text-muted'}>{result.hasCycle ? 'есть' : 'нет'}</span></div>
            <svg viewBox="0 0 300 300" className="w-full h-[300px] bg-surface rounded-md border border-border">
              {result.edges.map(([u, v], idx) => {
                if (u >= positions.length || v >= positions.length) return null;
                const a = positions[u], b = positions[v];
                const midx = (a.x + b.x) / 2, midy = (a.y + b.y) / 2;
                return (
                  <g key={idx}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6b7280" strokeWidth={1.5} />
                    {directed && (
                      <polygon points={`${midx},${midy} ${midx - 4},${midy - 4} ${midx + 4},${midy - 4}`} fill="#6b7280" />
                    )}
                  </g>
                );
              })}
              {positions.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={12} fill="#f6c453" />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fill="#11100e">{i}</text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}


