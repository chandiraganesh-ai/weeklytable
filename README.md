# Weekly Table

A one-page marketing site for Weekly Table, a local hot-meal delivery service. Plain
HTML/CSS, no build step, no framework, hosted free on GitHub Pages.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

- `index.html` — the page: hero, how it works, this week's menu, why Weekly Table,
  closing CTA, testimonials, footer.
- `styles.css` — styling, using the color/type/spacing tokens from the Weekly Table
  design system.
- `assets/img/` — logo, favicon and photography.
- `.nojekyll` — tells GitHub Pages to serve the files as-is (no Jekyll processing).

## Enabling GitHub Pages

In the repo settings: **Settings → Pages → Source → Deploy from a branch**, branch
`main`, folder `/ (root)`.

## Pointing the GoDaddy domain here

Once the domain is decided, add a `CNAME` file to the repo root containing it, then at
GoDaddy DNS add either:

- **Apex domain** (e.g. `weeklytable.co.uk`): four `A` records pointing at GitHub Pages'
  IPs (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`), plus
  a `CNAME` record for `www` pointing at `<username>.github.io`.
- **`www` as primary** (e.g. `www.weeklytable.co.uk`): a single `CNAME` record for `www`
  pointing at `<username>.github.io`.

After DNS propagates, enable **Enforce HTTPS** under the repo's Pages settings.
