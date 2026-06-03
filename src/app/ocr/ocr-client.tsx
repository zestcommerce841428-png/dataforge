"use client";

import { useCallback, useRef, useState } from "react";

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "rus", label: "Russian" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "chi_tra", label: "Chinese (Traditional)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "tur", label: "Turkish" },
  { code: "vie", label: "Vietnamese" },
  { code: "tha", label: "Thai" },
  { code: "heb", label: "Hebrew" },
  { code: "ukr", label: "Ukrainian" },
];

type OcrState = "idle" | "loading_engine" | "processing" | "done" | "error";

export function OcrClient() {
  const [lang, setLang] = useState("eng");
  const [state, setState] = useState<OcrState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workerRef = useRef<any>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file) return;

      const ACCEPTED = [
        "image/png", "image/jpeg", "image/webp", "image/bmp",
        "image/tiff", "image/gif", "application/pdf",
      ];
      if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|bmp|tiff?|gif|pdf)$/i)) {
        setError("Unsupported file type. Please upload a PNG, JPG, WebP, BMP, TIFF, GIF, or PDF.");
        setState("error");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError("File is too large (max 50 MB).");
        setState("error");
        return;
      }

      setFileName(file.name);
      setResult("");
      setConfidence(null);
      setError("");

      // Create a preview URL for images
      if (file.type !== "application/pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      setState("loading_engine");
      setProgress(0);
      setProgressLabel("Loading OCR engine…");

      try {
        // Dynamically import to avoid SSR issues
        const { createWorker } = await import("tesseract.js");

        // Terminate old worker if any
        if (workerRef.current) {
          await workerRef.current.terminate();
          workerRef.current = null;
        }

        const worker = await createWorker([lang], 1, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status) setProgressLabel(m.status);
            setProgress(Math.round((m.progress ?? 0) * 100));
          },
          workerBlobURL: false,
        } as Parameters<typeof createWorker>[2]);
        workerRef.current = worker;

        setState("processing");

        // For PDFs, extract text layer via pdf.js; fall back to OCR if no text layer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let imageSource: any = file;
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          try {
            const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
            GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
            const buf = await file.arrayBuffer();
            const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
            const page = await pdf.getPage(1);
            const scale = 2.0;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d")!;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await page.render({ canvasContext: ctx as any, canvas, viewport }).promise;
            imageSource = canvas;
            setPreviewUrl(canvas.toDataURL());
          } catch {
            // If pdf.js fails, pass file directly to Tesseract
          }
        }

        const { data } = await worker.recognize(imageSource);

        setResult(data.text.trim());
        setConfidence(Math.round(data.confidence));
        setState("done");
      } catch (e) {
        setError((e as Error).message || "OCR failed. Please try a different file.");
        setState("error");
      }
    },
    [lang]
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const copyResult = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.[^.]+$/, "") || "ocr-result") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setState("idle");
    setResult("");
    setConfidence(null);
    setError("");
    setFileName("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProgress(0);
  };

  const isProcessing = state === "loading_engine" || state === "processing";

  return (
    <div className="space-y-6">
      {/* Language selector */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="ocr-lang">
          Document language:
        </label>
        <select
          id="ocr-lang"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={isProcessing}
          className="surface rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">
          Supported formats: PNG, JPG, WebP, BMP, TIFF, GIF, PDF
        </span>
      </div>

      {/* Drop zone */}
      {state === "idle" || state === "error" ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload file for OCR"
          className={`relative flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
              : "border-[var(--border)] hover:border-brand-400"
          }`}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/webp,image/bmp,image/tiff,image/gif,application/pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.gif,.pdf"
            onChange={onFileInput}
          />
          <div className="mb-3 text-5xl opacity-60">📄</div>
          <p className="text-base font-semibold">
            Drop a file here or{" "}
            <span className="text-brand-600 underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            PNG, JPG, WebP, BMP, TIFF, GIF, PDF — up to 50 MB
          </p>
          {state === "error" && (
            <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              ⚠ {error}
            </p>
          )}
        </div>
      ) : null}

      {/* Processing state */}
      {isProcessing && (
        <div className="surface rounded-2xl border p-6">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium capitalize">{progressLabel || "Processing…"}</span>
            <span className="tabular-nums text-muted">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-center text-sm text-muted">
            Processing <span className="font-semibold">{fileName}</span>…
          </p>
        </div>
      )}

      {/* Result */}
      {state === "done" && (
        <div className="space-y-4">
          <div className="surface rounded-2xl border p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Extracted text</span>
                {confidence !== null && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    confidence >= 80
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : confidence >= 60
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {confidence}% confidence
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyResult}
                  className="surface rounded-lg border px-3 py-1.5 text-sm font-medium hover:border-brand-400 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadResult}
                  className="surface rounded-lg border px-3 py-1.5 text-sm font-medium hover:border-brand-400 transition-colors"
                >
                  Download .txt
                </button>
                <button
                  onClick={reset}
                  className="rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-muted hover:border-[var(--border)] transition-colors"
                >
                  New file
                </button>
              </div>
            </div>

            {/* Word / char count */}
            <div className="mb-3 flex gap-4 text-xs text-muted">
              <span>{result.split(/\s+/).filter(Boolean).length} words</span>
              <span>{result.length} characters</span>
              <span>{result.split(/\n/).length} lines</span>
            </div>

            {result ? (
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[var(--surface-2)] p-4 font-mono text-sm leading-relaxed">
                {result}
              </pre>
            ) : (
              <p className="text-sm text-muted italic">
                No text detected. Try a higher-resolution image or choose the correct language.
              </p>
            )}
          </div>

          {/* Image preview */}
          {previewUrl && (
            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
                Source image
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded source"
                className="max-h-64 w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="surface rounded-2xl border p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
          How it works
        </h2>
        <ul className="space-y-1.5 text-sm text-muted">
          <li>✓ Powered by <strong>Tesseract.js</strong> — the industry-standard open-source OCR engine, compiled to WebAssembly</li>
          <li>✓ <strong>100% client-side</strong> — your files are never uploaded to any server</li>
          <li>✓ Supports <strong>20+ languages</strong> including CJK scripts, Arabic, Hebrew, and Cyrillic</li>
          <li>✓ Works on photos, scanned documents, screenshots, and PDFs</li>
          <li>✓ Accuracy depends on image quality and resolution — 150+ DPI recommended</li>
        </ul>
      </div>
    </div>
  );
}
