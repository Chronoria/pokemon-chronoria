// Shared by buildData.ts (wild encounters.txt) and parsePokemonMapLocations.ts (event dump
// gift/trade/egg Pokémon): both source formats use the same "SPECIES" or "SPECIES_N" suffix
// convention to optionally pin down a specific form.
import { formLabel } from "./exportPokemonList.ts";
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

/** Display name for a raw encounter species entry, including its form suffix
 *  (e.g. "BASCULIN_1" -> "Basculin (Blaulinige Form)"). Shared by the encounter and fishing
 *  Excel exporters so both label the same species identically. Unresolvable ids fall through
 *  as the raw id - buildData.ts already warns about those under "[Fundorte]". */
export function speciesDisplayName(rawId: string, pokemonById: Map<string, Pokemon>): string {
  const resolved = resolveEncounterTarget(rawId, pokemonById);
  if (!resolved) return rawId;
  const species = pokemonById.get(resolved.speciesId)!;
  const form =
    resolved.formNumber === null
      ? { formNumber: 0, formName: null }
      : species.forms.find((f) => f.formNumber === resolved.formNumber)!;
  return formLabel(species.name, form);
}
