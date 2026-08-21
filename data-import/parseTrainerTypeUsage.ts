// Works out which trainer CLASSES (PBS/trainer_types.txt) are actually used in the game, and
// whether the unused ones already have the artwork needed to put them on a map.
//
// "Used" has two levels: a class can have trainer data in trainers.txt, and it can additionally
// be placed on a real map by an event. A class with data but no placement is the cheapest one to
// put into the game, so the two are reported separately.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parsePbsBlocks, blockToRecord } from "./parsePbs.ts";

const SOURCE_DIR = join(import.meta.dirname, "source", "PBS");
const CHARACTER_MANIFEST = join(import.meta.dirname, "source", "Graphics", "characters.txt");
const BATTLE_SPRITE_DIR = join(import.meta.dirname, "..", "public", "trainers");

export type UsageLevel = "placed" | "data-only" | "unused";

export interface TrainerTypeUsage {
  id: string;
  name: string;
  gender: string | null;
  usage: UsageLevel;
  hasBattleSprite: boolean;
  hasCharacterSprite: boolean;
}

function spriteKeys(dir: string): Set<string> {
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir)
      .filter((n) => /\.png$/i.test(n))
      .map((n) => n.replace(/\.png$/i, "").toLowerCase())
  );
}

function characterKeys(): string[] {
  if (!existsSync(CHARACTER_MANIFEST)) return [];
  return readFileSync(CHARACTER_MANIFEST, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((n) => n.toLowerCase());
}

/** The project uses two naming conventions for overworld sprites - "<CLASS>.png" and
 *  "trainer_<CLASS>.png" - plus numbered variants ("BUGCATCHER_2.png"). Verified against the
 *  "Graphic:" lines of trainer events in the map dump, which name the sprite actually used. */
function makeCharacterLookup(names: string[]) {
  return (typeId: string) => {
    const keys = [typeId.toLowerCase(), `trainer_${typeId.toLowerCase()}`];
    return names.some((n) => keys.some((k) => n === k || n.startsWith(`${k}_`)));
  };
}

export function parseTrainerTypeUsage(
  typesWithData: Set<string>,
  placedTypes: Set<string>
): TrainerTypeUsage[] {
  const battle = spriteKeys(BATTLE_SPRITE_DIR);
  const hasCharacter = makeCharacterLookup(characterKeys());

  const raw = readFileSync(join(SOURCE_DIR, "trainer_types.txt"), "utf-8");
  return parsePbsBlocks(raw).map((block) => {
    const id = block.headerParts[0];
    const fields = blockToRecord(block);
    const usage: UsageLevel = placedTypes.has(id) ? "placed" : typesWithData.has(id) ? "data-only" : "unused";
    return {
      id,
      name: fields["Name"] ?? id,
      gender: fields["Gender"] ?? null,
      usage,
      hasBattleSprite: battle.has(id.toLowerCase()),
      hasCharacterSprite: hasCharacter(id),
    };
  });
}
