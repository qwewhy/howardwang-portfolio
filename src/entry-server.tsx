import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ServerRouter } from './app/router/ServerRouter'
import { buildHeadMarkup, getRouteMeta } from './app/seo/meta'
import { getStaticRenderPaths } from './app/router/route-utils'

export { getStaticRenderPaths }

export async function render(url: string) {
  const appHtml = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <ServerRouter />
    </MemoryRouter>,
  )

  const meta = getRouteMeta(url)

  return {
    appHtml,
    head: buildHeadMarkup(url),
    lang: meta.lang,
  }
}
