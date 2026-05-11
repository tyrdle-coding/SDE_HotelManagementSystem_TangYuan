import type {
  AdminStats,
  AuthSession,
  Booking,
  BookingStatus,
  FeedbackMessage,
  FeedbackStatus,
  Room,
  User,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBooking(b: any): Booking {
  return {
    id: b.id,
    roomId: b.room_id,
    roomName: b.room_name,
    userId: b.user_id,
    userName: b.user_name,
    userEmail: b.user_email,
    checkIn: b.check_in,
    checkOut: b.check_out,
    guests: b.guests,
    totalPrice: b.total_price,
    status: b.status,
    paymentStatus: b.payment_status,
    paymentMethod: b.payment_method,
    createdAt: b.created_at,
    phone: b.phone,
    specialRequests: b.special_requests,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFeedbackMessage(message: any): FeedbackMessage {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
    status: message.status ?? 'new',
    createdAt: message.created_at,
  };
}

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
  signup: (payload: { name: string; email: string; phone: string; password: string }) =>
    request<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),
  updateCurrentUser: (payload: { name: string; email: string; phone: string }) =>
    request<AuthSession>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
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
  getBookings: async (userId?: string) => {
    const data = await request<{ bookings: unknown[] }>(userId ? '/api/bookings?userId=' + userId : '/api/bookings');
    return { bookings: data.bookings.map(mapBooking) };
  },
  createBooking: async (payload: {
    roomId: string;
    userName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    phone: string;
    specialRequests: string;
    paymentMethod: string;
  }) => {
    const data = await request<{ booking: unknown }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { booking: mapBooking(data.booking) };
  },
  updateBookingStatus: async (id: string, status: BookingStatus) => {
    const data = await request<{ booking: unknown }>('/api/bookings/' + id + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { booking: mapBooking(data.booking) };
  },
  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const data = await request<{ booking: unknown }>('/api/bookings/' + id + '/payment', {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
    return { booking: mapBooking(data.booking) };
  },
  sendContactMessage: async (payload: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) => {
    const data = await request<{ message: unknown }>('/api/contact-messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { message: mapFeedbackMessage(data.message) };
  },
  getFeedbackMessages: async () => {
    const data = await request<{ messages: unknown[] }>('/api/admin/feedback');
    return { messages: data.messages.map(mapFeedbackMessage) };
  },
  updateFeedbackStatus: async (id: string, status: FeedbackStatus) => {
    const data = await request<{ message: unknown }>('/api/admin/feedback/' + id + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { message: mapFeedbackMessage(data.message) };
  },
  getAdminStats: async () => {
    const data = await request<{ stats: AdminStats & { recentBookings: unknown[] } }>('/api/admin/stats');
    return { stats: { ...data.stats, recentBookings: data.stats.recentBookings.map(mapBooking) } };
  },
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
