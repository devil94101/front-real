import { cn } from "../utils/cn";

export interface ChartDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  size = 168,
  thickness = 20,
  centerLabel,
  centerValue,
}: {
  data: ChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#eef1f6"
            strokeWidth={thickness}
          />
          {data.map((d, i) => {
            const fraction = d.value / total;
            const len = fraction * circumference;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                style={{ transition: "stroke-dasharray .6s ease, stroke-dashoffset .6s ease" }}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        {(centerValue || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-extrabold text-ink-900">
              {centerValue}
            </span>
            {centerLabel && (
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="font-medium text-slate-600">{d.label}</span>
            <span className="ml-auto font-bold text-ink-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBarChart({
  data,
  format = (v) => v.toLocaleString(),
  className,
}: {
  data: ChartDatum[];
  format?: (v: number) => string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("space-y-3", className)}>
      {data.map((d, i) => (
        <div key={i} className="group">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">{d.label}</span>
            <span className="font-bold text-ink-900">{format(d.value)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
