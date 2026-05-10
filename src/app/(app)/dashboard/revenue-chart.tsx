"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const months = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];

// Demo seed data — replaced by server data when payments exist.
const sampleData = months.map((m, i) => ({
  month: m,
  current: Math.round(8000 + i * 950 + Math.sin(i) * 1800),
  previous: Math.round(7200 + i * 720 + Math.cos(i) * 1500),
}));

export function RevenueChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampleData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="rev-current" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rev-previous" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(v: number) => [`${v.toLocaleString("sq-AL")} €`, ""]}
          />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            fill="url(#rev-previous)"
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#rev-current)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
