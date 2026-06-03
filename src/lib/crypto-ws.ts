/* ── Binance WebSocket Manager ───────────────────────────────────────────────
 * Kafka-inspired event pipeline: messages are enqueued as they arrive from
 * the WebSocket, then flushed in batches every 100 ms to avoid excessive
 * React re-renders (analogous to a Kafka consumer-group poll loop).
 *
 * Reconnection uses exponential back-off: 1 s → 2 s → 4 s … → 32 s max.
 * ─────────────────────────────────────────────────────────────────────────── */

export type WSListener = (stream: string, data: unknown) => void;
export type StatusListener = (connected: boolean) => void;

const WS_BASE = "wss://stream.binance.com:9443/stream";

interface QueueItem {
  stream: string;
  data: unknown;
}

export class BinanceWSManager {
  private ws: WebSocket | null = null;
  private streams: Set<string> = new Set();
  private listeners: Set<WSListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private queue: QueueItem[] = [];
  private backoff = 1000;
  private destroyed = false;

  addStreams(streams: string[]): this {
    streams.forEach((s) => this.streams.add(s));
    return this;
  }

  subscribe(listener: WSListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatus(fn: StatusListener): () => void {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }

  connect(): this {
    if (this.destroyed || this.streams.size === 0) return this;
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    )
      return this;

    const url = `${WS_BASE}?streams=${[...this.streams].join("/")}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.backoff = 1000;
      this.statusListeners.forEach((fn) => fn(true));
      // Kafka consumer-poll pattern: drain queue every 100 ms
      this.flushTimer = setInterval(() => this._flush(), 100);
    };

    this.ws.onmessage = (e: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(e.data) as {
          stream?: string;
          data?: unknown;
        };
        if (msg.stream && msg.data !== undefined) {
          this.queue.push({ stream: msg.stream, data: msg.data });
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    this.ws.onclose = () => {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
      this.statusListeners.forEach((fn) => fn(false));
      if (!this.destroyed && this.streams.size > 0) {
        this.reconnectTimer = setTimeout(() => {
          this.backoff = Math.min(this.backoff * 2, 32000);
          this.connect();
        }, this.backoff);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };

    return this;
  }

  /** Swap the full stream list and reconnect immediately. */
  setStreams(streams: string[]): this {
    this.streams = new Set(streams);
    this.ws?.close(); // onclose will trigger reconnect
    return this;
  }

  private _flush() {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    this.listeners.forEach((listener) => {
      batch.forEach(({ stream, data }) => {
        try {
          listener(stream, data);
        } catch {
          /* isolate bad listeners */
        }
      });
    });
  }

  destroy() {
    this.destroyed = true;
    this.queue = [];
    this.listeners.clear();
    this.statusListeners.clear();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export function createBinanceWS(): BinanceWSManager {
  return new BinanceWSManager();
}
