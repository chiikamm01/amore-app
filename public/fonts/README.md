# Fonts

Place the **Lasenby Sans** web font files here so "FIND YOUR PERSONAL TONE" uses the correct typeface:

- `LasenbySans-Regular.woff2` (preferred)
- or `LasenbySans-Regular.woff`

**How to get the font:**

1. **From Figma:** If the design uses Lasenby Sans, you may be able to export it via a plugin (e.g. "Export Font" or your team’s design system).
2. **From your designer/brand:** Ask for the web font files (`.woff2` or `.woff`) for "Lasenby Sans Regular".
3. **If you only have .ttf/.otf:** Convert to woff2 at [transfonter.org](https://transfonter.org) or similar, then add the `.woff2` file here and ensure the path in `src/index.css` matches the filename.

If no file is present, the app will fall back to Helvetica/sans-serif.
