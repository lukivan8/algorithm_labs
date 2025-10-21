import React, { useMemo, useState } from 'react';
import { sortDatesDescending } from '../algorithms/sortDates';

type Props = {
  initialDates: string[];
};

export default function DateListLab({ initialDates }: Props) {
  const [dates, setDates] = useState<string[]>(() => [...initialDates]);

  const sortedPreview = useMemo(() => sortDatesDescending(dates), [dates]);

  function updateValue(idx: number, value: string) {
    setDates((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  function addDate() {
    setDates((prev) => [
      ...prev,
      new Date().toISOString().slice(0, 10),
    ]);
  }

  function removeDate(idx: number) {
    setDates((prev) => prev.filter((_, i) => i !== idx));
  }

  function shuffle() {
    setDates((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
  }

  function sortNow() {
    setDates((prev) => sortDatesDescending(prev));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Редактируемый список</h3>
          <div className="flex gap-2">
            <button onClick={addDate} className="px-3 py-1 rounded-md bg-accent/20 text-accent hover:bg-accent/30">+ дата</button>
            <button onClick={shuffle} className="px-3 py-1 rounded-md bg-card border border-border hover:bg-border/60">перемешать</button>
            <button onClick={sortNow} className="px-3 py-1 rounded-md bg-accent text-background hover:bg-accent-strong">отсортировать ↓</button>
          </div>
        </div>
        <p className="text-sm text-muted mb-3">Редактируйте список, перемешайте или отсортируйте по убыванию.</p>
        <ul className="space-y-2 max-h-[28rem] overflow-auto pr-1">
          {dates.map((d, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 p-2 rounded-md border border-border bg-card"
            >
              <span className="text-xs w-7 text-muted">{idx + 1}</span>
              <input
                value={d}
                onChange={(e) => updateValue(idx, e.target.value)}
                className="flex-1 bg-transparent outline-none"
                aria-label={`date-${idx}`}
              />
              <button onClick={() => removeDate(idx)} className="text-muted hover:text-foreground">×</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-3">Предпросмотр сортировки (убывание)</h3>
        <ol className="space-y-2 list-decimal list-inside max-h-[32rem] overflow-auto pr-1">
          {sortedPreview.map((d, i) => (
            <li key={`${d}-${i}`} className="text-sm text-foreground/90">{d}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}


