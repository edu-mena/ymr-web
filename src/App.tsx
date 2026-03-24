// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import QuickContact from './components/QuickContact';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import About from './pages/About';
import Catalog from './pages/Catalog';
import Contact from './pages/Contact';
import Service from './pages/Services';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/cartPage';
import Login from './pages/Login';

function TopChrome() {
  const location = useLocation();
  const hide = location.pathname === '/login';
  if (hide) return null;
  return <Header />;
}

function BottomChrome() {
  const location = useLocation();
  const hide = location.pathname === '/login';
  if (hide) return null;
  return (
    <>
      <QuickContact />
      <Footer />
    </>
  );
}

// ✅ Componente interno para aceder ao user do AuthContext
function AppContent() {
  const { user } = useAuth();

  return (
    // ✅ PASSA user?.id ao CartProvider
    <CartProvider userId={user?.id ?? null}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <ScrollToTop />
        <TopChrome />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Service />} />
            <Route path="/userprofile" element={<RequireAuth><UserProfile /></RequireAuth>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <BottomChrome />
      </div>
    </CartProvider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Login />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}