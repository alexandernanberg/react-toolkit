import { createContext, useContext, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

const Context = createContext()

function Entry({ context, children }) {
  return <Context.Provider value={context}>{children}</Context.Provider>
}

export function EntryBrowser({ children }) {
  const context = useMemo(() => {
    const serverHandoffString = document.getElementById('__context__')
      .textContent

    const entryContext = JSON.parse(serverHandoffString)
    entryContext.serverHandoffString = serverHandoffString
    return entryContext
  }, [])

  return (
    <BrowserRouter>
      <Entry context={context}>{children}</Entry>
    </BrowserRouter>
  )
}

export function EntryServer({ url, context, children }) {
  return (
    <StaticRouter location={url}>
      <Entry context={context}>{children}</Entry>
    </StaticRouter>
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
  const { serverHandoffString, buildManifest } = useContext(Context)

  return (
    <>
      <script
        id="__context__"
        type="application/json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serverHandoffString }}
      />
      {Object.entries(buildManifest)
        .filter(([, src]) => src.endsWith('.js'))
        .map(([key, src]) => (
          <script key={key} src={encodeURI(src)} async />
        ))}
    </>
  )
}
