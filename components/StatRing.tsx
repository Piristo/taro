"use client";

import { cn } from "../lib/utils";

type StatRingProps = {
  label: string;
  value: number;
  tone?: "gold" | "ember" | "ivory";
};

const toneMap: Record<NonNullable<StatRingProps["tone"]>, string> = {
  gold: "from-[#f7b267] to-[#f08c3a]",
  ember: "from-[#f5a85b] to-[#c96b2c]",
  ivory: "from-[#f0e1cf] to-[#c4a27d]",
};

export default function StatRing({ label, value, tone = "gold" }: StatRingProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="stat-card">
      <div
        className={cn("stat-ring", toneMap[tone])}
        style={{ background: `conic-gradient(#f08c3a ${clamped}%, rgba(255,255,255,0.06) 0)` }}
      >
        <div className="stat-core">
          <span className="stat-value">{clamped}%</span>
        </div>
      </div>
      <span className="stat-label">{label}</span>
    </div>
  );
}
