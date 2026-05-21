import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './components/Home/Home'
import LoginPopupListener from './components/auth-components/LoginPopupListener'
import AuthProvider from './app/AuthContext'
import SellerDashboard from './app/Seller/SellerDashboard'
import ProfilePage from './app/Customer/ProfilePage'
import ProductDetailPage from './app/Customer/ProductDetailPage'
import CartPage from './app/Customer/CartPage'
import CheckoutPage from './app/Customer/CheckoutPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LoginPopupListener>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </LoginPopupListener>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

