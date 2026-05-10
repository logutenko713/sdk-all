import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { CartProvider } from '@contexts/CartContext'
import AdminLogin from './components/AdminLogin/AdminLogin';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminProducts from './components/AdminProducts/AdminProducts';
import AdminOrders from './components/AdminOrders/AdminOrders';
import AdminSettings from './components/AdminSettings/AdminSettings';
import AdminVariants from './components/AdminVariants/AdminVariants';
import AdminCarousel from './components/AdminCarousel/AdminCarousel';
import AdminDocs from './components/AdminDocs/AdminDocs';
import CheckoutPage from './pages/CheckoutPage';

import {
  Header,
  Footer,
  MainContent,
  Documents,
  Catalog
} from '@components';

import './App.css'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }>
              <Route index element={<AdminProducts />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="variants" element={<AdminVariants />} />
              <Route path="carousel" element={<AdminCarousel />} />
              <Route path="docs" element={<AdminDocs />} />
            </Route>
          </Routes>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App