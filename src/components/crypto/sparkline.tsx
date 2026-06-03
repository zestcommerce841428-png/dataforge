"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export function Sparkline({ data, width = 120, height = 40, positive }: SparklineProps) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const color = positive === false ? "#ef4444" : "#22c55e";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={pts} />
    </svg>
  );
}
