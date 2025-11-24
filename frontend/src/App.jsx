import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ReviewOrder from './pages/ReviewOrder';
import Cart from './pages/Cart';
import Reviews from './pages/Reviews';
import AdminRestaurant from './pages/AdminRestaurant';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import AdminDeliverers from './pages/AdminDeliverers';
import DriverOrders from './pages/DriverOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="app">
              <Navbar />
              
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/restaurants" element={<Restaurants />} />
                  <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders/:id" 
                    element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders/:id/review" 
                    element={
                      <ProtectedRoute>
                        <ReviewOrder />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/reviews"
                    element={
                      <ProtectedRoute>
                        <Reviews />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/restaurant" 
                    element={
                      <ProtectedRoute>
                        <AdminRestaurant />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/menu" 
                    element={
                      <ProtectedRoute>
                        <AdminMenu />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <ProtectedRoute>
                        <AdminOrders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/deliverers" 
                    element={
                      <ProtectedRoute>
                        <AdminDeliverers />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/driver/orders" 
                    element={
                      <ProtectedRoute>
                        <DriverOrders />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
