// Palette matches pokewiki.de's type badges (read via getComputedStyle on
// https://www.pokewiki.de/Typen), not the classic muted Bulbapedia colors.
export const TYPE_COLORS: Record<string, string> = {
  NORMAL: "#BBBBAA",
  FIGHTING: "#BB5544",
  FLYING: "#96CAFF",
  POISON: "#9553CD",
  GROUND: "#A67439",
  ROCK: "#BBAA66",
  BUG: "#92C12A",
  GHOST: "#6E4370",
  STEEL: "#AAAABB",
  FIRE: "#FF421C",
  WATER: "#2C9BE3",
  GRASS: "#62BC5A",
  ELECTRIC: "#FFDC00",
  PSYCHIC: "#FF6380",
  ICE: "#74CFC0",
  DRAGON: "#5670BE",
  DARK: "#4E4545",
  FAIRY: "#EC8FE6",
  QMARKS: "#68A090",
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#68A090";
}
