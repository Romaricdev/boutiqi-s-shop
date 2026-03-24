"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const CHART_ORANGE = "#F59E0B";
const CHART_GRID = "#E0DDD5";
const CHART_AXIS = "#A8A29E";
const CHART_TICK = "#78716C";

export type TrendDatum = { label: string; value: number };

type ChartMetric = "orders" | "revenue" | "customers";

/** Courbe monotone type d3 curveMonotoneX (évite Recharts / lodash avec Next). */
function monotonePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;

  const px = points.map((p) => p.x);
  const py = points.map((p) => p.y);
  const m: number[] = new Array(n);
  const eps = 1e-6;
  m[0] = (py[1] - py[0]) / (px[1] - px[0] || eps);
  for (let i = 1; i < n - 1; i++) {
    const h0 = px[i] - px[i - 1];
    const h1 = px[i + 1] - px[i];
    const s0 = (py[i] - py[i - 1]) / (h0 || eps);
    const s1 = (py[i + 1] - py[i]) / (h1 || eps);
    m[i] = (s0 * h1 + s1 * h0) / (h0 + h1 || eps);
  }
  m[n - 1] = (py[n - 1] - py[n - 2]) / (px[n - 1] - px[n - 2] || eps);

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (px[i + 1] - px[i]) / 3;
    d += ` C ${px[i] + dx} ${py[i] + m[i] * dx}, ${px[i + 1] - dx} ${py[i + 1] - m[i + 1] * dx}, ${px[i + 1]} ${py[i + 1]}`;
  }
  return d;
}

function formatYTick(v: number, metric: ChartMetric): string {
  if (metric === "revenue") {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
  }
  return `${Math.round(v)}`;
}

type Props = {
  data: TrendDatum[];
  chartMetric: ChartMetric;
  className?: string;
  /** Clic sur un point (ex. drill-down commandes). */
  onPointClick?: (index: number) => void;
};

export function AnalyticsSmoothChart({ data, chartMetric, className, onPointClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tip, setTip] = useState<{ label: string; value: number; left: number; top: number } | null>(null);

  const layout = useMemo(() => {
    const W = 520;
    const n = data.length;
    const denseAxis = n > 7;
    const H = denseAxis ? 258 : 240;
    const padL = chartMetric === "revenue" ? 44 : 32;
    const padR = 12;
    const padT = 10;
    const padB = denseAxis ? 50 : 28;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const maxVal = Math.max(1, ...data.map((d) => d.value));
    const ticks = 4;
    const tickValues = Array.from({ length: ticks + 1 }, (_, i) => (maxVal * i) / ticks);

    const xAt = (i: number) => {
      if (n <= 1) return padL + innerW / 2;
      return padL + (i / (n - 1)) * innerW;
    };
    const yAt = (v: number) => padT + innerH - (v / maxVal) * innerH;

    const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value), ...d }));

    const axisY = H - padB;

    return {
      W,
      H,
      padL,
      padR,
      padT,
      padB,
      innerW,
      innerH,
      maxVal,
      tickValues,
      xAt,
      yAt,
      pts,
      pathD: monotonePath(pts.map(({ x, y }) => ({ x, y }))),
      axisY,
      denseAxis,
    };
  }, [data, chartMetric]);

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const wrap = wrapRef.current;
      if (!wrap || data.length === 0) {
        setHoverIdx(null);
        setTip(null);
        return;
      }
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = layout.W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const dx = Math.abs(layout.xAt(i) - mx);
        if (dx < bestDist) {
          bestDist = dx;
          best = i;
        }
      }
      const br = wrap.getBoundingClientRect();
      setHoverIdx(best);
      setTip({
        label: data[best].label,
        value: data[best].value,
        left: e.clientX - br.left,
        top: e.clientY - br.top,
      });
    },
    [data, layout],
  );

  const onLeave = useCallback(() => {
    setHoverIdx(null);
    setTip(null);
  }, []);

  if (data.length === 0) {
    return (
      <div className={cn("flex min-h-[240px] items-center justify-center text-sm text-warm-500", className)}>
        Aucune donnée
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${layout.W} ${layout.H}`}
        className={cn("h-[260px] w-full", onPointClick ? "touch-manipulation" : "touch-none")}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* Grille horizontale */}
        {layout.tickValues.map((tv) => {
          const y = layout.yAt(tv);
          return (
            <line
              key={`h-${tv}`}
              x1={layout.padL}
              y1={y}
              x2={layout.W - layout.padR}
              y2={y}
              stroke={CHART_GRID}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}
        {/* Grille verticale */}
        {data.map((d, i) => {
          const x = layout.xAt(i);
          return (
            <line
              key={`v-${d.label}-${i}`}
              x1={x}
              y1={layout.padT}
              x2={x}
              y2={layout.H - layout.padB}
              stroke={CHART_GRID}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={layout.padL}
          y1={layout.H - layout.padB}
          x2={layout.W - layout.padR}
          y2={layout.H - layout.padB}
          stroke={CHART_AXIS}
          strokeWidth={1.5}
        />
        <line x1={layout.padL} y1={layout.padT} x2={layout.padL} y2={layout.H - layout.padB} stroke={CHART_AXIS} strokeWidth={1.5} />

        {/* Ticks Y */}
        {layout.tickValues.map((tv) => {
          const y = layout.yAt(tv);
          return (
            <text key={`yt-${tv}`} x={layout.padL - 6} y={y + 4} textAnchor="end" fill={CHART_TICK} fontSize={11}>
              {formatYTick(tv, chartMetric)}
            </text>
          );
        })}

        {/* Labels X — rotation + marge bas si beaucoup de points (évite le flou par superposition) */}
        {data.map((d, i) => {
          const x = layout.xAt(i);
          const { axisY, denseAxis } = layout;
          if (denseAxis) {
            return (
              <text
                key={`xl-${d.label}-${i}`}
                x={x}
                y={axisY}
                transform={`rotate(-44 ${x} ${axisY})`}
                textAnchor="end"
                dominantBaseline="middle"
                fill={CHART_TICK}
                fontSize={10}
              >
                {d.label}
              </text>
            );
          }
          return (
            <text
              key={`xl-${d.label}-${i}`}
              x={x}
              y={layout.H - 8}
              textAnchor="middle"
              fill={CHART_TICK}
              fontSize={11}
            >
              {d.label}
            </text>
          );
        })}

        {/* Courbe + points */}
        <path
          d={layout.pathD}
          fill="none"
          stroke={CHART_ORANGE}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {layout.pts.map((p, i) => (
          <circle
            key={`dot-${p.label}-${i}`}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 6 : 5}
            fill={CHART_ORANGE}
            stroke="#fff"
            strokeWidth={2}
            className={onPointClick ? "cursor-pointer outline-none" : undefined}
            role={onPointClick ? "button" : undefined}
            tabIndex={onPointClick ? 0 : undefined}
            onClick={(e) => {
              if (!onPointClick) return;
              e.stopPropagation();
              onPointClick(i);
            }}
            onKeyDown={(e) => {
              if (!onPointClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPointClick(i);
              }
            }}
          />
        ))}

        {hoverIdx !== null && (
          <line
            x1={layout.pts[hoverIdx].x}
            y1={layout.padT}
            x2={layout.pts[hoverIdx].x}
            y2={layout.H - layout.padB}
            stroke={CHART_GRID}
            strokeWidth={1}
            pointerEvents="none"
          />
        )}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-warm-200 bg-white px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: tip.left + 10, top: tip.top - 44 }}
        >
          <p className="font-semibold text-warm-800">{tip.label}</p>
          <p className="mt-0.5 font-medium" style={{ color: CHART_ORANGE }}>
            {chartMetric === "revenue" ? `${tip.value.toLocaleString("fr-FR")} F` : tip.value}
          </p>
        </div>
      )}
    </div>
  );
}
