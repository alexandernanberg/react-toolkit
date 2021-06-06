import { createContext, useContext, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

export interface EntryContextType {
  serverHandoffString: string
  buildManifest: string
}

const Context = createContext<EntryContextType | null>(null)

function useEntryContext() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('`useEntryContext` must be rendered in `EntryContext`')
  }
  return context
}

interface EntryProps {
  context: EntryContextType
  children: React.ReactNode
}

function Entry({ context, children }: EntryProps) {
  return <Context.Provider value={context}>{children}</Context.Provider>
}

export interface EntryBrowserProps {
  children: React.ReactNode
}

export function EntryBrowser({ children }: EntryBrowserProps) {
  const context = useMemo(() => {
    const serverHandoffString =
      document.getElementById('__context__')?.textContent

    if (!serverHandoffString) {
      throw new Error('Sever handoff script element was not found')
    }

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

export interface EntryServerProps {
  url: string
  context: EntryContextType
  children: React.ReactNode
}

export function EntryServer({ url, context, children }: EntryServerProps) {
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
  const context = useEntryContext()

  return Object.entries(context.buildManifest)
    .filter(([, src]) => src.endsWith('.css'))
    .map(([key, src]) => (
      <link key={key} href={encodeURI(src)} rel="stylesheet" />
    ))
}

export function Scripts() {
  const { serverHandoffString, buildManifest } = useEntryContext()

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
