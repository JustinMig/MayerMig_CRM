import { inflateRawSync } from 'node:zlib';
import { requireCrmUser } from '../server/communications.js';

const LANDSCAPE_URL = 'https://www.cms.gov/files/zip/cy2027-landscape-202609-1.zip';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
let landscapeCache = null;
let landscapeLoadedAt = 0;

function u16(view, offset) { return view.getUint16(offset, true); }
function u32(view, offset) { return view.getUint32(offset, true); }

function unzipCsv(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (u32(view, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('CMS Landscape ZIP could not be read.');
  const entries = u16(view, eocd + 10);
  let offset = u32(view, eocd + 16);
  const decoder = new TextDecoder();

  for (let index = 0; index < entries; index++) {
    if (u32(view, offset) !== 0x02014b50) throw new Error('CMS Landscape ZIP directory is invalid.');
    const method = u16(view, offset + 10);
    const compressedSize = u32(view, offset + 20);
    const fileNameLength = u16(view, offset + 28);
    const extraLength = u16(view, offset + 30);
    const commentLength = u16(view, offset + 32);
    const localOffset = u32(view, offset + 42);
    const fileName = decoder.decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));

    if (/\.csv$/i.test(fileName) && /landscape/i.test(fileName)) {
      if (u32(view, localOffset) !== 0x04034b50) throw new Error('CMS Landscape ZIP entry is invalid.');
      const localNameLength = u16(view, localOffset + 26);
      const localExtraLength = u16(view, localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(dataStart, dataStart + compressedSize);
      const raw = method === 0 ? compressed : method === 8 ? inflateRawSync(compressed) : null;
      if (!raw) throw new Error('CMS Landscape ZIP compression is not supported.');
      return decoder.decode(raw);
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  throw new Error('CMS Landscape CSV was not found.');
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
function columnIndex(headers, candidates) {
  const normalized = headers.map(norm);
  for (const candidate of candidates) {
    const index = normalized.indexOf(norm(candidate));
    if (index >= 0) return index;
  }
  return -1;
}

async function loadLandscape() {
  if (landscapeCache && Date.now() - landscapeLoadedAt < CACHE_TTL_MS) return landscapeCache;
  const response = await fetch(LANDSCAPE_URL, { headers: { Accept: 'application/zip' }, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error('CMS 2027 Landscape is temporarily unavailable.');
  const csv = unzipCsv(await response.arrayBuffer());
  const rows = parseCsv(csv);
  const headers = rows.shift() || [];
  const stateIndex = columnIndex(headers, ['State Territory Abbreviation', 'State']);
  const countyIndex = columnIndex(headers, ['County Name', 'County']);
  const contractIndex = columnIndex(headers, ['Contract ID', 'Contract Number']);
  const planIndex = columnIndex(headers, ['Plan ID']);
  const segmentIndex = columnIndex(headers, ['Segment ID']);
  if ([stateIndex, countyIndex, contractIndex, planIndex].some(index => index < 0)) {
    throw new Error('CMS 2027 Landscape format changed.');
  }
  landscapeCache = rows.map(row => ({
    state: String(row[stateIndex] || '').trim(),
    county: String(row[countyIndex] || '').trim(),
    contract: String(row[contractIndex] || '').trim(),
    plan: String(row[planIndex] || '').trim().padStart(3, '0'),
    segment: segmentIndex >= 0 ? String(row[segmentIndex] || '').trim() : ''
  }));
  landscapeLoadedAt = Date.now();
  return landscapeCache;
}

export async function GET(request) {
  try {
    await requireCrmUser(request);
    const url = new URL(request.url);
    const county = String(url.searchParams.get('county') || '').trim().replace(/\s+county$/i, '');
    if (!county || county.length > 80) return Response.json({ error: 'A Mississippi county is required.' }, { status: 400 });
    const rows = await loadLandscape();
    const matches = rows.filter(row => row.state.toUpperCase() === 'MS' && row.county.replace(/\s+county$/i, '').toLowerCase() === county.toLowerCase());
    const plans = [...new Set(matches.map(row => `${row.contract}-${row.plan}`))].sort();
    return Response.json({ plan_year: 2027, county, plans, count: plans.length, source: 'CMS CY2027 Landscape 202609.1' }, {
      headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=3600' }
    });
  } catch (error) {
    const status = Number(error?.status) || 500;
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to load 2027 MA availability.' }, { status });
  }
}
