import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
// Import page styles globally to prevent loading issues
import './pages/AdminMenu.css'
import './pages/RestaurantDetail.css'
import './pages/AdminRestaurant.css'
import './pages/Checkout.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
