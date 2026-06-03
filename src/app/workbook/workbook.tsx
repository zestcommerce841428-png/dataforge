"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  computeValues, indexToCol, cellAddr,
  toStr, FUNCTION_COUNT, type CellValue,
} from "../formula-manager/engine";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

type NumFmt = "general" | "number" | "currency" | "percent" | "comma" | "scientific" | "date";

interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  color?: string;
  bg?: string;
  numFmt?: NumFmt;
  decimals?: number;
}

interface Sheet {
  name: string;
  rows: number;
  cols: number;
  cells: string[][];        // raw input (formulas start with "=")
  formats: (CellFormat | null)[][];
  colWidths: number[];
}

interface Selection { r1: number; c1: number; r2: number; c2: number; }

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */

const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 26;
const DEFAULT_COL_W = 96;

function emptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}
function emptyFormats(rows: number, cols: number): (CellFormat | null)[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function makeSheet(name: string, seed?: string[][]): Sheet {
  const cells = emptyGrid(DEFAULT_ROWS, DEFAULT_COLS);
  if (seed) seed.forEach((row, r) => row.forEach((v, c) => { if (cells[r]) cells[r][c] = v; }));
  return {
    name,
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    cells,
    formats: emptyFormats(DEFAULT_ROWS, DEFAULT_COLS),
    colWidths: Array.from({ length: DEFAULT_COLS }, () => DEFAULT_COL_W),
  };
}

const SAMPLE: string[][] = [
  ["Product", "Units", "Price", "Revenue", "Margin %"],
  ["Widget A", "120", "9.99", "=B2*C2", "0.42"],
  ["Widget B", "85", "14.5", "=B3*C3", "0.38"],
  ["Widget C", "200", "4.25", "=B4*C4", "0.55"],
  ["Gadget X", "60", "29.99", "=B5*C5", "0.61"],
  ["Gadget Y", "45", "49.99", "=B6*C6", "0.48"],
  ["", "", "", "", ""],
  ["Totals", "=SUM(B2:B6)", "=AVERAGE(C2:C6)", "=SUM(D2:D6)", "=AVERAGE(E2:E6)"],
  ["Top seller", "=INDEX(A2:A6,MATCH(MAX(D2:D6),D2:D6,0))", "", "", ""],
  ["Best margin", "=INDEX(A2:A6,MATCH(MAX(E2:E6),E2:E6,0))", "", "", ""],
];

function formatDisplay(value: CellValue, fmt: CellFormat | null): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "string") return value;
  const n = value;
  const d = fmt?.decimals;
  switch (fmt?.numFmt) {
    case "number": return n.toLocaleString("en-US", { minimumFractionDigits: d ?? 2, maximumFractionDigits: d ?? 2 });
    case "currency": return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d ?? 2, maximumFractionDigits: d ?? 2 });
    case "percent": return (n * 100).toFixed(d ?? 1) + "%";
    case "comma": return n.toLocaleString("en-US", { minimumFractionDigits: d ?? 0, maximumFractionDigits: d ?? 0 });
    case "scientific": return n.toExponential(d ?? 2);
    case "date": { const dt = new Date(n); return isNaN(dt.getTime()) ? String(n) : dt.toLocaleDateString("en-US"); }
    default:
      if (Number.isInteger(n)) return String(n);
      return String(Math.round(n * 1e10) / 1e10);
  }
}

function normSel(s: Selection) {
  return { r1: Math.min(s.r1, s.r2), c1: Math.min(s.c1, s.c2), r2: Math.max(s.r1, s.r2), c2: Math.max(s.c1, s.c2) };
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "dataforge-workbook-v1";

export function Workbook() {
  const [sheets, setSheets] = useState<Sheet[]>(() => [makeSheet("Sheet1", SAMPLE), makeSheet("Sheet2"), makeSheet("Sheet3")]);
  const [active, setActive] = useState(0);
  const [sel, setSel] = useState<Selection>({ r1: 0, c1: 0, r2: 0, c2: 0 });
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [formulaBar, setFormulaBar] = useState("");
  const [clipboard, setClipboard] = useState<{ cells: string[][]; formats: (CellFormat | null)[][]; cut?: boolean } | null>(null);
  const [history, setHistory] = useState<Sheet[][]>([]);
  const [future, setFuture] = useState<Sheet[][]>([]);
  const [dragging, setDragging] = useState(false);
  const [renaming, setRenaming] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const sheet = sheets[active];

  /* ── Persistence ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.sheets) && parsed.sheets.length) {
          setSheets(parsed.sheets);
          setActive(Math.min(parsed.active ?? 0, parsed.sheets.length - 1));
        }
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ sheets, active })); } catch { /* quota */ }
    }, 400);
    return () => clearTimeout(id);
  }, [sheets, active, hydrated]);

  /* ── Computed values for the active sheet ── */
  const { values, errors } = useMemo(() => computeValues(sheet.cells), [sheet.cells]);

  /* ── History snapshot ── */
  const snapshot = useCallback(() => {
    setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(sheets))]);
    setFuture([]);
  }, [sheets]);

  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.length) return h;
      setFuture(f => [JSON.parse(JSON.stringify(sheets)), ...f.slice(0, 49)]);
      setSheets(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, [sheets]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (!f.length) return f;
      setHistory(h => [...h, JSON.parse(JSON.stringify(sheets))]);
      setSheets(f[0]);
      return f.slice(1);
    });
  }, [sheets]);

  /* ── Mutators ── */
  const updateSheet = useCallback((fn: (s: Sheet) => Sheet, takeSnapshot = true) => {
    if (takeSnapshot) snapshot();
    setSheets(prev => prev.map((s, i) => (i === active ? fn(s) : s)));
  }, [active, snapshot]);

  const setCell = useCallback((r: number, c: number, raw: string) => {
    updateSheet(s => {
      const cells = s.cells.map(row => [...row]);
      cells[r][c] = raw;
      return { ...s, cells };
    });
  }, [updateSheet]);

  const setActiveCell = useCallback((r: number, c: number, extend = false) => {
    setSel(prev => extend ? { ...prev, r2: r, c2: c } : { r1: r, c1: c, r2: r, c2: c });
  }, []);

  /* ── Formula bar reflects the active (focus) cell ── */
  useEffect(() => {
    if (!editing) setFormulaBar(sheet.cells[sel.r2]?.[sel.c2] ?? "");
  }, [sel, sheet, editing]);

  /* ── Editing ── */
  const beginEdit = useCallback((r: number, c: number, initial?: string) => {
    setEditing({ r, c });
    setEditValue(initial !== undefined ? initial : (sheet.cells[r]?.[c] ?? ""));
    setTimeout(() => editInputRef.current?.focus(), 0);
  }, [sheet]);

  const commitEdit = useCallback((moveR = 1, moveC = 0) => {
    if (!editing) return;
    setCell(editing.r, editing.c, editValue);
    const nr = Math.max(0, Math.min(sheet.rows - 1, editing.r + moveR));
    const nc = Math.max(0, Math.min(sheet.cols - 1, editing.c + moveC));
    setEditing(null);
    setSel({ r1: nr, c1: nc, r2: nr, c2: nc });
    setTimeout(() => gridRef.current?.focus(), 0);
  }, [editing, editValue, setCell, sheet.rows, sheet.cols]);

  // Commit the value without moving the selection (used on blur / click-away).
  const commitValueOnly = useCallback(() => {
    if (!editing) return;
    setCell(editing.r, editing.c, editValue);
    setEditing(null);
  }, [editing, editValue, setCell]);

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setTimeout(() => gridRef.current?.focus(), 0);
  }, []);

  /* ── Formatting ── */
  const applyFormat = useCallback((patch: Partial<CellFormat> | ((f: CellFormat | null) => CellFormat)) => {
    const n = normSel(sel);
    updateSheet(s => {
      const formats = s.formats.map(row => [...row]);
      for (let r = n.r1; r <= n.r2; r++) {
        for (let c = n.c1; c <= n.c2; c++) {
          const cur = formats[r][c] ?? {};
          formats[r][c] = typeof patch === "function" ? patch(cur) : { ...cur, ...patch };
        }
      }
      return { ...s, formats };
    });
  }, [sel, updateSheet]);

  const toggleFmt = useCallback((key: "bold" | "italic" | "underline") => {
    const cur = sheet.formats[sel.r2]?.[sel.c2]?.[key];
    applyFormat({ [key]: !cur });
  }, [applyFormat, sheet.formats, sel]);

  const clearSelection = useCallback(() => {
    const n = normSel(sel);
    updateSheet(s => {
      const cells = s.cells.map(row => [...row]);
      for (let r = n.r1; r <= n.r2; r++) for (let c = n.c1; c <= n.c2; c++) cells[r][c] = "";
      return { ...s, cells };
    });
  }, [sel, updateSheet]);

  /* ── Clipboard ── */
  const copySelection = useCallback((cut = false) => {
    const n = normSel(sel);
    const cells: string[][] = [], formats: (CellFormat | null)[][] = [];
    for (let r = n.r1; r <= n.r2; r++) {
      const cr: string[] = [], fr: (CellFormat | null)[] = [];
      for (let c = n.c1; c <= n.c2; c++) { cr.push(sheet.cells[r][c]); fr.push(sheet.formats[r][c]); }
      cells.push(cr); formats.push(fr);
    }
    setClipboard({ cells, formats, cut });
    // Also push TSV to the system clipboard for cross-app paste
    const tsv = cells.map(row => row.join("\t")).join("\n");
    navigator.clipboard?.writeText(tsv).catch(() => {});
    if (cut) clearSelection();
  }, [sel, sheet, clearSelection]);

  const pasteClipboard = useCallback(() => {
    if (!clipboard) return;
    const startR = Math.min(sel.r1, sel.r2), startC = Math.min(sel.c1, sel.c2);
    updateSheet(s => {
      const cells = s.cells.map(row => [...row]);
      const formats = s.formats.map(row => [...row]);
      clipboard.cells.forEach((row, dr) => row.forEach((val, dc) => {
        const r = startR + dr, c = startC + dc;
        if (r < s.rows && c < s.cols) {
          cells[r][c] = val;
          formats[r][c] = clipboard.formats[dr]?.[dc] ?? null;
        }
      }));
      return { ...s, cells, formats };
    });
  }, [clipboard, sel, updateSheet]);

  /* ── Row / column ops ── */
  const insertRow = useCallback((at: number) => updateSheet(s => {
    const cells = s.cells.map(r => [...r]); cells.splice(at, 0, Array(s.cols).fill(""));
    const formats = s.formats.map(r => [...r]); formats.splice(at, 0, Array(s.cols).fill(null));
    return { ...s, rows: s.rows + 1, cells, formats };
  }), [updateSheet]);

  const deleteRow = useCallback((at: number) => updateSheet(s => {
    if (s.rows <= 1) return s;
    const cells = s.cells.filter((_, i) => i !== at);
    const formats = s.formats.filter((_, i) => i !== at);
    return { ...s, rows: s.rows - 1, cells, formats };
  }), [updateSheet]);

  const insertCol = useCallback((at: number) => updateSheet(s => {
    const cells = s.cells.map(r => { const n = [...r]; n.splice(at, 0, ""); return n; });
    const formats = s.formats.map(r => { const n = [...r]; n.splice(at, 0, null); return n; });
    const colWidths = [...s.colWidths]; colWidths.splice(at, 0, DEFAULT_COL_W);
    return { ...s, cols: s.cols + 1, cells, formats, colWidths };
  }), [updateSheet]);

  const deleteCol = useCallback((at: number) => updateSheet(s => {
    if (s.cols <= 1) return s;
    const cells = s.cells.map(r => r.filter((_, i) => i !== at));
    const formats = s.formats.map(r => r.filter((_, i) => i !== at));
    const colWidths = s.colWidths.filter((_, i) => i !== at);
    return { ...s, cols: s.cols - 1, cells, formats, colWidths };
  }), [updateSheet]);

  const addRows = useCallback((count: number) => updateSheet(s => ({
    ...s, rows: s.rows + count,
    cells: [...s.cells, ...Array.from({ length: count }, () => Array(s.cols).fill(""))],
    formats: [...s.formats, ...Array.from({ length: count }, () => Array(s.cols).fill(null))],
  })), [updateSheet]);

  /* ── Sheet tab ops ── */
  const addSheet = () => { snapshot(); setSheets(s => [...s, makeSheet(`Sheet${s.length + 1}`)]); setActive(sheets.length); };
  const deleteSheet = (i: number) => {
    if (sheets.length <= 1) return;
    snapshot();
    setSheets(s => s.filter((_, j) => j !== i));
    setActive(a => Math.max(0, a >= i ? a - 1 : a));
  };
  const renameSheet = (i: number, name: string) => { snapshot(); setSheets(s => s.map((sh, j) => j === i ? { ...sh, name } : sh)); };

  /* ── CSV / JSON ── */
  const exportCSV = () => {
    const csv = values.map(row => row.map(v => {
      const s = toStr(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    download(`${sheet.name}.csv`, csv, "text/csv");
  };
  const exportJSON = () => {
    const [header, ...rows] = sheet.cells;
    const json = rows.filter(r => r.some(c => c !== "")).map(r => Object.fromEntries(header.map((h, i) => [h || `col${i + 1}`, toStr(values[sheet.cells.indexOf(r)]?.[i] ?? r[i])])));
    download(`${sheet.name}.json`, JSON.stringify(json, null, 2), "application/json");
  };
  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const rows = parseCSV(text);
      snapshot();
      const cols = Math.max(DEFAULT_COLS, ...rows.map(r => r.length));
      const rowCount = Math.max(DEFAULT_ROWS, rows.length);
      const cells = emptyGrid(rowCount, cols);
      rows.forEach((row, r) => row.forEach((v, c) => { cells[r][c] = v; }));
      setSheets(prev => prev.map((s, i) => i === active ? {
        ...s, rows: rowCount, cols, cells,
        formats: emptyFormats(rowCount, cols),
        colWidths: Array.from({ length: cols }, () => DEFAULT_COL_W),
      } : s));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── Keyboard navigation ── */
  const onGridKeyDown = (e: React.KeyboardEvent) => {
    if (editing) return;
    const { r2, c2 } = sel;
    const meta = e.ctrlKey || e.metaKey;

    if (meta && e.key.toLowerCase() === "c") { e.preventDefault(); copySelection(false); return; }
    if (meta && e.key.toLowerCase() === "x") { e.preventDefault(); copySelection(true); return; }
    if (meta && e.key.toLowerCase() === "v") { e.preventDefault(); pasteClipboard(); return; }
    if (meta && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
    if (meta && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); return; }
    if (meta && e.key.toLowerCase() === "b") { e.preventDefault(); toggleFmt("bold"); return; }
    if (meta && e.key.toLowerCase() === "i") { e.preventDefault(); toggleFmt("italic"); return; }
    if (meta && e.key.toLowerCase() === "u") { e.preventDefault(); toggleFmt("underline"); return; }
    if (meta && e.key.toLowerCase() === "a") { e.preventDefault(); setSel({ r1: 0, c1: 0, r2: sheet.rows - 1, c2: sheet.cols - 1 }); return; }

    const move = (dr: number, dc: number) => {
      e.preventDefault();
      const nr = Math.max(0, Math.min(sheet.rows - 1, r2 + dr));
      const nc = Math.max(0, Math.min(sheet.cols - 1, c2 + dc));
      setActiveCell(nr, nc, e.shiftKey);
    };

    switch (e.key) {
      case "ArrowUp": move(-1, 0); break;
      case "ArrowDown": move(1, 0); break;
      case "ArrowLeft": move(0, -1); break;
      case "ArrowRight": move(0, 1); break;
      case "Tab": e.preventDefault(); move(0, e.shiftKey ? -1 : 1); break;
      case "Enter": e.preventDefault(); beginEdit(r2, c2); break;
      case "Delete": case "Backspace": e.preventDefault(); clearSelection(); break;
      case "Escape": setSel(s => ({ r1: s.r2, c1: s.c2, r2: s.r2, c2: s.c2 })); break;
      default:
        if (e.key.length === 1 && !meta && !e.altKey) { beginEdit(r2, c2, e.key); e.preventDefault(); }
    }
  };

  /* ── Selection statistics ── */
  const stats = useMemo(() => {
    const n = normSel(sel);
    const vals: number[] = [];
    let count = 0;
    for (let r = n.r1; r <= n.r2; r++) for (let c = n.c1; c <= n.c2; c++) {
      const v = values[r]?.[c];
      if (v !== null && v !== "") { count++; const num = Number(v); if (!isNaN(num) && isFinite(num)) vals.push(num); }
    }
    const sum = vals.reduce((s, v) => s + v, 0);
    return {
      count, numCount: vals.length, sum,
      avg: vals.length ? sum / vals.length : 0,
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
    };
  }, [sel, values]);

  const activeFmt = sheet.formats[sel.r2]?.[sel.c2] ?? null;
  const nsel = normSel(sel);
  const selRef = nsel.r1 === nsel.r2 && nsel.c1 === nsel.c2
    ? cellAddr(nsel.r1, nsel.c1)
    : `${cellAddr(nsel.r1, nsel.c1)}:${cellAddr(nsel.r2, nsel.c2)}`;

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="surface rounded-2xl border overflow-hidden select-none">
      {/* Toolbar */}
      <Toolbar
        onUndo={undo} onRedo={redo} canUndo={history.length > 0} canRedo={future.length > 0}
        activeFmt={activeFmt}
        onToggle={toggleFmt}
        onAlign={(a) => applyFormat({ align: a })}
        onColor={(color) => applyFormat({ color })}
        onBg={(bg) => applyFormat({ bg })}
        onNumFmt={(numFmt) => applyFormat({ numFmt })}
        onDecimals={(delta) => applyFormat(f => ({ ...f, decimals: Math.max(0, Math.min(10, (f?.decimals ?? 2) + delta)) }))}
        onClearFmt={() => applyFormat(() => ({}))}
        onInsertRow={() => insertRow(nsel.r1)}
        onDeleteRow={() => deleteRow(nsel.r1)}
        onInsertCol={() => insertCol(nsel.c1)}
        onDeleteCol={() => deleteCol(nsel.c1)}
        onExportCSV={exportCSV} onExportJSON={exportJSON} onImportCSV={importCSV}
      />

      {/* Name box + Formula bar */}
      <div className="flex items-stretch border-b border-app bg-[var(--surface-2)]">
        <div className="flex w-24 shrink-0 items-center justify-center border-r border-app px-2 font-mono text-sm font-semibold">
          {selRef}
        </div>
        <div className="flex items-center px-2 text-muted font-serif italic text-sm border-r border-app">fx</div>
        <input
          className="flex-1 bg-transparent px-3 py-1.5 font-mono text-sm outline-none"
          value={editing ? editValue : formulaBar}
          placeholder="Enter a value or formula (e.g. =SUM(A1:A5))"
          onChange={e => {
            if (editing) setEditValue(e.target.value);
            else { setFormulaBar(e.target.value); }
          }}
          onFocus={() => { if (!editing) { setEditing({ r: sel.r2, c: sel.c2 }); setEditValue(sheet.cells[sel.r2]?.[sel.c2] ?? ""); } }}
          onBlur={() => { if (editing) commitValueOnly(); }}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); commitEdit(1, 0); }
            else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
          }}
        />
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        tabIndex={0}
        onKeyDown={onGridKeyDown}
        className="overflow-auto outline-none"
        style={{ maxHeight: "60vh" }}
        onMouseUp={() => setDragging(false)}
      >
        <table className="border-collapse" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 h-7 w-12 border border-app bg-[var(--surface-2)]" />
              {Array.from({ length: sheet.cols }, (_, c) => (
                <th
                  key={c}
                  className={`sticky top-0 z-20 h-7 border border-app bg-[var(--surface-2)] text-xs font-semibold ${c >= nsel.c1 && c <= nsel.c2 ? "bg-brand-500/15 text-brand-600" : "text-muted"}`}
                  style={{ width: sheet.colWidths[c], minWidth: sheet.colWidths[c] }}
                  onClick={() => setSel({ r1: 0, c1: c, r2: sheet.rows - 1, c2: c })}
                >
                  {indexToCol(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: sheet.rows }, (_, r) => (
              <tr key={r}>
                <td
                  className={`sticky left-0 z-10 h-7 w-12 border border-app text-center text-xs font-semibold ${r >= nsel.r1 && r <= nsel.r2 ? "bg-brand-500/15 text-brand-600" : "bg-[var(--surface-2)] text-muted"}`}
                  onClick={() => setSel({ r1: r, c1: 0, r2: r, c2: sheet.cols - 1 })}
                >
                  {r + 1}
                </td>
                {Array.from({ length: sheet.cols }, (_, c) => {
                  const isEditing = editing?.r === r && editing?.c === c;
                  const inSel = r >= nsel.r1 && r <= nsel.r2 && c >= nsel.c1 && c <= nsel.c2;
                  const isAnchor = r === sel.r2 && c === sel.c2;
                  const fmt = sheet.formats[r]?.[c];
                  const val = values[r]?.[c];
                  const isErr = errors[r]?.[c];
                  const raw = sheet.cells[r]?.[c] ?? "";
                  const display = formatDisplay(val, fmt);
                  const isNum = typeof val === "number";
                  const align = fmt?.align ?? (isNum ? "right" : "left");
                  return (
                    <td
                      key={c}
                      className={`relative h-7 border p-0 ${isAnchor ? "border-brand-600 border-2 z-10" : inSel ? "border-brand-400/40 bg-brand-500/10" : "border-app"}`}
                      style={{ width: sheet.colWidths[c], minWidth: sheet.colWidths[c], background: !inSel ? fmt?.bg : undefined }}
                      onMouseDown={(e) => { if (!isEditing) { setDragging(true); setActiveCell(r, c, e.shiftKey); gridRef.current?.focus(); } }}
                      onMouseEnter={() => { if (dragging) setActiveCell(r, c, true); }}
                      onDoubleClick={() => beginEdit(r, c)}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          className="absolute inset-0 z-20 w-full border-0 bg-[var(--bg-base)] px-1 font-mono text-xs outline-none ring-2 ring-brand-500"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitValueOnly()}
                          onKeyDown={e => {
                            if (e.key === "Enter") { e.preventDefault(); commitEdit(1, 0); }
                            else if (e.key === "Tab") { e.preventDefault(); commitEdit(0, e.shiftKey ? -1 : 1); }
                            else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
                          }}
                        />
                      ) : (
                        <div
                          className="h-full w-full overflow-hidden whitespace-nowrap px-1 text-xs leading-7"
                          style={{
                            textAlign: align,
                            fontWeight: fmt?.bold ? 700 : undefined,
                            fontStyle: fmt?.italic ? "italic" : undefined,
                            textDecoration: fmt?.underline ? "underline" : undefined,
                            color: isErr ? "#ef4444" : fmt?.color,
                          }}
                          title={raw.startsWith("=") ? raw : undefined}
                        >
                          {display}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2">
          <button onClick={() => addRows(20)} className="rounded-lg border border-app px-3 py-1 text-xs text-muted hover:border-brand-400 hover:text-brand-600">
            + Add 20 rows
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 border-t border-app bg-[var(--surface-2)] px-3 py-1.5 text-xs text-muted overflow-x-auto">
        <span className="font-semibold">{selRef}</span>
        {stats.numCount > 0 && (
          <>
            <span>Sum: <b className="text-[var(--text)]">{stats.sum.toLocaleString("en-US", { maximumFractionDigits: 4 })}</b></span>
            <span>Avg: <b className="text-[var(--text)]">{stats.avg.toLocaleString("en-US", { maximumFractionDigits: 4 })}</b></span>
            <span>Min: <b className="text-[var(--text)]">{stats.min}</b></span>
            <span>Max: <b className="text-[var(--text)]">{stats.max}</b></span>
          </>
        )}
        <span>Count: <b className="text-[var(--text)]">{stats.count}</b></span>
        <span className="ml-auto whitespace-nowrap">{FUNCTION_COUNT}+ functions • autosaved</span>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1 border-t border-app bg-[var(--surface-2)] px-2 py-1.5">
        {sheets.map((s, i) => (
          <div key={i} className="group relative flex items-center">
            {renaming === i ? (
              <input
                autoFocus
                defaultValue={s.name}
                className="w-24 rounded border border-brand-400 bg-[var(--bg-base)] px-2 py-0.5 text-xs outline-none"
                onBlur={e => { renameSheet(i, e.target.value || s.name); setRenaming(null); }}
                onKeyDown={e => { if (e.key === "Enter") { renameSheet(i, (e.target as HTMLInputElement).value || s.name); setRenaming(null); } }}
              />
            ) : (
              <button
                onClick={() => setActive(i)}
                onDoubleClick={() => setRenaming(i)}
                className={`flex items-center gap-1 rounded-t-lg px-3 py-1 text-xs font-medium ${i === active ? "bg-[var(--bg-base)] text-brand-600 border border-app border-b-0" : "text-muted hover:bg-[var(--bg-base)]/50"}`}
              >
                {s.name}
                {sheets.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={e => { e.stopPropagation(); deleteSheet(i); }}
                    className="ml-1 hidden text-muted hover:text-red-500 group-hover:inline"
                  >×</span>
                )}
              </button>
            )}
          </div>
        ))}
        <button onClick={addSheet} className="rounded-full px-2 py-0.5 text-sm text-muted hover:bg-[var(--bg-base)] hover:text-brand-600" title="Add sheet">+</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOOLBAR
═══════════════════════════════════════════════════════════════════ */

function Toolbar(props: {
  onUndo: () => void; onRedo: () => void; canUndo: boolean; canRedo: boolean;
  activeFmt: CellFormat | null;
  onToggle: (k: "bold" | "italic" | "underline") => void;
  onAlign: (a: "left" | "center" | "right") => void;
  onColor: (c: string) => void;
  onBg: (c: string) => void;
  onNumFmt: (f: NumFmt) => void;
  onDecimals: (d: number) => void;
  onClearFmt: () => void;
  onInsertRow: () => void; onDeleteRow: () => void;
  onInsertCol: () => void; onDeleteCol: () => void;
  onExportCSV: () => void; onExportJSON: () => void;
  onImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const f = props.activeFmt;
  const Btn = ({ on, onClick, children, title }: { on?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <button title={title} onClick={onClick}
      className={`grid h-7 min-w-7 place-items-center rounded px-1.5 text-sm transition-colors ${on ? "bg-brand-500/20 text-brand-600" : "text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}>
      {children}
    </button>
  );
  const Sep = () => <div className="mx-1 h-5 w-px bg-[var(--border)]" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-app bg-[var(--bg-base)] px-2 py-1.5">
      <Btn onClick={props.onUndo} title="Undo (Ctrl+Z)">↶</Btn>
      <Btn onClick={props.onRedo} title="Redo (Ctrl+Y)">↷</Btn>
      <Sep />
      <Btn on={f?.bold} onClick={() => props.onToggle("bold")} title="Bold (Ctrl+B)"><b>B</b></Btn>
      <Btn on={f?.italic} onClick={() => props.onToggle("italic")} title="Italic (Ctrl+I)"><i>I</i></Btn>
      <Btn on={f?.underline} onClick={() => props.onToggle("underline")} title="Underline (Ctrl+U)"><u>U</u></Btn>
      <Sep />
      <Btn on={f?.align === "left"} onClick={() => props.onAlign("left")} title="Align left">⬅</Btn>
      <Btn on={f?.align === "center"} onClick={() => props.onAlign("center")} title="Align center">⬌</Btn>
      <Btn on={f?.align === "right"} onClick={() => props.onAlign("right")} title="Align right">➡</Btn>
      <Sep />
      <label className="grid h-7 w-7 cursor-pointer place-items-center rounded text-sm hover:bg-[var(--surface-2)]" title="Text color">
        <span className="font-bold" style={{ color: f?.color }}>A</span>
        <input type="color" className="sr-only" value={f?.color ?? "#000000"} onChange={e => props.onColor(e.target.value)} />
      </label>
      <label className="grid h-7 w-7 cursor-pointer place-items-center rounded text-sm hover:bg-[var(--surface-2)]" title="Fill color">
        <span className="rounded px-1" style={{ background: f?.bg ?? "transparent" }}>🖌</span>
        <input type="color" className="sr-only" value={f?.bg ?? "#ffff00"} onChange={e => props.onBg(e.target.value)} />
      </label>
      <Sep />
      <select
        title="Number format"
        value={f?.numFmt ?? "general"}
        onChange={e => props.onNumFmt(e.target.value as NumFmt)}
        className="h-7 rounded border border-app bg-[var(--surface-2)] px-1.5 text-xs outline-none"
      >
        <option value="general">General</option>
        <option value="number">Number</option>
        <option value="currency">Currency $</option>
        <option value="percent">Percent %</option>
        <option value="comma">Comma</option>
        <option value="scientific">Scientific</option>
        <option value="date">Date</option>
      </select>
      <Btn onClick={() => props.onDecimals(1)} title="Increase decimals">.0→</Btn>
      <Btn onClick={() => props.onDecimals(-1)} title="Decrease decimals">←.0</Btn>
      <Btn onClick={props.onClearFmt} title="Clear formatting">⌫</Btn>
      <Sep />
      <Btn onClick={props.onInsertRow} title="Insert row">+R</Btn>
      <Btn onClick={props.onDeleteRow} title="Delete row">−R</Btn>
      <Btn onClick={props.onInsertCol} title="Insert column">+C</Btn>
      <Btn onClick={props.onDeleteCol} title="Delete column">−C</Btn>
      <Sep />
      <label className="grid h-7 cursor-pointer place-items-center rounded px-2 text-xs text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Import CSV">
        Import
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={props.onImportCSV} />
      </label>
      <Btn onClick={props.onExportCSV} title="Export CSV"><span className="text-xs">CSV</span></Btn>
      <Btn onClick={props.onExportJSON} title="Export JSON"><span className="text-xs">JSON</span></Btn>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════════ */

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inStr = false; }
      else cur += c;
    } else {
      if (c === '"') inStr = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
