# DST Crock Pot Lookup

A static GitHub Pages site for reverse-looking-up Don't Starve Together Crock Pot recipes by ingredient.

## Features

- Search ingredients by English name, Chinese name, or internal id.
- Select up to four ingredients and view the shared recipe intersection.
- Show ingredient and recipe icons from the Food Guide image set.
- Keep English names while adding Traditional Chinese `zhName` fields.
- Filter Warly-only recipes and sort by name, priority, or hunger.

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
https://ABparadise33.github.io/DST-Cookie-Recipe/
```

## Data

- `data/lookup.json` is the optimized frontend data file.
- `data/dst_crockpot_ingredient_lookup.csv` is the per-ingredient summary table with Chinese fields.
- `data/dst_crockpot_ingredient_recipe_edges.csv` is the ingredient-to-recipe edge table with Chinese fields.
- `tools/enrich-data.cjs` adds image URLs and Traditional Chinese draft names, then rebuilds the CSV files.

Wet Goop is excluded from the visible lookup table to keep the results useful.

Image assets are loaded from:

```text
https://bluehexagons.github.io/foodguide/img/
```
