// Natural sort: splits into digit/non-digit runs and compares digit runs numerically, so
// "TM2" < "TM10" < "TM102" (plain localeCompare would put "TM10" before "TM102" before "TM2",
// since TM names aren't consistently zero-padded once there are 100+ of them). Shared by every
// xlsx export that lists items/moves/etc. by name within a group.
export function naturalCompare(a: string, b: string): number {
  const ax = a.match(/\d+|\D+/g) ?? [];
  const bx = b.match(/\d+|\D+/g) ?? [];
  const len = Math.max(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const av = ax[i] ?? "";
    const bv = bx[i] ?? "";
    if (av === bv) continue;
    if (/^\d+$/.test(av) && /^\d+$/.test(bv)) return Number(av) - Number(bv);
    return av.localeCompare(bv, "de");
  }
  return 0;
}
