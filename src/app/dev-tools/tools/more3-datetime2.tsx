"use client";
import { useEffect, useState } from "react";
import { ToolWrap } from "../ui";

function Big({ value, sub }: { value: string; sub: string }) {
  return <div className="surface rounded-xl border p-5 text-center"><div className="text-3xl font-black text-brand-600">{value}</div><div className="mt-1 text-sm text-muted">{sub}</div></div>;
}

/* ── Zodiac Sign ── */
export function ZodiacSign() {
  const [date, setDate] = useState("2000-08-15");
  const d = new Date(date); const m = d.getMonth() + 1, day = d.getDate();
  const signs: [string, string, number, number][] = [
    ["Capricorn", "♑", 1, 19], ["Aquarius", "♒", 2, 18], ["Pisces", "♓", 3, 20], ["Aries", "♈", 4, 19],
    ["Taurus", "♉", 5, 20], ["Gemini", "♊", 6, 20], ["Cancer", "♋", 7, 22], ["Leo", "♌", 8, 22],
    ["Virgo", "♍", 9, 22], ["Libra", "♎", 10, 22], ["Scorpio", "♏", 11, 21], ["Sagittarius", "♐", 12, 21], ["Capricorn", "♑", 12, 31],
  ];
  const sign = signs.find(([, , mm, dd]) => m === mm && day <= dd) ?? signs[m - 1];
  return <ToolWrap><label className="mb-4 block text-sm">Birth date<input type="date" className="input-field mt-1 w-full" value={date} onChange={(e) => setDate(e.target.value)} /></label><Big value={`${sign[1]} ${sign[0]}`} sub="Western zodiac sign" /></ToolWrap>;
}

/* ── Chinese Zodiac ── */
export function ChineseZodiac() {
  const [year, setYear] = useState(2000);
  const animals = ["Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat"];
  const emoji = ["🐵", "🐔", "🐶", "🐷", "🐀", "🐂", "🐅", "🐇", "🐉", "🐍", "🐴", "🐐"];
  const i = ((year % 12) + 12) % 12;
  const elements = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth"];
  const el = elements[((year % 10) + 10) % 10];
  return <ToolWrap><label className="mb-4 block text-sm">Birth year<input type="number" className="input-field mt-1 w-full" value={year} onChange={(e) => setYear(+e.target.value)} /></label><Big value={`${emoji[i]} ${animals[i]}`} sub={`${el} ${animals[i]} year`} /></ToolWrap>;
}

/* ── Moon Phase ── */
export function MoonPhase() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const d = new Date(date);
  const lp = 2551443; // lunar period seconds
  const newMoon = new Date(1970, 0, 7, 20, 35, 0).getTime();
  const phase = ((d.getTime() - newMoon) / 1000) % lp;
  const idx = Math.floor((phase / lp) * 8 + 0.5) % 8;
  const names = ["🌑 New Moon", "🌒 Waxing Crescent", "🌓 First Quarter", "🌔 Waxing Gibbous", "🌕 Full Moon", "🌖 Waning Gibbous", "🌗 Last Quarter", "🌘 Waning Crescent"];
  const illum = Math.round((1 - Math.abs((phase / lp) * 2 - 1)) * 100);
  return <ToolWrap><label className="mb-4 block text-sm">Date<input type="date" className="input-field mt-1 w-full" value={date} onChange={(e) => setDate(e.target.value)} /></label><Big value={names[idx]} sub={`~${illum}% illuminated`} /></ToolWrap>;
}

/* ── Days Alive ── */
export function DaysAlive() {
  const [dob, setDob] = useState("2000-01-01");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = now - new Date(dob).getTime();
  const days = Math.floor(ms / 86400000);
  return <ToolWrap><label className="mb-4 block text-sm">Date of birth<input type="date" className="input-field mt-1 w-full" value={dob} onChange={(e) => setDob(e.target.value)} /></label><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Big value={days.toLocaleString()} sub="days" /><Big value={Math.floor(ms / 3600000).toLocaleString()} sub="hours" /><Big value={Math.floor(ms / 60000).toLocaleString()} sub="minutes" /><Big value={Math.floor(ms / 1000).toLocaleString()} sub="seconds" /></div></ToolWrap>;
}

/* ── Birthday Countdown ── */
export function BirthdayCountdown() {
  const [dob, setDob] = useState("2000-06-15");
  const now = new Date();
  const d = new Date(dob);
  let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
  const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
  const turning = next.getFullYear() - d.getFullYear();
  return <ToolWrap><label className="mb-4 block text-sm">Date of birth<input type="date" className="input-field mt-1 w-full" value={dob} onChange={(e) => setDob(e.target.value)} /></label><Big value={days === 0 ? "🎉 Today!" : `${days} days`} sub={`Until your birthday · turning ${turning}`} /></ToolWrap>;
}

/* ── Holiday Countdown ── */
export function HolidayCountdown() {
  const now = new Date(); const y = now.getFullYear();
  const holidays: [string, Date][] = [
    ["New Year", new Date(y + (now.getMonth() === 11 && now.getDate() > 1 ? 1 : 0), 0, 1)],
    ["Christmas", new Date(now > new Date(y, 11, 25) ? y + 1 : y, 11, 25)],
    ["Halloween", new Date(now > new Date(y, 9, 31) ? y + 1 : y, 9, 31)],
    ["Valentine's", new Date(now > new Date(y, 1, 14) ? y + 1 : y, 1, 14)],
  ];
  const days = (d: Date) => Math.ceil((d.getTime() - now.getTime()) / 86400000);
  return <ToolWrap><div className="grid grid-cols-2 gap-3">{holidays.map(([n, d]) => <div key={n} className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-brand-600">{days(d)}</div><div className="text-xs text-muted">days to {n}</div></div>)}</div></ToolWrap>;
}

/* ── Next Weekday Finder ── */
export function NextWeekdayFinder() {
  const [wd, setWd] = useState(1);
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const diff = (wd - now.getDay() + 7) % 7 || 7;
  const next = new Date(now.getTime() + diff * 86400000);
  return <ToolWrap><label className="mb-4 block text-sm">Find next<select className="input-field mt-1 w-full" value={wd} onChange={(e) => setWd(+e.target.value)}>{names.map((n, i) => <option key={i} value={i}>{n}</option>)}</select></label><Big value={next.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} sub={`Next ${names[wd]} · in ${diff} day(s)`} /></ToolWrap>;
}

/* ── Weekly Timecard ── */
export function WeeklyTimecard() {
  const [hours, setHours] = useState(["8", "8", "8", "8", "8", "0", "0"]);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const total = hours.reduce((s, h) => s + (parseFloat(h) || 0), 0);
  const ot = Math.max(0, total - 40);
  return <ToolWrap><div className="mb-3 grid grid-cols-7 gap-1">{days.map((d, i) => <div key={d} className="text-center"><div className="text-xs text-muted">{d}</div><input className="input-field mt-1 w-full px-1 text-center text-sm" value={hours[i]} onChange={(e) => setHours((h) => h.map((x, j) => j === i ? e.target.value : x))} /></div>)}</div><div className="grid grid-cols-2 gap-3"><Big value={total.toFixed(1) + "h"} sub="total this week" /><Big value={ot.toFixed(1) + "h"} sub="overtime (>40h)" /></div></ToolWrap>;
}

/* ── Season Finder ── */
export function SeasonFinder() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]), [hemi, setHemi] = useState<"n" | "s">("n");
  const m = new Date(date).getMonth();
  const nSeasons = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
  const emoji: Record<string, string> = { Winter: "❄️", Spring: "🌸", Summer: "☀️", Autumn: "🍂" };
  let season = nSeasons[m];
  if (hemi === "s") season = { Winter: "Summer", Summer: "Winter", Spring: "Autumn", Autumn: "Spring" }[season]!;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="text-sm block">Date<input type="date" className="input-field mt-1 w-full" value={date} onChange={(e) => setDate(e.target.value)} /></label><label className="text-sm block">Hemisphere<select className="input-field mt-1 w-full" value={hemi} onChange={(e) => setHemi(e.target.value as "n" | "s")}><option value="n">Northern</option><option value="s">Southern</option></select></label></div><Big value={`${emoji[season]} ${season}`} sub={`${hemi === "n" ? "Northern" : "Southern"} hemisphere`} /></ToolWrap>;
}
