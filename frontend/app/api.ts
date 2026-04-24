import type {
  AdminStats,
  AuthSession,
  Booking,
  BookingStatus,
  Room,
  User,
} from './types';

// Shared fetch helper for all frontend-to-backend API requests.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  return response.json();
}

// Centralized frontend API client used by pages and components.
export const hotelApi = {
  login: (email: string, password: string) =>
    request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (payload: { name: string; email: string; password: string }) =>
    request<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  getRooms: () => request<{ rooms: Room[] }>('/api/rooms'),
  getRoom: (id: string) => request<{ room: Room }>('/api/rooms/' + id),
  createRoom: (room: Omit<Room, 'id'>) =>
    request<{ room: Room }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    }),
  updateRoom: (id: string, room: Omit<Room, 'id'>) =>
    request<{ room: Room }>('/api/rooms/' + id, {
      method: 'PUT',
      body: JSON.stringify(room),
    }),
  deleteRoom: (id: string) =>
    request<{ success: boolean }>('/api/rooms/' + id, {
      method: 'DELETE',
    }),
  getBookings: (userId?: string) =>
    request<{ bookings: Booking[] }>(userId ? '/api/bookings?userId=' + userId : '/api/bookings'),
  createBooking: (payload: {
    roomId: string;
    userName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    phone: string;
    specialRequests: string;
    paymentMethod: string;
  }) =>
    request<{ booking: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBookingStatus: (id: string, status: BookingStatus) =>
    request<{ booking: Booking }>('/api/bookings/' + id + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    request<{ booking: Booking }>('/api/bookings/' + id + '/payment', {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    }),
  getAdminStats: () => request<{ stats: AdminStats }>('/api/admin/stats'),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json() as Promise<{ url: string }>;
    });
  },
};
