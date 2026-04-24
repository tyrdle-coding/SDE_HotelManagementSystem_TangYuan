import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Mail, CreditCard } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { hotelApi } from '../../api';
import type { Booking, BookingStatus } from '../../types';
import { toast } from 'sonner';
import { useAuth } from '../../components/AuthContext';
import { formatCurrency } from '../../components/utils';

export function AdminBookings() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = () => {
    hotelApi.getBookings()
      .then((data) => setBookings(data.bookings))
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    if (isAdmin) {
      loadBookings();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl mb-3">Admin access required</h2>
          <Link to="/login">Sign in with the admin account</Link>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-secondary';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'refunded':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default:
        return 'bg-secondary';
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await hotelApi.updateBookingStatus(bookingId, status);
      toast.success('Booking status updated');
      loadBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update booking');
    }
  };

  const handlePaymentUpdate = async (bookingId: string, status: string) => {
    try {
      await hotelApi.updatePaymentStatus(bookingId, status);
      toast.success('Payment status updated');
      loadBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update payment');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2">Booking Management</h1>
          <p className="text-lg text-muted-foreground">View and manage all hotel bookings</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </motion.div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="bg-secondary/50 rounded-3xl p-6 md:p-8 border border-border"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-medium">Booking #{booking.id}</h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground font-light">{booking.roomName}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guest</p>
                        <p className="font-medium">{booking.userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                        <p className="font-medium truncate max-w-[150px]">{booking.userEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stay</p>
                        <p className="font-medium">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment</p>
                        <p className="font-medium capitalize">{booking.paymentMethod.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-6">
                  <div>
                    <p className="text-3xl font-light mb-1">{formatCurrency(booking.totalPrice)}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{booking.guests} guests</p>
                  </div>
                  <div className="flex flex-wrap lg:flex-nowrap gap-2">
                    {booking.paymentStatus !== 'paid' && (
                      <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" onClick={() => handlePaymentUpdate(booking.id, 'paid')}>
                        Mark Paid
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="border-slate-200" onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>
                      Confirm
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200" onClick={() => handleStatusUpdate(booking.id, 'completed')}>
                      Complete
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600" onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
