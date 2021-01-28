import { createContext, useContext, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

// eslint-disable-next-line
__webpack_public_path__ = `/_build/`

const isServer = !(typeof window !== 'undefined')

const Router = isServer ? StaticRouter : BrowserRouter

let c
if (!isServer) {
  c = JSON.parse(document.getElementById('__context').textContent)
}

const Context = createContext()

export function ContextProvider({ url, context, children }) {
  const value = useMemo(() => (!isServer ? c : context), [context])
  const routerProps = useMemo(() => (isServer ? { location: url } : {}), [url])

  return (
    <Router {...routerProps}>
      <Context.Provider value={value}>{children}</Context.Provider>
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
      {Object.entries(context.buildManifest).map(([key, src]) => (
        <script key={key} src={`/_build${encodeURI(src)}`} async />
      ))}
    </>
  )
}

export function Routes() {
  return null
}

export function Link() {
  return null
}
