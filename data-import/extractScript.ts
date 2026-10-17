// Pulls one script section (by name, e.g. "Settings") out of the game's Data/Scripts.rxdata.
// Scripts.rxdata is a Ruby Marshal array of [id, name, zlib-compressed code] entries - only that
// small subset of the Marshal format is read here. Used by syncData.ts so that data living in
// the core scripts (Settings::ROAMING_SPECIES) ends up in the committed source/ snapshot.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

export function extractScript(scriptsFile: string, sectionName: string): string | null {
  const buf = readFileSync(scriptsFile);
  let p = 2; // skip version bytes 4.8
  const symbols: string[] = [];

  const int = (): number => {
    const c = buf.readInt8(p++);
    if (c === 0) return 0;
    if (c > 4) return c - 5;
    if (c < -4) return c + 5;
    let x = 0;
    if (c > 0) {
      for (let i = 0; i < c; i++) x |= buf[p++] << (8 * i);
      return x >>> 0;
    }
    x = -1;
    for (let i = 0; i < -c; i++) {
      x &= ~(0xff << (8 * i));
      x |= buf[p++] << (8 * i);
    }
    return x;
  };
  const bytes = (): Buffer => {
    const n = int();
    const b = buf.subarray(p, p + n);
    p += n;
    return b;
  };
  const read = (): unknown => {
    const t = String.fromCharCode(buf[p++]);
    switch (t) {
      case "0": return null;
      case "T": return true;
      case "F": return false;
      case "i": return int();
      case ":": { const s = bytes().toString("utf8"); symbols.push(s); return s; }
      case ";": return symbols[int()];
      case '"': return bytes();
      case "I": {
        const value = read();
        const n = int();
        for (let i = 0; i < n; i++) { read(); read(); }
        return value;
      }
      case "[": {
        const n = int();
        const list: unknown[] = [];
        for (let i = 0; i < n; i++) list.push(read());
        return list;
      }
      default:
        throw new Error(`Scripts.rxdata: unerwarteter Marshal-Typ "${t}" an Position ${p - 1}`);
    }
  };

  const entries = read() as [number, Buffer, Buffer][];
  for (const [, name, code] of entries) {
    if (name.toString("utf8") !== sectionName) continue;
    return inflateSync(code).toString("utf8");
  }
  return null;
}
