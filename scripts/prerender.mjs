import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const distDir = path.join(rootDir, 'dist')
const { render, getStaticRenderPaths } = await import(path.join(rootDir, 'dist-ssr/entry-server.js'))

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const siteBasePath = process.env.SITE_BASE_PATH ?? '/'
const normalizedBasePath = siteBasePath.endsWith('/') ? siteBasePath : `${siteBasePath}/`
const defaultLocalePath = `${normalizedBasePath}en/`

function routeToOutputPath(routePath) {
  const normalized = routePath.replace(/^\//, '')

  if (!normalized) {
    return path.join(distDir, 'index.html')
  }

  return path.join(distDir, normalized, 'index.html')
}

function injectHtml(routePath, { appHtml, head, lang }) {
  return template
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace('<html lang="en" data-theme="dark">', `<html lang="${lang}" data-theme="dark">`)
    .replace('<meta name="prerender-route" content="/" />', `<meta name="prerender-route" content="${routePath}" />`)
}

function buildRedirectHtml(targetPath) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0; url=${targetPath}" />
    <title>Redirecting…</title>
    <script>
      window.location.replace(${JSON.stringify(targetPath)});
    </script>
  </head>
  <body></body>
</html>`
}

for (const routePath of getStaticRenderPaths()) {
  if (routePath === '/') {
    continue
  }

  const rendered = await render(routePath)
  const html = injectHtml(routePath, rendered)
  const outputPath = routeToOutputPath(routePath)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
}

await writeFile(path.join(distDir, 'index.html'), buildRedirectHtml(defaultLocalePath), 'utf8')
await writeFile(path.join(distDir, '404.html'), buildRedirectHtml(defaultLocalePath), 'utf8')
await writeFile(path.join(distDir, '.nojekyll'), '', 'utf8')
