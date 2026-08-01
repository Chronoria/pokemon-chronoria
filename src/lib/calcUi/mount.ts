// Wires up the damage calculator page.
//
// Lifecycle note: this is mounted from a bundled <script>, not one of the site's usual
// `<script data-astro-rerun>` blocks. Those re-run plain JS on every ClientRouter navigation, but
// they can't import modules - and a bundled ES module can't be re-executed by re-inserting its
// tag either (the browser caches it). So the page listens for `astro:page-load` instead and
// calls mountCalculator again; everything registered here uses one AbortController so the old
// mount detaches cleanly and no listeners accumulate across navigations.
import {
  abilityName,
  calculate,
  defaultField,
  defaultSide,
  effectivenessLabel,
  EV_MAX_PER_STAT,
  EV_MAX_TOTAL,
  itemName,
  IV_MAX,
  LEVEL_MAX,
  moveList,
  speciesLabel,
  speciesList,
  statsFor,
  type CalcMove,
  type CalcSpecies,
  type FieldState,
  type SideState,
  type StatKey,
} from "../calc/index.ts";
import { STAT_KEYS } from "../calc/types.ts";
import { escapeHtml, typeBadgeHtml } from "./badge.ts";
import { createCombobox, type ComboboxHandle } from "./combobox.ts";
import { href } from "../url.ts";

const STAT_LABELS: Record<StatKey, string> = {
  hp: "KP",
  attack: "Angriff",
  defense: "Verteidigung",
  spAtk: "Sp. Angriff",
  spDef: "Sp. Verteidigung",
  speed: "Initiative",
};

// Status/weather/terrain option lists live in the .astro template - they're static, so rendering
// them at build time keeps them in the HTML for users before the script has run.

interface SideUi {
  state: SideState;
  moves: (CalcMove | null)[];
  speciesCombo: ComboboxHandle<CalcSpecies>;
  moveCombos: ComboboxHandle<CalcMove>[];
}

/** Move id -> index, so the "is this learnable" check in the picker is a map lookup rather than
 *  an indexOf scan per rendered row (learnsets store move indices, not ids). */
const MOVE_INDEX = new Map(moveList.map((m, i) => [m.i, i]));

function isLearnable(species: CalcSpecies, move: CalcMove): boolean {
  const idx = MOVE_INDEX.get(move.i);
  return idx !== undefined && species.l.includes(idx);
}

function spriteUrl(species: CalcSpecies): string | null {
  return species.s ? href(`/sprites/${species.s}`) : null;
}

function el<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Element fehlt: ${selector}`);
  return found;
}

export function mountCalculator(root: HTMLElement): () => void {
  const controller = new AbortController();
  const signal = controller.signal;
  root.dataset.calcMounted = "true";

  const field: FieldState = defaultField();
  // Two arbitrary but sensible starting points so the page shows a real result immediately
  // instead of an empty shell.
  const buildSide = (species: CalcSpecies): SideUi => ({
    state: defaultSide(species.k),
    moves: [null, null, null, null],
    // Filled in immediately below, once the DOM nodes for this side are located.
    speciesCombo: null!,
    moveCombos: [],
  });
  const sides: Record<"attacker" | "defender", SideUi> = {
    attacker: buildSide(speciesList[0]),
    defender: buildSide(speciesList[Math.min(3, speciesList.length - 1)]),
  };

  // --- Side panels ----------------------------------------------------------------------------
  for (const which of ["attacker", "defender"] as const) {
    const panel = el<HTMLElement>(root, `[data-side="${which}"]`);
    const side = sides[which];

    // Species picker
    const speciesInput = el<HTMLInputElement>(panel, ".js-species-input");
    const speciesListEl = el<HTMLElement>(panel, ".js-species-list");
    side.speciesCombo = createCombobox<CalcSpecies>({
      input: speciesInput,
      list: speciesListEl,
      items: speciesList,
      searchText: (s) => speciesLabel(s),
      label: (s) => speciesLabel(s),
      renderRow: (s) => {
        const sprite = spriteUrl(s);
        return (
          `<span class="calc-combo-icon">${sprite ? `<img src="${sprite}" alt="" loading="lazy" width="32" height="32">` : ""}</span>` +
          `<span class="calc-combo-name">${escapeHtml(speciesLabel(s))}</span>` +
          `<span class="calc-combo-types">${s.t.map(typeBadgeHtml).join("")}</span>`
        );
      },
      onSelect: (s) => {
        side.state.species = s;
        // The previous ability usually doesn't exist on the new species - fall back to its first.
        side.state.ability = s.a[0] ?? null;
        renderSide(which);
        // Learnable-move prioritization depends on the species, so the move lists must re-sort.
        for (const combo of side.moveCombos) combo.refresh();
        recalculate();
      },
      signal,
    });
    side.speciesCombo.setValue(side.state.species);

    // Move pickers
    const moveSlots = [...panel.querySelectorAll<HTMLElement>(".js-move-slot")];
    moveSlots.forEach((slot, i) => {
      const input = el<HTMLInputElement>(slot, ".js-move-input");
      const listEl = el<HTMLElement>(slot, ".js-move-list");
      const combo = createCombobox<CalcMove>({
        input,
        list: listEl,
        items: moveList,
        searchText: (m) => m.n,
        label: (m) => m.n,
        renderRow: (m) => {
          const learnable = isLearnable(side.state.species, m);
          return (
            `<span class="calc-combo-types">${typeBadgeHtml(m.t)}</span>` +
            `<span class="calc-combo-name">${escapeHtml(m.n)}${learnable ? ' <span class="calc-learnable" title="Erlernbar">•</span>' : ""}</span>` +
            `<span class="calc-combo-meta">${m.p ?? "—"} / ${m.a ?? "—"}</span>`
          );
        },
        // Moves the chosen species can actually learn sort to the top, but everything stays
        // selectable (the user asked for the full list, just ordered helpfully).
        prioritize: (m) => isLearnable(side.state.species, m),
        onSelect: (m) => {
          side.moves[i] = m;
          recalculate();
        },
        signal,
        placeholderEmpty: "Keine Attacke gefunden",
      });
      side.moveCombos.push(combo);
    });

    // Simple selects and number inputs
    const bind = (selector: string, handler: (value: string) => void) => {
      const node = panel.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
      if (!node) return;
      node.addEventListener(
        "change",
        () => {
          handler(node.value);
          recalculate();
        },
        { signal }
      );
      node.addEventListener("input", () => { handler(node.value); recalculate(); }, { signal });
    };

    bind(".js-level", (v) => {
      side.state.level = Math.max(1, Math.min(LEVEL_MAX, Number(v) || 1));
    });
    bind(".js-nature", (v) => {
      side.state.nature = v;
    });
    bind(".js-ability", (v) => {
      side.state.ability = v || null;
    });
    bind(".js-item", (v) => {
      side.state.item = v || null;
    });
    bind(".js-status", (v) => {
      side.state.status = v as SideState["status"];
    });
    bind(".js-hp", (v) => {
      side.state.hpFraction = Math.max(0, Math.min(100, Number(v) || 0)) / 100;
    });

    for (const key of STAT_KEYS) {
      bind(`.js-iv-${key}`, (v) => {
        side.state.ivs[key] = Math.max(0, Math.min(IV_MAX, Number(v) || 0));
      });
      bind(`.js-ev-${key}`, (v) => {
        side.state.evs[key] = Math.max(0, Math.min(EV_MAX_PER_STAT, Number(v) || 0));
      });
      if (key !== "hp") {
        bind(`.js-stage-${key}`, (v) => {
          side.state.stages[key] = Math.max(-6, Math.min(6, Number(v) || 0));
        });
      }
    }
  }

  // --- Field controls -------------------------------------------------------------------------
  const fieldPanel = el<HTMLElement>(root, ".js-field");
  const bindField = (selector: string, handler: (node: HTMLInputElement | HTMLSelectElement) => void) => {
    const node = fieldPanel.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!node) return;
    node.addEventListener(
      "change",
      () => {
        handler(node);
        recalculate();
      },
      { signal }
    );
  };
  bindField(".js-weather", (n) => (field.weather = n.value as FieldState["weather"]));
  bindField(".js-terrain", (n) => (field.terrain = n.value as FieldState["terrain"]));
  bindField(".js-doubles", (n) => (field.doubles = (n as HTMLInputElement).checked));
  bindField(".js-reflect", (n) => (field.reflect = (n as HTMLInputElement).checked));
  bindField(".js-lightscreen", (n) => (field.lightScreen = (n as HTMLInputElement).checked));
  bindField(".js-auroraveil", (n) => (field.auroraVeil = (n as HTMLInputElement).checked));

  const critToggle = root.querySelector<HTMLInputElement>(".js-crit");
  critToggle?.addEventListener("change", recalculate, { signal });

  // --- Rendering ------------------------------------------------------------------------------
  function renderSide(which: "attacker" | "defender") {
    const panel = el<HTMLElement>(root, `[data-side="${which}"]`);
    const side = sides[which];
    const species = side.state.species;

    const spriteBox = el<HTMLElement>(panel, ".js-sprite");
    const sprite = spriteUrl(species);
    spriteBox.innerHTML = sprite
      ? `<img src="${sprite}" alt="${escapeHtml(species.n)}" width="96" height="96">`
      : `<div class="calc-sprite-missing" aria-hidden="true">?</div>`;

    el<HTMLElement>(panel, ".js-types").innerHTML = species.t.map(typeBadgeHtml).join("");

    // Ability list is species-specific: regular abilities plus the hidden one, marked.
    const abilitySelect = el<HTMLSelectElement>(panel, ".js-ability");
    const abilityIds = [...species.a, ...species.h];
    abilitySelect.innerHTML =
      `<option value="">Keine</option>` +
      abilityIds
        .map((id, i) => {
          const suffix = i >= species.a.length ? " (versteckt)" : "";
          const sel = side.state.ability === id ? " selected" : "";
          return `<option value="${id}"${sel}>${escapeHtml(abilityName(id))}${suffix}</option>`;
        })
        .join("");

    // Computed stats
    const stats = statsFor(side.state);
    const statBox = el<HTMLElement>(panel, ".js-stats");
    statBox.innerHTML = STAT_KEYS.map(
      (key) => `<div class="calc-stat"><span>${STAT_LABELS[key]}</span><strong>${stats[key]}</strong></div>`
    ).join("");

    // EV budget warning - Essentials enforces 510 total, so silently exceeding it would mislead.
    const evTotal = STAT_KEYS.reduce((sum, key) => sum + side.state.evs[key], 0);
    const evNote = el<HTMLElement>(panel, ".js-ev-total");
    evNote.textContent = `EP gesamt: ${evTotal} / ${EV_MAX_TOTAL}`;
    evNote.classList.toggle("calc-warn", evTotal > EV_MAX_TOTAL);
  }

  function recalculate() {
    const attacker = sides.attacker;
    const defender = sides.defender;
    renderSide("attacker");
    renderSide("defender");

    const isCrit = critToggle?.checked ?? false;
    const results = el<HTMLElement>(root, ".js-results");
    const rows: string[] = [];

    for (let i = 0; i < 4; i++) {
      const move = attacker.moves[i];
      if (!move) continue;
      const out = calculate(attacker.state, defender.state, move, field, isCrit);
      const pct = out.percent;
      const unmodelledNames = out.unmodelled.map((entry) => {
        const [kind, id] = entry.split(":");
        return kind === "ability" ? abilityName(id) : itemName(id);
      });
      // Effects that WERE applied, but only under an assumption - shown separately from the
      // "not modelled" list, since the number does account for them.
      const assumptionNotes = out.assumptions.map((entry) => {
        const idx = entry.indexOf(":");
        return `${abilityName(entry.slice(0, idx))}: ${entry.slice(idx + 1)}`;
      });

      rows.push(
        `<div class="calc-result" data-move="${escapeHtml(move.i)}">` +
          `<div class="calc-result-head">` +
          typeBadgeHtml(move.t) +
          `<span class="calc-result-name">${escapeHtml(move.n)}</span>` +
          `<span class="calc-result-eff">${escapeHtml(out.note ?? effectivenessLabel(out.typeMod))}</span>` +
          `</div>` +
          (out.max === 0
            ? `<div class="calc-result-empty">Kein Schaden</div>`
            : `<div class="calc-result-main">` +
              `<span class="calc-result-range">${out.min} – ${out.max}</span>` +
              `<span class="calc-result-pct">${pct[0].toFixed(1)} – ${pct[1].toFixed(1)} % der KP${out.hits ? " je Treffer" : ""}</span>` +
              `</div>` +
              // For multi-hit moves the per-hit figure alone badly understates the move, so the
              // full-connect total is shown alongside it.
              (out.hits
                ? `<div class="calc-result-total">Bei ${out.hits.min === out.hits.max ? out.hits.min : `${out.hits.min}–${out.hits.max}`} Treffern: ` +
                  `<strong>${out.min * out.hits.min} – ${out.max * out.hits.max}</strong> ` +
                  `(${((out.min * out.hits.min) / out.targetMaxHP * 100).toFixed(1)} – ${((out.max * out.hits.max) / out.targetMaxHP * 100).toFixed(1)} %)</div>`
                : "") +
              `<div class="calc-result-bar"><span style="width:${Math.min(100, pct[1])}%"></span></div>` +
              `<details class="calc-result-rolls"><summary>Mögliche Schadenswerte</summary>` +
              `<div class="calc-rolls">${out.rolls.map((r) => `<span>${r}</span>`).join("")}</div>` +
              `</details>`) +
          (unmodelledNames.length
            ? `<p class="calc-warn calc-result-note">Noch nicht berücksichtigt: ${escapeHtml(unmodelledNames.join(", "))}</p>`
            : "") +
          (assumptionNotes.length
            ? `<p class="calc-note calc-result-note">${escapeHtml(assumptionNotes.join(" · "))}</p>`
            : "") +
          `</div>`
      );
    }

    results.innerHTML = rows.length
      ? rows.join("")
      : `<p class="meta-note">Wähle links mindestens eine Attacke, um den Schaden zu berechnen.</p>`;

    const hpNote = el<HTMLElement>(root, ".js-defender-hp");
    hpNote.textContent = `${defender.state.species.n}: ${statsFor(defender.state).hp} KP`;
  }

  recalculate();

  return () => {
    controller.abort();
    delete root.dataset.calcMounted;
  };
}
