import ReactDOM from 'react-dom'
import { EntryBrowser } from 'react-toolkit/react'
import App from './root'

ReactDOM.hydrate(
  <EntryBrowser>
    <App />
  </EntryBrowser>,
  document
)
