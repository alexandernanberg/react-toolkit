import { createContext, useContext, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

// eslint-disable-next-line camelcase
__webpack_public_path__ = `/_build/`

const isServer = !(typeof window !== 'undefined')

const Router = isServer ? StaticRouter : BrowserRouter

let c
if (!isServer) {
  c = JSON.parse(document.getElementById('__context').textContent)
}

const Context = createContext()

export const ContextProvider = Entry

export function Entry({ url, context: entryContext, children }) {
  const routerProps = useMemo(
    () => (isServer ? { location: url } : undefined),
    [url]
  )
  const context = useMemo(() => (!isServer ? c : entryContext), [entryContext])

  return (
    <Router {...routerProps}>
      <Context.Provider value={context}>{children}</Context.Provider>
    </Router>
  )
}

export function Meta() {
  const context = useContext(Context)

  return (
    <>
      {/* {Object.entries(context.buildManifest).map(([key, src]) => (
        <link key={key} rel="preload" href={`/_build${src}`} as="script" />
      ))} */}
    </>
  )
}

export function Links() {
  const context = useContext(Context)

  return Object.entries(context.buildManifest)
    .filter(([, src]) => src.endsWith('.css'))
    .map(([key, src]) => (
      <link key={key} href={`/_build${encodeURI(src)}`} rel="stylesheet" />
    ))
}

export function Scripts() {
  const context = useContext(Context)

  return (
    <>
      <script
        id="__context"
        type="application/json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(context) }}
      />
      {Object.entries(context.buildManifest)
        .filter(([, src]) => src.endsWith('.js'))
        .map(([key, src]) => (
          <script key={key} src={`/_build${encodeURI(src)}`} async />
        ))}
    </>
  )
}
