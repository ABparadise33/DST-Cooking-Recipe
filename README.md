# DST Cooking Recipe

A static GitHub Pages site for reverse-looking-up Don't Starve Together Crock Pot recipes by ingredient.

## Features

- Search ingredients by English name, Chinese name, or internal id.
- Filter ingredients by obtainment area (mainland, ocean/islands, cave) and common Crock Pot groups such as meat, fish, vegetable, fruit, egg, sweetener, monster, inedible, and filler/other.
- Select up to four ingredient slots, including repeated ingredients, with inline `+`/`-` quantity controls for quick correction.
- Start with Monster Meat selected and show common ingredients first in the default ingredient list.
- Keep Warly-only recipes hidden by default.
- Prioritize recipes that explicitly require the selected ingredient, then recipes whose coefficient requirements are already satisfied, then partial coefficient matches, then filler-only matches.
- Show readable Chinese recipe requirements such as `肉類係數 >= 3` and `不可放 不可食用`.
- Render recipe requirement chips with ingredient/tag icons instead of random example filler combos.
- Show ingredient and recipe icons from the Food Guide image set.
- Show health, hunger, and sanity with local Don't Starve-style status icons.
- Keep English names while adding Traditional Chinese `zhName` fields.
- Filter Warly-only recipes and sort by relevance, name, health, hunger, sanity, or priority, including high-to-low and low-to-high stat ordering.

## Local Preview

Run a static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

After pushing to GitHub, enable Pages:

1. Go to repository Settings.
2. Open Pages.
3. Set source to `Deploy from a branch`.
4. Choose `main` and `/root`.
5. Save.

The site will be available at:

```text
https://ABparadise33.github.io/DST-Cooking-Recipe/
```

## Data

- `data/lookup.json` is the optimized frontend data file.
- `data/dst_crockpot_ingredient_lookup.csv` is the per-ingredient summary table with Chinese fields.
- `data/dst_crockpot_ingredient_recipe_edges.csv` is the ingredient-to-recipe edge table with Chinese fields.
- `tools/enrich-data.cjs` adds image URLs, Traditional Chinese draft names, direct ingredient requirement metadata, and serialized recipe rules, then rebuilds the CSV files.

Wet Goop is excluded from the visible lookup table to keep the results useful.

Image assets are loaded from:

```text
https://bluehexagons.github.io/foodguide/img/
```

Status icons are stored as local page assets:

```text
assets/status-health.png
assets/status-hunger.png
assets/status-sanity.png
```
