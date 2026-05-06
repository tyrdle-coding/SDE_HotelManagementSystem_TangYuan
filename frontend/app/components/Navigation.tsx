import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Hotel, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from './Button';

import { HotelMark } from './HotelMark';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = isAdmin
    ? [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/rooms', label: 'Rooms' },
        { path: '/admin/bookings', label: 'Bookings' },
      ]
    : [
        { path: '/', label: 'Home' },
        { path: '/rooms', label: 'Rooms' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5 group">
            <div className="relative">
              <HotelMark className="w-9 h-9 transition-transform group-hover:scale-105" />
              <motion.div
                className="absolute inset-0 bg-[#c19e58]/10 rounded-xl blur-xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <span className="text-xl tracking-[0.1em] font-medium text-slate-900">HOTEL</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative py-2 text-sm tracking-wide transition-colors hover:text-primary"
              >
                {link.label}
                {isActive(link.path) ? (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {!isAdmin ? (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      My Bookings
                    </Button>
                  </Link>
                ) : null}
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary/50">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 px-4 rounded-lg hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && !isAdmin ? (
              <Link
                to="/dashboard"
                className="block py-2 px-4 rounded-lg hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
            ) : null}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-left py-2 px-4 rounded-lg hover:bg-secondary"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="block py-2 px-4 rounded-lg hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </motion.div>
        ) : null}
      </div>
    </motion.nav>
  );
}
