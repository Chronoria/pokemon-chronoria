// Searchable picker (combobox) used for Pokémon, moves and items.
//
// A plain <select> is unusable at these sizes (1561 Pokémon entries, 850 moves), and the site has
// no combobox pattern yet - the existing "search" inputs on the list pages just show/hide
// pre-rendered cards, which doesn't work when the options aren't in the DOM to begin with.
//
// Deliberately simple: the option list is capped at MAX_ROWS rendered rows, not the data. A
// substring scan over ~1600 short strings is well under a millisecond, so there's no need for
// virtualization, debouncing or an index - which is what keeps this small enough to trust.
//
// Keyboard behaviour follows the ARIA combobox-with-listbox pattern: focus never leaves the
// input, and the active option is tracked with aria-activedescendant.
const MAX_ROWS = 50;

/** Folds German umlauts so "Glurak" is findable by typing "gl" and "Käfer" by "kaefer"/"kafer". */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/é/g, "e");
}

export interface ComboboxOptions<T> {
  input: HTMLInputElement;
  list: HTMLElement;
  items: T[];
  /** Text the query is matched against. Precomputed once per item at construction. */
  searchText: (item: T) => string;
  /** Innermost HTML of one option row. */
  renderRow: (item: T) => string;
  /** Text shown in the input once an item is committed. */
  label: (item: T) => string;
  onSelect: (item: T) => void;
  signal: AbortSignal;
  /** Optional: items sorted first (e.g. moves the chosen species can actually learn). */
  prioritize?: (item: T) => boolean;
  placeholderEmpty?: string;
}

export interface ComboboxHandle<T> {
  /** Sets the committed value without firing onSelect. */
  setValue(item: T | null): void;
  /** Recomputes prioritization (e.g. after the species changed). */
  refresh(): void;
}

export function createCombobox<T>(options: ComboboxOptions<T>): ComboboxHandle<T> {
  const { input, list, items, searchText, renderRow, label, onSelect, signal } = options;
  const listId = list.id;

  const haystack = items.map((item) => normalize(searchText(item)));
  let filtered: number[] = [];
  let activeRow = -1;
  let committed: T | null = null;

  const open = () => {
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeRow = -1;
  };

  const restoreLabel = () => {
    input.value = committed ? label(committed) : "";
  };

  function score(index: number, query: string): number {
    const text = haystack[index];
    if (!query) return options.prioritize?.(items[index]) ? 0 : 1;
    let base: number;
    if (text === query) base = 0;
    else if (text.startsWith(query)) base = 1;
    else if (text.includes(query)) base = 2;
    else return -1;
    // Prioritized entries (learnable moves) sort ahead of equally-good matches.
    return options.prioritize?.(items[index]) ? base : base + 0.5;
  }

  function render(query: string) {
    const scored: [number, number][] = [];
    for (let i = 0; i < items.length; i++) {
      const s = score(i, query);
      if (s >= 0) scored.push([i, s]);
    }
    // Stable: equal scores keep source order (dex order for Pokémon, PBS order for moves).
    scored.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    filtered = scored.slice(0, MAX_ROWS).map(([i]) => i);

    if (filtered.length === 0) {
      list.innerHTML = `<li class="calc-combo-empty" role="presentation">${options.placeholderEmpty ?? "Nichts gefunden"}</li>`;
    } else {
      list.innerHTML = filtered
        .map(
          (idx, row) =>
            `<li id="${listId}-r${row}" class="calc-combo-row" role="option" aria-selected="false" data-idx="${idx}">${renderRow(items[idx])}</li>`
        )
        .join("");
    }
    activeRow = filtered.length ? 0 : -1;
    highlight();
  }

  function highlight() {
    const rows = [...list.querySelectorAll<HTMLElement>(".calc-combo-row")];
    rows.forEach((row, i) => {
      const active = i === activeRow;
      row.classList.toggle("is-active", active);
      row.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (activeRow >= 0 && rows[activeRow]) {
      input.setAttribute("aria-activedescendant", rows[activeRow].id);
      rows[activeRow].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function commit(index: number) {
    const item = items[index];
    if (!item) return;
    committed = item;
    input.value = label(item);
    close();
    onSelect(item);
  }

  input.addEventListener(
    "input",
    () => {
      render(normalize(input.value));
      open();
    },
    { signal }
  );

  input.addEventListener(
    "focus",
    () => {
      // Show the full list on focus rather than requiring a keystroke first.
      input.select();
      render("");
      open();
    },
    { signal }
  );

  input.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (list.hidden) {
          render(normalize(input.value));
          open();
          return;
        }
        if (!filtered.length) return;
        activeRow = (activeRow + (e.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length;
        highlight();
      } else if (e.key === "Home" && !list.hidden) {
        e.preventDefault();
        activeRow = 0;
        highlight();
      } else if (e.key === "End" && !list.hidden) {
        e.preventDefault();
        activeRow = filtered.length - 1;
        highlight();
      } else if (e.key === "Enter") {
        if (!list.hidden && activeRow >= 0) {
          e.preventDefault();
          commit(filtered[activeRow]);
        }
      } else if (e.key === "Escape") {
        if (!list.hidden) {
          e.preventDefault();
          close();
          restoreLabel();
        }
      } else if (e.key === "Tab") {
        // Commit what's highlighted rather than silently discarding it.
        if (!list.hidden && activeRow >= 0) commit(filtered[activeRow]);
        else close();
      }
    },
    { signal }
  );

  // mousedown (not click) with preventDefault, so the input's blur doesn't close the list first.
  list.addEventListener(
    "mousedown",
    (e) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>(".calc-combo-row");
      if (!row) return;
      e.preventDefault();
      commit(Number(row.dataset.idx));
    },
    { signal }
  );

  input.addEventListener(
    "blur",
    () => {
      // Never leave the field showing text that isn't an actual selection.
      close();
      restoreLabel();
    },
    { signal }
  );

  document.addEventListener(
    "click",
    (e) => {
      if (list.hidden) return;
      const target = e.target as Node;
      if (!list.contains(target) && target !== input) {
        close();
        restoreLabel();
      }
    },
    { signal }
  );

  return {
    setValue(item) {
      committed = item;
      restoreLabel();
    },
    refresh() {
      if (!list.hidden) render(normalize(input.value));
    },
  };
}
