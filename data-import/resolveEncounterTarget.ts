// Shared by buildData.ts (wild encounters.txt) and parsePokemonMapLocations.ts (event dump
// gift/trade/egg Pokémon): both source formats use the same "SPECIES" or "SPECIES_N" suffix
// convention to optionally pin down a specific form.
import type { Pokemon } from "./dataModel.ts";

/** Species entries sometimes carry a form suffix (e.g. "ZIGZAGOON_1") - this resolves to the
 *  exact form rather than collapsing everything onto the base species, since a form can be
 *  rarer/only obtainable in specific circumstances. Falls back to the base species if the
 *  suffix doesn't match a real form (or there's no suffix). */
export function resolveEncounterTarget(
  rawId: string,
  pokemonById: Map<string, Pokemon>
): { speciesId: string; formNumber: number | null } | null {
  if (pokemonById.has(rawId)) return { speciesId: rawId, formNumber: null };
  const match = rawId.match(/^(.+)_(\d+)$/);
  if (!match) return null;
  const [, base, formNumberRaw] = match;
  const species = pokemonById.get(base);
  if (!species) return null;
  const formNumber = Number(formNumberRaw);
  const formExists = species.forms.some((f) => f.formNumber === formNumber);
  return { speciesId: base, formNumber: formExists ? formNumber : null };
}
