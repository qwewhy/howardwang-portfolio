# Howard Wang Portfolio

Personal portfolio built with React, TypeScript, and Vite.

## Development

```bash
npm ci
npm run dev
```

## Production Build

```bash
npm run build
```

The build outputs prerendered static pages into `dist/`, including route-specific HTML files, `404.html`, and `.nojekyll`.

## Temporary GitHub Pages Deployment

This repository currently uses GitHub Pages as a temporary deployment target.

- Pages URL: [https://qwewhy.github.io/howardwang-portfolio/](https://qwewhy.github.io/howardwang-portfolio/)
- Deployment branch trigger: `dev`
- CI/CD workflow: [.github/workflows/deploy-github-pages.yml](.github/workflows/deploy-github-pages.yml)

Every push to `dev` will:

1. install dependencies with `npm ci`
2. build the static site with `npm run build`
3. upload `dist/` as the Pages artifact
4. deploy the site through GitHub Actions

This is only a temporary hosting setup. The site may later move to AWS, Cloudflare, or Vercel.
