import { BrowserRouter } from 'react-router-dom'
import { ClientRouter } from './router/ClientRouter'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ClientRouter />
    </BrowserRouter>
  )
}
