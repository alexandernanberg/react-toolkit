import { renderToString } from 'react-dom/server'
import { Response } from 'react-toolkit/loader'
import { ContextProvider } from 'react-toolkit/react'
import App from './App'

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  context
) {
  const markup = renderToString(
    <ContextProvider url={request.url} context={context}>
      <App />
    </ContextProvider>
  )

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      'Content-type': 'text/html',
    },
  })
}
