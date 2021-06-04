import { createContext, useContext, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

const isServer = !(typeof window !== 'undefined')

const Router = isServer ? StaticRouter : BrowserRouter

let serverHandoffString
let serverHandoff
if (!isServer) {
  serverHandoffString = document.getElementById('__context__').textContent
  serverHandoff = JSON.parse(serverHandoffString)
}

const Context = createContext()

export const ContextProvider = Entry

export function Entry({ url, context: entryContext, children }) {
  const routerProps = useMemo(
    () => (isServer ? { location: url } : undefined),
    [url]
  )
  const context = useMemo(() => {
    if (isServer) {
      return entryContext
    }
    return { ...serverHandoff, serverHandoffString }
  }, [entryContext])

  return (
    <Router {...routerProps}>
      <Context.Provider value={context}>{children}</Context.Provider>
    </Router>
  )
}

export function Meta() {
  return null
}

export function Links() {
  const context = useContext(Context)

  return Object.entries(context.buildManifest)
    .filter(([, src]) => src.endsWith('.css'))
    .map(([key, src]) => (
      <link key={key} href={encodeURI(src)} rel="stylesheet" />
    ))
}

export function Scripts() {
  const {
    serverHandoffString: contextServerHandoffString,
    buildManifest,
  } = useContext(Context)

  return (
    <>
      <script
        id="__context__"
        type="application/json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: contextServerHandoffString }}
      />
      {Object.entries(buildManifest)
        .filter(([, src]) => src.endsWith('.js'))
        .map(([key, src]) => (
          <script key={key} src={encodeURI(src)} async />
        ))}
    </>
  )
}
