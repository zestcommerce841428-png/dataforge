"use client";
import { useState, useEffect } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Timestamp Converter ── */
export function TimestampConverter() {
  const [ts, setTs] = useState(String(Math.floor(Date.now()/1000)));
  const [unit, setUnit] = useState<"s"|"ms">("s");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(()=>setNow(Date.now()), 1000); return ()=>clearInterval(id); }, []);
  const ms = unit==="ms" ? parseInt(ts) : parseInt(ts)*1000;
  const date = new Date(ms);
  const valid = !isNaN(date.getTime());
  const fromDate = (d: Date) => setTs(unit==="ms"?String(d.getTime()):String(Math.floor(d.getTime()/1000)));
  const FORMATS = [
    ["Local", date.toLocaleString()],
    ["UTC", date.toUTCString()],
    ["ISO 8601", date.toISOString()],
    ["Date", date.toLocaleDateString()],
    ["Time", date.toLocaleTimeString()],
    ["Unix (s)", String(Math.floor(ms/1000))],
    ["Unix (ms)", String(ms)],
  ];
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 font-mono" value={ts} onChange={e=>setTs(e.target.value)} placeholder="Unix timestamp…" />
        <select className="input-field w-24" value={unit} onChange={e=>setUnit(e.target.value as "s"|"ms")}>
          <option value="s">Seconds</option>
          <option value="ms">Milliseconds</option>
        </select>
        <button className="btn-secondary" onClick={()=>fromDate(new Date())}>Now</button>
      </div>
      {valid ? (
        <div className="space-y-2 mb-3">
          {FORMATS.map(([l,v])=>(
            <div key={l} className="surface flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className="text-xs text-muted w-20 shrink-0">{l}</span>
              <span className="font-mono text-xs flex-1">{v}</span>
              <CopyBtn text={v} />
            </div>
          ))}
        </div>
      ) : ts && <p className="text-sm text-red-500 mb-3">⚠ Invalid timestamp</p>}
      <div>
        <p className="text-xs text-muted mb-2">Or pick a date/time:</p>
        <input type="datetime-local" className="input-field" onChange={e=>fromDate(new Date(e.target.value))} />
      </div>
      <div className="mt-3 surface rounded-xl border p-3 flex items-center justify-between">
        <span className="text-xs text-muted">Current Unix time (live)</span>
        <span className="font-mono text-sm tabular-nums">{Math.floor(now/1000)}</span>
      </div>
    </ToolWrap>
  );
}

/* ── Date Calculator ── */
export function DateCalc() {
  const [date1, setDate1] = useState(new Date().toISOString().split("T")[0]);
  const [date2, setDate2] = useState(new Date(Date.now()+30*864e5).toISOString().split("T")[0]);
  const [addDate, setAddDate] = useState(new Date().toISOString().split("T")[0]);
  const [addDays, setAddDays] = useState(30);
  const d1 = new Date(date1), d2 = new Date(date2);
  const diffMs = d2.getTime()-d1.getTime();
  const diffDays = Math.round(diffMs/864e5);
  const diffWeeks = (diffDays/7).toFixed(1);
  const diffMonths = ((d2.getFullYear()-d1.getFullYear())*12+(d2.getMonth()-d1.getMonth())).toFixed(0);
  const added = new Date(new Date(addDate).getTime()+addDays*864e5).toISOString().split("T")[0];
  const subtracted = new Date(new Date(addDate).getTime()-addDays*864e5).toISOString().split("T")[0];
  return (
    <ToolWrap>
      <div className="mb-5">
        <p className="text-xs font-semibold text-muted mb-2">Difference between two dates</p>
        <div className="flex gap-3 mb-3 flex-wrap">
          <input type="date" className="input-field flex-1" value={date1} onChange={e=>setDate1(e.target.value)} />
          <span className="text-muted mt-2">→</span>
          <input type="date" className="input-field flex-1" value={date2} onChange={e=>setDate2(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[["Days",diffDays],["Weeks",diffWeeks],["Months",diffMonths]].map(([l,v])=>(
            <div key={String(l)} className="surface rounded-xl border p-3 text-center">
              <div className={`text-xl font-bold tabular-nums ${+v>=0?"text-green-600":"text-red-500"}`}>{+v>=0?"+":""}{v}</div>
              <div className="text-xs text-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted mb-2">Add / subtract days</p>
        <div className="flex gap-3 mb-3 flex-wrap">
          <input type="date" className="input-field flex-1" value={addDate} onChange={e=>setAddDate(e.target.value)} />
          <input type="number" className="input-field w-24" value={addDays} onChange={e=>setAddDays(+e.target.value)} placeholder="Days" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="surface rounded-xl border p-3 text-center">
            <div className="text-base font-bold text-green-600">+{addDays} days: {added}</div>
          </div>
          <div className="surface rounded-xl border p-3 text-center">
            <div className="text-base font-bold text-red-500">-{addDays} days: {subtracted}</div>
          </div>
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── Age Calculator ── */
export function AgeCalc() {
  const [dob, setDob] = useState("1990-01-01");
  const now = new Date();
  const birth = new Date(dob);
  const years = now.getFullYear()-birth.getFullYear()-(now<new Date(now.getFullYear(),birth.getMonth(),birth.getDate())?1:0);
  const totalDays = Math.floor((now.getTime()-birth.getTime())/864e5);
  const nextBirthday = new Date(now.getFullYear(),birth.getMonth(),birth.getDate());
  if (nextBirthday<=now) nextBirthday.setFullYear(now.getFullYear()+1);
  const daysUntil = Math.ceil((nextBirthday.getTime()-now.getTime())/864e5);
  const stats = [["Years old",years],["Total days",totalDays.toLocaleString()],["Total hours",(totalDays*24).toLocaleString()],["Days until birthday",daysUntil]];
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-4">
        <label className="text-sm flex-1"><span className="text-xs text-muted block mb-1">Date of birth</span><input type="date" className="input-field w-full" value={dob} onChange={e=>setDob(e.target.value)} max={now.toISOString().split("T")[0]} /></label>
      </div>
      {birth <= now && (
        <div className="grid grid-cols-2 gap-3">
          {stats.map(([l,v])=>(
            <div key={String(l)} className="surface rounded-xl border p-4 text-center">
              <div className="text-2xl font-black tabular-nums text-brand-600">{v}</div>
              <div className="text-xs text-muted mt-1">{l}</div>
            </div>
          ))}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Timezone Converter ── */
export function TimezoneConverter() {
  const [time, setTime] = useState(new Date().toISOString().slice(0,16));
  const ZONES = [
    "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
    "America/Toronto","America/Sao_Paulo","Europe/London","Europe/Paris","Europe/Berlin",
    "Europe/Moscow","Asia/Dubai","Asia/Kolkata","Asia/Singapore","Asia/Shanghai",
    "Asia/Tokyo","Asia/Seoul","Australia/Sydney","Pacific/Auckland","Pacific/Honolulu",
  ];
  const base = new Date(time);
  return (
    <ToolWrap>
      <input type="datetime-local" className="input-field w-full mb-4" value={time} onChange={e=>setTime(e.target.value)} />
      <div className="max-h-72 overflow-auto space-y-1.5">
        {ZONES.map(tz => {
          const fmt = new Intl.DateTimeFormat("en-US",{timeZone:tz,dateStyle:"short",timeStyle:"medium",hour12:false}).format(base);
          const offset = new Intl.DateTimeFormat("en-US",{timeZone:tz,timeZoneName:"short"}).formatToParts(base).find(p=>p.type==="timeZoneName")?.value||tz;
          return (
            <div key={tz} className="surface flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className="text-xs text-muted w-40 shrink-0 truncate">{tz}</span>
              <span className="font-mono text-xs flex-1">{fmt}</span>
              <span className="text-xs text-muted shrink-0">{offset}</span>
            </div>
          );
        })}
      </div>
    </ToolWrap>
  );
}

/* ── Countdown Timer ── */
export function CountdownTimer() {
  const [target, setTarget] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
  const diff = target ? Math.max(0, new Date(target).getTime()-now) : 0;
  const days = Math.floor(diff/864e5);
  const hours = Math.floor((diff%864e5)/36e5);
  const mins = Math.floor((diff%36e5)/6e4);
  const secs = Math.floor((diff%6e4)/1000);
  return (
    <ToolWrap>
      <input type="datetime-local" className="input-field w-full mb-4" value={target} onChange={e=>setTarget(e.target.value)} />
      {target && (
        <div className="grid grid-cols-4 gap-3">
          {[["Days",days],["Hours",hours],["Minutes",mins],["Seconds",secs]].map(([l,v])=>(
            <div key={String(l)} className="surface rounded-2xl border p-4 text-center">
              <div className="text-3xl font-black tabular-nums text-brand-600">{String(v).padStart(2,"0")}</div>
              <div className="text-xs text-muted">{l}</div>
            </div>
          ))}
        </div>
      )}
      {target && diff===0 && <p className="text-center text-green-600 font-bold mt-4">🎉 Time reached!</p>}
    </ToolWrap>
  );
}

/* ── Stopwatch ── */
export function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  useEffect(()=>{
    if(!running) return;
    const id=setInterval(()=>setElapsed(Date.now()-startTime),10);
    return()=>clearInterval(id);
  },[running,startTime]);
  const start = ()=>{setStartTime(Date.now()-elapsed);setRunning(true);};
  const stop = ()=>setRunning(false);
  const reset = ()=>{setRunning(false);setElapsed(0);setLaps([]);};
  const lap = ()=>setLaps(l=>[...l,elapsed]);
  const fmt = (ms:number)=>{const s=Math.floor(ms/1000)%60,m=Math.floor(ms/60000)%60,h=Math.floor(ms/3600000),centis=Math.floor(ms%1000/10);return`${h?h+":":""}${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(centis).padStart(2,"0")}`;};
  return (
    <ToolWrap>
      <div className="text-center mb-4">
        <div className="font-mono text-5xl font-black tabular-nums text-brand-600">{fmt(elapsed)}</div>
      </div>
      <div className="flex justify-center gap-3 mb-4">
        {!running ? <button className="btn-primary px-8" onClick={start}>{elapsed>0?"Resume":"Start"}</button> : <button className="btn-secondary px-8" onClick={stop}>Stop</button>}
        <button className="btn-secondary" onClick={lap} disabled={!running}>Lap</button>
        <button className="btn-secondary" onClick={reset}>Reset</button>
      </div>
      {laps.length>0&&(
        <div className="max-h-40 overflow-auto space-y-1">
          {[...laps].reverse().map((l,i)=>(
            <div key={i} className="surface flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm">
              <span className="text-muted">Lap {laps.length-i}</span>
              <span className="font-mono">{fmt(l)}</span>
              {i>0&&<span className="font-mono text-xs text-muted">+{fmt(l-laps[laps.length-i-2])}</span>}
            </div>
          ))}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── World Clock ── */
export function WorldClock() {
  const [now, setNow] = useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id);},[]);
  const CITIES = [
    ["New York","America/New_York"],["Los Angeles","America/Los_Angeles"],["London","Europe/London"],
    ["Paris","Europe/Paris"],["Dubai","Asia/Dubai"],["Mumbai","Asia/Kolkata"],["Singapore","Asia/Singapore"],
    ["Tokyo","Asia/Tokyo"],["Sydney","Australia/Sydney"],["São Paulo","America/Sao_Paulo"],
    ["Toronto","America/Toronto"],["Moscow","Europe/Moscow"],
  ];
  return (
    <ToolWrap>
      <div className="grid gap-2 sm:grid-cols-2">
        {CITIES.map(([city,tz])=>{
          const fmt = new Intl.DateTimeFormat("en-US",{timeZone:tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
          const date = new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"short",month:"short",day:"numeric"}).format(now);
          const h = parseInt(fmt);
          const isDay = h>=6&&h<20;
          return (
            <div key={city} className="surface flex items-center gap-3 rounded-xl border p-3">
              <span className="text-xl">{isDay?"☀️":"🌙"}</span>
              <div>
                <div className="text-sm font-semibold">{city}</div>
                <div className="text-xs text-muted">{date}</div>
              </div>
              <div className="ml-auto font-mono text-lg font-bold tabular-nums">{fmt}</div>
            </div>
          );
        })}
      </div>
    </ToolWrap>
  );
}
