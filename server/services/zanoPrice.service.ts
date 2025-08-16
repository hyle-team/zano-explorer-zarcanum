import axios from "axios";
import ZanoPrice from "../schemes/ZanoPrice";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const LIMIT = 1000;
const BASE_URL = `https://api.mexc.com/api/v3/klines?symbol=ZANOUSDT&interval=4h&limit=${LIMIT}`;

function alignTo4hUTC(ms: number) {
  return Math.floor(ms / FOUR_HOURS_MS) * FOUR_HOURS_MS;
}

async function fetch4hRange(startMs: number, endMs: number) {
  const url = `${BASE_URL}&startTime=${startMs}&endTime=${endMs}`;
  const res = await axios.get(url);
  if (!Array.isArray(res.data) || res.data.length === 0) return [];

  return res.data.map((row: any[]) => ({
    ts_utc: Number(row[0]),
    price_close: String(row[4]),
    raw: row,
  }));
}

export async function backfill(fromMs: number, toMs: number) {
  let currentStart = alignTo4hUTC(fromMs);
  let currentEnd = currentStart + FOUR_HOURS_MS * LIMIT;

  while (currentStart < toMs) {
    const candles = await fetch4hRange(currentStart, currentEnd);
    if (!candles.length) break;

    await ZanoPrice.bulkCreate(candles, {
      updateOnDuplicate: ["price_close", "raw"],
    });

    console.log(
      `[BACKFILL] ${candles.length} candles saved, start: ${new Date(
        candles[0].ts_utc
      ).toISOString()}`
    );

    currentStart = candles[candles.length - 1].ts_utc + FOUR_HOURS_MS;
    currentEnd = currentStart + FOUR_HOURS_MS * LIMIT;
  }
}

export async function syncLatest() {
  const lastRow = await ZanoPrice.findOne({
    attributes: ["ts_utc"],
    order: [["ts_utc", "DESC"]],
    raw: true,
  });

  const nowAligned = alignTo4hUTC(Date.now());

  let lastTsMs: number | null = null;
  if (lastRow && (lastRow as any).ts_utc != null) {
    const tmp = Number((lastRow as any).ts_utc);
    lastTsMs = Math.min(tmp, nowAligned);
  }

  const from =
    lastTsMs !== null ? lastTsMs + FOUR_HOURS_MS : nowAligned - 365 * 24 * 60 * 60 * 1000;

  if (from >= nowAligned) {
    console.log("[SYNC] Nothing to sync. from >= nowAligned", {
      fromISO: new Date(from).toISOString(),
      nowAlignedISO: new Date(nowAligned).toISOString(),
    });
    return;
  }

  console.log("[SYNC] Running backfill", {
    lastTsISO: lastTsMs ? new Date(lastTsMs).toISOString() : null,
    fromISO: new Date(from).toISOString(),
    toISO: new Date(nowAligned).toISOString(),
  });

  await backfill(from, nowAligned);
}