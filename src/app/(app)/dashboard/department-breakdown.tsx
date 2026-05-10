"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(243 75% 59%)",
  "hsl(160 84% 39%)",
  "hsl(199 89% 48%)",
  "hsl(38 92% 50%)",
  "hsl(280 80% 60%)",
  "hsl(340 80% 55%)",
];

const fallback = [
  { name: "Biokimi", value: 12 },
  { name: "Pediatri", value: 8 },
  { name: "Kardiologji", value: 6 },
  { name: "Stomatologji", value: 5 },
  { name: "Mikrobiologji", value: 4 },
  { name: "Të tjera", value: 3 },
];

interface Datum {
  name: string;
  value: number;
}

export function DepartmentBreakdown({ data }: { data: Datum[] }) {
  const series = data.length > 0 ? data : fallback;
  const total = series.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="h-[180px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={series}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="hsl(var(--background))"
            >
              {series.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold tracking-tight">{total}</div>
          <div className="text-xs text-muted-foreground">vizita</div>
        </div>
      </div>
      <ul className="space-y-2">
        {series.slice(0, 6).map((d, i) => (
          <li key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="truncate">{d.name}</span>
            </div>
            <span className="font-medium">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
