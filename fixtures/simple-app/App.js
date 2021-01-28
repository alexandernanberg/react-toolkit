import { useEffect, useLayoutEffect, useState } from 'react'
import { Scripts, Meta } from 'react-toolkit/react'
import { Routes, Route } from 'react-router-dom'
import styled from 'styled-components'

const Box = styled.div`
  background-color: red;
  height: 300px;
  width: 300px;
`

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

function NoSsr({ children }) {
  const [mounted, setMounted] = useState(false)

  useIsomorphicEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? children : null
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <Meta />
        <title>Simple app</title>
      </head>
      <body>
        Hello world
        <Box />
        <Routes>
          <Route path="/" element={<>Index</>} />
          <Route path="/foo" element={<>Foo</>} />
          <Route path="/bar" element={<>Bar</>} />
        </Routes>
        <NoSsr>
          <div>Only on the lol</div>
        </NoSsr>
        <Scripts />
      </body>
    </html>
  )
}
