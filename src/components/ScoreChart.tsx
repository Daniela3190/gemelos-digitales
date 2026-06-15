"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ScoreMensual } from "@/lib/types";
import { formatMonth } from "@/lib/utils";

export default function ScoreChart({ scores }: { scores: ScoreMensual[] }) {
  const data = scores.map((s) => ({
    mes: formatMonth(s.mes),
    General: s.score_general,
    Atención: s.atencion,
    Suavidad: s.suavidad,
    Legalidad: s.legal,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="mes"
          tick={{ fill: "#475569", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#475569", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            color: "#f1f5f9",
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ color: "#64748b", fontSize: 11, paddingTop: 4 }}
        />
        <Line
          type="monotone"
          dataKey="General"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="Atención"
          stroke="#eab308"
          strokeWidth={1.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Suavidad"
          stroke="#22c55e"
          strokeWidth={1.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Legalidad"
          stroke="#a78bfa"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
