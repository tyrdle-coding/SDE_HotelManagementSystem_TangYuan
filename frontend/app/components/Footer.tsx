import { Link } from 'react-router-dom';
import { CalendarCheck, Mail, MapPin, Phone } from 'lucide-react';
import { HotelMark } from './HotelMark';
import { useAuth } from './AuthContext';

const guestLinks = [
  { to: '/', label: 'Home' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/rooms', label: 'Rooms' },
  { to: '/admin/bookings', label: 'Bookings' },
];

export function Footer() {
  const { isAdmin } = useAuth();
  const navLinks = isAdmin ? adminLinks : guestLinks;

  return (
    <footer className="relative overflow-hidden bg-white/80 text-slate-900 backdrop-blur-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,158,88,0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div className="max-w-md">
            <Link to={isAdmin ? '/admin' : '/'} className="inline-flex items-center gap-3">
              <HotelMark className="h-10 w-10" />
              <span className="text-xl font-medium tracking-[0.16em]">HOTEL</span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              A polished hotel booking experience for browsing rooms, managing stays, and keeping reservations simple.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c19e58]/20 bg-[#c19e58]/10 px-4 py-2 text-sm text-[#8a6d31]">
              <CalendarCheck className="h-4 w-4" />
              Book direct for a smoother stay
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-[#8a6d31]">Explore</h2>
            <nav className="mt-5 grid gap-3 text-sm text-slate-600">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="transition-colors hover:text-[#c19e58]">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-[#8a6d31]">Contact</h2>
            <div className="mt-5 grid gap-4 text-sm text-slate-600">
              <a href="tel:+6082288191" className="flex items-center gap-3 transition-colors hover:text-[#c19e58]">
                <Phone className="h-4 w-4 text-[#c19e58]" />
                +60 82-288 191
              </a>
              <a href="mailto:reservations@hhotel.my" className="flex items-center gap-3 transition-colors hover:text-[#c19e58]">
                <Mail className="h-4 w-4 text-[#c19e58]" />
                reservations@hhotel.my
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#c19e58]" />
                Kuching Waterfront, Sarawak
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} HOTEL. All rights reserved.</p>
          <p>Luxury stays, simple reservations.</p>
        </div>
      </div>
    </footer>
  );
}
