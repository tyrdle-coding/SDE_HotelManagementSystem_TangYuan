import { createBrowserRouter } from 'react-router-dom';
import { Root } from './pages/user/Root';
import { Home } from './pages/user/Home';
import { Rooms } from './pages/user/Rooms';
import { RoomDetails } from './pages/user/RoomDetails';
import { Booking } from './pages/user/Booking';
import { Dashboard } from './pages/user/Dashboard';
import { About } from './pages/user/About';
import { Contact } from './pages/user/Contact';
import { Login } from './pages/user/Login';
import { Signup } from './pages/user/Signup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRooms } from './pages/admin/AdminRooms';
import { AdminBookings } from './pages/admin/AdminBookings';
import { NotFound } from './pages/user/NotFound';

// Define all application routes in one place for user and admin flows.
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'rooms', Component: Rooms },
      { path: 'rooms/:id', Component: RoomDetails },
      { path: 'booking/:id', Component: Booking },
      { path: 'dashboard', Component: Dashboard },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'login', Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'admin', Component: AdminDashboard },
      { path: 'admin/rooms', Component: AdminRooms },
      { path: 'admin/bookings', Component: AdminBookings },
      { path: '*', Component: NotFound },
    ],
  },
]);
