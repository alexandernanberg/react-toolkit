import { renderToString } from 'react-dom/server'
import { Response } from 'react-toolkit/loader'
import { ContextProvider } from 'react-toolkit/react'
import { ServerStyleSheet } from 'styled-components'
import App from './App'
import StylesContext from './styles-context'

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  context
) {
  const sheet = new ServerStyleSheet()

  // First render pass to collect all styles.
  renderToString(
    sheet.collectStyles(
      <StylesContext.Provider value={null}>
        <ContextProvider url={request.url} context={context}>
          <App />
        </ContextProvider>
      </StylesContext.Provider>
    )
  )
  const styles = sheet.getStyleElement()
  sheet.seal()

  const markup = renderToString(
    <StylesContext.Provider value={styles}>
      <ContextProvider url={request.url} context={context}>
        <App />
      </ContextProvider>
    </StylesContext.Provider>
  )

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      'Content-type': 'text/html',
    },
  })
}
