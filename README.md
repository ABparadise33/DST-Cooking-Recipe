# DST Crock Pot Lookup

A static GitHub Pages site for reverse-looking-up Don't Starve Together Crock Pot recipes by ingredient.

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
- `data/dst_crockpot_ingredient_lookup.csv` is the per-ingredient summary table.
- `data/dst_crockpot_ingredient_recipe_edges.csv` is the ingredient-to-recipe edge table.

Wet Goop is excluded from the visible lookup table to keep the results useful.
