import { renderToString } from 'react-dom/server'
import { Response } from 'react-toolkit/loader'
import { ContextProvider } from 'react-toolkit/react'
import { ServerStyleSheet } from 'styled-components'
import App from './root'
import StylesheetContext from './stylesheet-context'

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  context
) {
  const sheet = new ServerStyleSheet()

  // First render pass to collect all styles.
  renderToString(
    sheet.collectStyles(
      <StylesheetContext.Provider value={null}>
        <ContextProvider url={request.url} context={context}>
          <App />
        </ContextProvider>
      </StylesheetContext.Provider>
    )
  )
  const styles = sheet.getStyleElement()
  sheet.seal()

  const markup = renderToString(
    <StylesheetContext.Provider value={styles}>
      <ContextProvider url={request.url} context={context}>
        <App />
      </ContextProvider>
    </StylesheetContext.Provider>
  )

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      'Content-type': 'text/html',
    },
  })
}
