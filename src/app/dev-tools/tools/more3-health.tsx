"use client";
import { useState } from "react";
import { ToolWrap } from "../ui";

function Field({ label, value, set, step = 1 }: { label: string; value: number; set: (n: number) => void; step?: number }) {
  return <label className="text-sm block">{label}<input type="number" step={step} className="input-field mt-1 w-full" value={value} onChange={(e) => set(+e.target.value)} /></label>;
}
function Sex({ sex, set }: { sex: "m" | "f"; set: (s: "m" | "f") => void }) {
  return <div className="flex gap-2">{(["m", "f"] as const).map((s) => <button key={s} onClick={() => set(s)} className={`rounded-lg border px-4 py-1.5 text-sm ${sex === s ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{s === "m" ? "Male" : "Female"}</button>)}</div>;
}
function Big({ value, unit, sub }: { value: string; unit?: string; sub?: string }) {
  return <div className="surface rounded-xl border p-5 text-center"><div className="text-3xl font-black text-brand-600">{value}<span className="text-base font-normal text-muted"> {unit}</span></div>{sub && <div className="mt-1 text-sm text-muted">{sub}</div>}</div>;
}

/* ── BMR & Calories ── */
export function BMRCalorieCalc() {
  const [sex, setSex] = useState<"m" | "f">("m"), [age, setAge] = useState(30), [w, setW] = useState(70), [h, setH] = useState(175), [act, setAct] = useState(1.55);
  const bmr = 10 * w + 6.25 * h - 5 * age + (sex === "m" ? 5 : -161);
  const tdee = bmr * act;
  return (
    <ToolWrap>
      <div className="mb-3"><Sex sex={sex} set={setSex} /></div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3"><Field label="Age" value={age} set={setAge} /><Field label="Weight (kg)" value={w} set={setW} /><Field label="Height (cm)" value={h} set={setH} /></div>
      <label className="mb-4 block text-sm">Activity<select className="input-field mt-1 w-full" value={act} onChange={(e) => setAct(+e.target.value)}><option value={1.2}>Sedentary</option><option value={1.375}>Light (1-3 days)</option><option value={1.55}>Moderate (3-5 days)</option><option value={1.725}>Active (6-7 days)</option><option value={1.9}>Very active</option></select></label>
      <div className="grid grid-cols-2 gap-3"><Big value={Math.round(bmr).toString()} unit="kcal" sub="BMR (at rest)" /><Big value={Math.round(tdee).toString()} unit="kcal" sub="Maintenance / day" /></div>
      <p className="mt-2 text-center text-xs text-muted">Lose: ~{Math.round(tdee - 500)} · Gain: ~{Math.round(tdee + 500)} kcal/day</p>
    </ToolWrap>
  );
}

/* ── Body Fat (US Navy) ── */
export function BodyFatEstimator() {
  const [sex, setSex] = useState<"m" | "f">("m"), [h, setH] = useState(175), [neck, setNeck] = useState(38), [waist, setWaist] = useState(85), [hip, setHip] = useState(95);
  const log10 = Math.log10;
  let bf = 0;
  if (sex === "m") bf = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(h)) - 450;
  else bf = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.221 * log10(h)) - 450;
  const cat = bf < 14 ? "Athletic" : bf < 21 ? "Fitness" : bf < 25 ? "Average" : "High";
  return (
    <ToolWrap>
      <div className="mb-3"><Sex sex={sex} set={setSex} /></div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2"><Field label="Height (cm)" value={h} set={setH} /><Field label="Neck (cm)" value={neck} set={setNeck} /><Field label="Waist (cm)" value={waist} set={setWaist} />{sex === "f" && <Field label="Hip (cm)" value={hip} set={setHip} />}</div>
      <Big value={bf > 0 ? bf.toFixed(1) : "—"} unit="%" sub={`Body fat · ${cat}`} />
    </ToolWrap>
  );
}

/* ── Water Intake ── */
export function WaterIntakeCalc() {
  const [w, setW] = useState(70), [act, setAct] = useState(30);
  const ml = w * 33 + (act / 30) * 350;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-2"><Field label="Weight (kg)" value={w} set={setW} /><Field label="Exercise (min/day)" value={act} set={setAct} /></div><Big value={(ml / 1000).toFixed(1)} unit="L" sub={`≈ ${Math.round(ml)} ml · about ${Math.round(ml / 250)} glasses/day`} /></ToolWrap>;
}

/* ── Ideal Weight ── */
export function IdealWeightCalc() {
  const [sex, setSex] = useState<"m" | "f">("m"), [h, setH] = useState(175);
  const inchesOver5ft = Math.max(0, (h - 152.4) / 2.54);
  const devine = (sex === "m" ? 50 : 45.5) + 2.3 * inchesOver5ft;
  const robinson = (sex === "m" ? 52 : 49) + 1.9 * inchesOver5ft;
  const low = (18.5 * (h / 100) ** 2), high = (24.9 * (h / 100) ** 2);
  return <ToolWrap><div className="mb-3"><Sex sex={sex} set={setSex} /></div><div className="mb-4"><Field label="Height (cm)" value={h} set={setH} /></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Big value={devine.toFixed(1)} unit="kg" sub="Devine" /><Big value={robinson.toFixed(1)} unit="kg" sub="Robinson" /><Big value={`${low.toFixed(0)}–${high.toFixed(0)}`} unit="kg" sub="Healthy BMI range" /></div></ToolWrap>;
}

/* ── Pregnancy Due Date ── */
export function PregnancyDueDate() {
  const [lmp, setLmp] = useState(new Date().toISOString().split("T")[0]);
  const due = new Date(new Date(lmp).getTime() + 280 * 86400000);
  const weeks = Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000));
  return <ToolWrap><label className="mb-4 block text-sm">First day of last period<input type="date" className="input-field mt-1 w-full" value={lmp} onChange={(e) => setLmp(e.target.value)} /></label><Big value={due.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} sub={`Estimated due date · currently ~${weeks} weeks`} /></ToolWrap>;
}

/* ── Ovulation ── */
export function OvulationCalc() {
  const [lmp, setLmp] = useState(new Date().toISOString().split("T")[0]), [cycle, setCycle] = useState(28);
  const ov = new Date(new Date(lmp).getTime() + (cycle - 14) * 86400000);
  const start = new Date(ov.getTime() - 4 * 86400000), end = new Date(ov.getTime() + 1 * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="text-sm block">Last period start<input type="date" className="input-field mt-1 w-full" value={lmp} onChange={(e) => setLmp(e.target.value)} /></label><Field label="Cycle length (days)" value={cycle} set={setCycle} /></div><Big value={fmt(ov)} sub={`Ovulation day · fertile window ${fmt(start)} – ${fmt(end)}`} /></ToolWrap>;
}

/* ── Macros ── */
export function MacroCalculator() {
  const [cal, setCal] = useState(2200), [goal, setGoal] = useState<"balanced" | "lowcarb" | "highprotein">("balanced");
  const ratios = { balanced: [0.4, 0.3, 0.3], lowcarb: [0.2, 0.4, 0.4], highprotein: [0.3, 0.4, 0.3] }[goal];
  const [c, p, f] = ratios;
  return (
    <ToolWrap>
      <div className="mb-3"><Field label="Daily calories" value={cal} set={setCal} /></div>
      <div className="mb-4 flex gap-2">{(["balanced", "lowcarb", "highprotein"] as const).map((g) => <button key={g} onClick={() => setGoal(g)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${goal === g ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{g === "lowcarb" ? "Low carb" : g === "highprotein" ? "High protein" : "Balanced"}</button>)}</div>
      <div className="grid grid-cols-3 gap-3"><Big value={Math.round(cal * c / 4).toString()} unit="g" sub={`Carbs (${c * 100}%)`} /><Big value={Math.round(cal * p / 4).toString()} unit="g" sub={`Protein (${p * 100}%)`} /><Big value={Math.round(cal * f / 9).toString()} unit="g" sub={`Fat (${f * 100}%)`} /></div>
    </ToolWrap>
  );
}

/* ── Heart Rate Zones ── */
export function HeartRateZones() {
  const [age, setAge] = useState(30);
  const max = 220 - age;
  const zones: [string, number, number][] = [["Warm up", 0.5, 0.6], ["Fat burn", 0.6, 0.7], ["Cardio", 0.7, 0.8], ["Hard", 0.8, 0.9], ["Peak", 0.9, 1]];
  return (
    <ToolWrap>
      <div className="mb-3"><Field label="Age" value={age} set={setAge} /></div>
      <p className="mb-2 text-sm text-muted">Max HR ≈ <strong className="text-brand-600">{max} bpm</strong></p>
      <div className="space-y-1">{zones.map(([n, lo, hi]) => <div key={n} className="surface flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span>{n}</span><span className="font-mono text-brand-600">{Math.round(max * lo)}–{Math.round(max * hi)} bpm</span></div>)}</div>
    </ToolWrap>
  );
}

/* ── Sleep Calculator ── */
export function SleepCalculator() {
  const [wake, setWake] = useState("07:00");
  const [h, m] = wake.split(":").map(Number);
  const wakeMin = h * 60 + m;
  const times = [6, 5, 4].map((cycles) => { let t = wakeMin - (cycles * 90 + 15); t = ((t % 1440) + 1440) % 1440; return { cycles, h: Math.floor(t / 60), m: t % 60 }; });
  return (
    <ToolWrap>
      <label className="mb-4 block text-sm">I want to wake up at<input type="time" className="input-field mt-1 w-full" value={wake} onChange={(e) => setWake(e.target.value)} /></label>
      <p className="mb-2 text-sm text-muted">Go to bed at one of these times (each = full 90-min cycles):</p>
      <div className="grid grid-cols-3 gap-3">{times.map((t) => <div key={t.cycles} className="surface rounded-xl border p-3 text-center"><div className="text-2xl font-black text-brand-600">{String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}</div><div className="text-xs text-muted">{t.cycles} cycles · {(t.cycles * 1.5).toFixed(1)}h</div></div>)}</div>
    </ToolWrap>
  );
}
