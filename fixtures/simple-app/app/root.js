import { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Route, Routes, NavLink } from 'react-router-dom'
import { Meta, Scripts, Links } from 'react-toolkit/react'
import styled from 'styled-components'
import StylesheetContext from './stylesheet-context'
import './style.css'

const Box = styled.div`
  background-color: red;
  height: 300px;
  width: 300px;
`

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

let hydrating = true
function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(!hydrating)

  useIsomorphicEffect(() => {
    hydrating = false
    setMounted(true)
  }, [])

  return mounted ? children : fallback
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
        <Links />
        <title>Simple app</title>
        {styles}
      </head>
      <body>
        <Box />
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin">Login</NavLink>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Index</h1>
                <ClientOnly fallback="Loading...">
                  <div>Only on the client</div>
                </ClientOnly>
              </>
            }
          />
          <Route path="/admin" element={<h1>Admin</h1>} />
        </Routes>
        <Scripts />
      </body>
    </html>
  )
}
