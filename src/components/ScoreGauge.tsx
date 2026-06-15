import { scoreColor } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreGauge({ score, label, size = 80 }: ScoreGaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const stroke = size * 0.08;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, score / 100)) * circumference;
  const color = scoreColor(score);

  return (
    <div style={{ textAlign: "center", flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text
          x={cx}
          y={cy + size * 0.08}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.24}
          fontWeight="700"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          {score}
        </text>
      </svg>
      <div
        style={{
          fontSize: Math.max(10, size * 0.14) + "px",
          color: "#64748b",
          marginTop: "4px",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}
