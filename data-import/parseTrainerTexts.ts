// Extracts the dialogue around every trainer battle from the map-event text dump
// (source/MapEvents/EventTextDump.txt): the intro before the fight, the speech right after
// winning, and what the trainer says when you talk to them again later.
//
// The defeat speech is NOT here - that is `LoseText` in PBS/trainers.txt and is already parsed
// into Trainer.loseText by parseTrainers.ts. The exporter joins the two on the trainer id.
//
// Same flat, sequential dump and the same trainer ids as parseMapLocations.ts, but this parser
// needs full event/page structure (not just a sticky "Map ID:" header), because the
// talk-to-again text lives on a *later page* of the same event.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadMapLocationNames } from "./mapMetadata.ts";
import { EXCLUDED_MAP_IDS } from "./parseMapLocations.ts";

const DUMP_PATH = join(import.meta.dirname, "source", "MapEvents", "EventTextDump.txt");

const MAP_ID_RE = /^Map ID: (\d+)/;
const EVENT_ID_RE = /^Event ID: (\d+)/;
const EVENT_NAME_RE = /^Event Name: (.*)/;
const PAGE_RE = /^Page #(\d+)\s*$/;
const COMMANDS_START = "List of Event Commands:";

// A wrapped command continues on lines shaped "  :    : rest" (Show Text) or "  :       : rest"
// (Script) - always TWO colons. Structural lines (": Else", ": Branch End", ": When [Ja]") carry
// only one, so they can never be mistaken for a continuation.
const CONTINUATION_RE = /^\s*:\s+:\s(.*)$/;

// Matched against the *joined* line: 29 of the 286 calls in this dump are wrapped across lines,
// including the Arena-6 gym leader, and would be missed otherwise.
const TRAINER_BATTLE_RE = /TrainerBattle\.start\s*\(\s*:([A-Za-z0-9_]+)\s*,\s*"([^"]*)"\s*(?:,\s*(\d+))?\s*\)/g;

const TEXT_CMD_RE = /^\s*@>Text:\s?(.*)$/;

export interface TrainerTextOccurrence {
  /** [type, name, version].filter(Boolean).join("-") - identical to parseTrainers.ts's id. */
  trainerId: string;
  trainerType: string;
  name: string;
  version: string | null;
  mapId: string;
  locationName: string;
  eventId: string;
  eventName: string;
  /** Speaker from the \xn[...] tag, e.g. "Teenager Leandro" - already correct German. */
  speaker: string | null;
  introText: string;
  victoryText: string;
  afterText: string;
}

interface Page {
  number: number;
  commands: string[];
}

/** Rejoins wrapped commands. The stored RMXP line already ends with its own trailing space, so
 *  the parts concatenate with no separator. */
function joinContinuations(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const cont = CONTINUATION_RE.exec(line);
    if (cont && out.length > 0) {
      out[out.length - 1] += cont[1];
      continue;
    }
    out.push(line);
  }
  return out;
}

/** Strips Essentials message control codes. The speaker tag is pulled out separately by
 *  speakerOf(). Splitting on the authored line-break token first means the breaks survive the
 *  stripping without needing a placeholder character. */
function cleanText(raw: string): string {
  return raw
    .split(/\\n/)
    .map((part) =>
      part
        .replace(/\\[a-zA-Z]+\[[^\]]*\]/g, "") // \c[8], \l[3], \me[Badge get], \wtnp[110], \xn[...]
        .replace(/\\[a-zA-Z]+/g, "") // \b, \r, \PN
        .replace(/<ac>/g, "")
        .replace(/[ \t]+/g, " ")
        .trim()
    )
    .join("\n")
    .trim();
}

function speakerOf(raw: string): string | null {
  const match = /\\xn\[([^\]]*)\]/.exec(raw);
  return match ? match[1].trim() : null;
}

/** Consecutive Show Text commands are separate message boxes - keep them apart with a blank line. */
function joinMessages(parts: string[]): string {
  return parts
    .map(cleanText)
    .filter((p) => p.length > 0)
    .join("\n\n");
}

function collectTexts(commands: string[]): string[] {
  const out: string[] = [];
  for (const line of commands) {
    const match = TEXT_CMD_RE.exec(line);
    if (match) out.push(match[1]);
  }
  return out;
}

function battleCalls(line: string): { type: string; name: string; version: string | null }[] {
  TRAINER_BATTLE_RE.lastIndex = 0;
  const out: { type: string; name: string; version: string | null }[] = [];
  let m: RegExpExecArray | null;
  while ((m = TRAINER_BATTLE_RE.exec(line)) !== null) {
    out.push({ type: m[1], name: m[2], version: m[3] ?? null });
  }
  return out;
}

function processEvent(
  pages: Page[],
  ctx: { mapId: string; locationName: string; eventId: string; eventName: string },
  out: TrainerTextOccurrence[]
) {
  pages.forEach((page, pageIndex) => {
    let firstCallIndex = -1;
    let lastCallIndex = -1;
    const calls: { type: string; name: string; version: string | null }[] = [];
    page.commands.forEach((line, i) => {
      const found = battleCalls(line);
      if (found.length === 0) return;
      if (firstCallIndex < 0) firstCallIndex = i;
      lastCallIndex = i;
      calls.push(...found);
    });
    if (calls.length === 0) return;

    const introRaw = collectTexts(page.commands.slice(0, firstCallIndex));
    const victoryRaw = collectTexts(page.commands.slice(lastCallIndex + 1));

    // "Talk to them again" text: the first LATER page that actually has commands. Deliberately
    // not matched on the page's condition - the guard is a self switch for most trainers, a
    // global switch for every gym trainer and a quest variable in the Dojo. Gym events also
    // carry a trailing empty page (the trainer vanishes once the gym is cleared), which is why
    // empty pages must be skipped rather than just taking pageIndex + 1.
    const laterPage = pages.slice(pageIndex + 1).find((p) => p.commands.length > 0);
    const afterRaw = laterPage ? collectTexts(laterPage.commands) : [];

    const speaker =
      introRaw.map(speakerOf).find(Boolean) ??
      victoryRaw.map(speakerOf).find(Boolean) ??
      afterRaw.map(speakerOf).find(Boolean) ??
      null;

    for (const call of calls) {
      out.push({
        trainerId: [call.type, call.name, call.version].filter(Boolean).join("-"),
        trainerType: call.type,
        name: call.name,
        version: call.version,
        mapId: ctx.mapId,
        locationName: ctx.locationName,
        eventId: ctx.eventId,
        eventName: ctx.eventName,
        speaker,
        introText: joinMessages(introRaw),
        victoryText: joinMessages(victoryRaw),
        afterText: joinMessages(afterRaw),
      });
    }
  });
}

export function parseTrainerTexts(): TrainerTextOccurrence[] {
  const out: TrainerTextOccurrence[] = [];
  // The dump is regenerated by hand from the game project and isn't always present - skip
  // quietly, same as parseMapLocations.ts.
  if (!existsSync(DUMP_PATH)) return out;

  const locationNames = loadMapLocationNames();
  const lines = joinContinuations(readFileSync(DUMP_PATH, "utf8").split(/\r?\n/));

  let mapId = "";
  let locationName = "";
  let mapExcluded = true; // everything before the first "Map ID:" header
  let eventId = "";
  let eventName = "";
  let pages: Page[] = [];
  let current: Page | null = null;
  let inCommands = false;

  const flushEvent = () => {
    if (!mapExcluded && pages.length > 0) {
      processEvent(pages, { mapId, locationName, eventId, eventName }, out);
    }
    pages = [];
    current = null;
    inCommands = false;
  };

  for (const line of lines) {
    // The dump ends with "# COMMON EVENTS" / "# BATTLE EVENTS" sections whose events carry their
    // own "Event ID:" headers but no "Map ID:" - without this they would inherit the last map.
    if (line.startsWith("# COMMON EVENTS") || line.startsWith("# BATTLE EVENTS")) {
      flushEvent();
      mapExcluded = true;
      continue;
    }

    const mapMatch = MAP_ID_RE.exec(line);
    if (mapMatch) {
      flushEvent();
      mapId = mapMatch[1];
      locationName = locationNames.get(mapId) ?? mapId;
      mapExcluded = EXCLUDED_MAP_IDS.has(Number(mapId));
      eventId = "";
      eventName = "";
      continue;
    }

    const eventMatch = EVENT_ID_RE.exec(line);
    if (eventMatch) {
      flushEvent();
      eventId = eventMatch[1];
      eventName = "";
      continue;
    }

    if (mapExcluded) continue;

    const nameMatch = EVENT_NAME_RE.exec(line);
    if (nameMatch && !eventName) {
      eventName = nameMatch[1].trim();
      continue;
    }

    const pageMatch = PAGE_RE.exec(line);
    if (pageMatch) {
      current = { number: Number(pageMatch[1]), commands: [] };
      pages.push(current);
      inCommands = false;
      continue;
    }

    if (line.trim() === COMMANDS_START) {
      inCommands = true;
      continue;
    }

    // A page's command list ends at the blank line after its final bare "@>".
    if (inCommands) {
      if (line.trim() === "") {
        inCommands = false;
        continue;
      }
      if (current) current.commands.push(line);
    }
  }
  flushEvent();

  return out;
}
