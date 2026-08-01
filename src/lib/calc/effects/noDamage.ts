// Abilities that provably do not change a damage roll.
//
// Why this exists: the results panel warns when a selected ability isn't modelled, so the user
// knows a number might be incomplete. Without this list that warning fires for Cute Charm,
// Chlorophyll, Keen Eye and dozens of others that cannot affect damage under any circumstance -
// and a warning that is usually noise trains people to ignore the ones that matter.
//
// Membership rule: the ability's entire effect is speed, accuracy/evasion, status infliction or
// prevention, switching, item/berry behaviour, breeding, or an out-of-battle convenience. Anything
// that touches a damage multiplier, an immunity, a hit count, or a stat used in the formula must
// NOT be listed here - it belongs in abilities.ts as a real handler instead.
//
// Intimidate is included deliberately: it lowers Attack by a stat STAGE, and stat stages are a
// direct input in this calculator, so the user sets it there rather than having it applied twice.
export const NO_DAMAGE_EFFECT = new Set([
  // Speed only
  "CHLOROPHYLL", "SWIFTSWIM", "SANDRUSH", "SLUSHRUSH", "QUICKFEET", "STEADFAST", "SPEEDBOOST",
  "SURGESURFER", "UNBURDEN",
  // Accuracy / evasion only
  "KEENEYE", "COMPOUNDEYES", "ILLUMINATE", "SANDVEIL", "SNOWCLOAK", "TANGLEDFEET", "VICTORYSTAR",
  "NOGUARD", "WONDERSKIN",
  // Status infliction or prevention
  "STATIC", "FLAMEBODY", "POISONPOINT", "EFFECTSPORE", "CUTECHARM", "SYNCHRONIZE", "IMMUNITY",
  "INSOMNIA", "VITALSPIRIT", "LIMBER", "MAGMAARMOR", "WATERVEIL", "OBLIVIOUS", "OWNTEMPO",
  "INNERFOCUS", "SHIELDDUST", "SWEETVEIL", "AROMAVEIL", "FLOWERVEIL", "PASTELVEIL", "LEAFGUARD",
  "NATURALCURE", "SHEDSKIN", "HEALER", "COMATOSE", "THERMALEXCHANGE",
  // Switching, trapping, fleeing
  "RUNAWAY", "SUCTIONCUPS", "SHADOWTAG", "ARENATRAP", "MAGNETPULL", "REGENERATOR", "EMERGENCYEXIT",
  "WIMPOUT",
  // Item and berry behaviour
  "PICKUP", "PICKPOCKET", "FRISK", "GLUTTONY", "UNNERVE", "KLUTZ", "STICKYHOLD", "MAGICIAN",
  "HONEYGATHER", "CHEEKPOUCH", "BALLFETCH", "SUPERSWEETSYRUP",
  // Information, copying, misc battle utility with no damage term
  "TRACE", "FOREWARN", "ANTICIPATION", "PRESSURE", "TELEPATHY", "DOWNLOAD", "IMPOSTER",
  "SERENEGRACE", "SIMPLE", "CONTRARY", "DEFIANT", "COMPETITIVE", "MOODY", "TRUANT", "STALL",
  "HYPERCUTTER", "WHITESMOKE", "CLEARBODY", "FULLMETALBODY", "BIGPECKS", "MIRRORARMOR",
  "STENCH", "RATTLED", "DAUNTLESSSHIELD", "INTREPIDSWORD", "CURIOUSMEDICINE",
  "MYCELIUMMIGHT", "OPPORTUNIST", "COSTAR",
  // Lowers the opponent's Attack by a stat STAGE, which is a direct calculator input.
  "INTIMIDATE",
  // Field/weather setters: their weather or terrain is itself a calculator input.
  "DROUGHT", "DRIZZLE", "SANDSTREAM", "SNOWWARNING", "PRIMORDIALSEA", "DESOLATELAND",
  "DELTASTREAM", "ELECTRICSURGE", "GRASSYSURGE", "MISTYSURGE", "PSYCHICSURGE",
  // End-of-turn healing/chip only. Note Dry Skin, Solar Power and Overcoat are NOT here: they
  // each also carry a real damage effect and are registered as handlers instead.
  "RAINDISH", "ICEBODY", "POISONHEAL", "MAGICGUARD", "ROCKHEAD", "HYDRATION",
]);
