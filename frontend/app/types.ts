export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  price: number;
  image: string;
  images: string[];
  capacity: number;
  size: number;
  description: string;
  amenities: string[];
  available: boolean;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'cash';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  phone?: string;
  specialRequests?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'guest';
}

export interface AuthSession {
  user: User;
}

export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  totalRooms: number;
  availableRooms: number;
  occupancyRate: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  recentBookings: Booking[];
}
