import ReactDOM from 'react-dom'
import { ContextProvider } from 'react-toolkit/react'
import App from './App'

ReactDOM.hydrate(
  <ContextProvider>
    <App />
  </ContextProvider>,
  document
)
