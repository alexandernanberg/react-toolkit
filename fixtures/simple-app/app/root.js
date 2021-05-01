import { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Meta, Scripts } from 'react-toolkit/react'
import styled from 'styled-components'
import StylesheetContext from './stylesheet-context'

const Box = styled.div`
  background-color: red;
  height: 300px;
  width: 300px;
`

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

let hydrating = true
function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(!hydrating)

  useIsomorphicEffect(() => {
    hydrating = false
    setMounted(true)
  }, [])

  return mounted ? children : null
}

export default function App() {
  const styles = useContext(StylesheetContext)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>"
        />
        <Meta />
        <title>Simple app</title>
        {styles}
      </head>
      <body>
        <Box />
        <Routes>
          <Route path="/" element={<h1>Index</h1>} />
          <Route path="/foo" element={<h1>Foo</h1>} />
          <Route path="/bar" element={<h1>Bar</h1>} />
        </Routes>
        <ClientOnly>
          <div>Only on the client</div>
        </ClientOnly>
        <Scripts />
      </body>
    </html>
  )
}
