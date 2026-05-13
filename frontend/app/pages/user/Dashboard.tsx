import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle, Clock, CreditCard, Mail, MapPin, Phone, Users, XCircle } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { Button } from '../../components/Button';
import { hotelApi } from '../../api';
import type { Booking } from '../../types';
import { formatCurrency } from '../../components/utils';

export function Dashboard() {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserBookings([]);
      return;
    }

    hotelApi.getBookings(user.id)
      .then((data) => setUserBookings(data.bookings))
      .catch(() => setUserBookings([]));
  }, [user]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'refunded':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  const getBookingCardClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50/70 border-amber-200 hover:border-amber-300';
      case 'confirmed':
        return 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300';
      case 'completed':
        return 'bg-blue-50/60 border-blue-200 hover:border-blue-300';
      case 'cancelled':
        return 'bg-red-50/60 border-red-200 hover:border-red-300';
      default:
        return 'bg-secondary/30 border-border hover:border-primary/50';
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2">Welcome back, {user?.name}</h1>
          <p className="text-lg text-muted-foreground">Manage your bookings and reservations</p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: 'Total Bookings',
              value: userBookings.length,
              icon: Calendar,
              color: 'bg-blue-500/10 text-blue-600',
            },
            {
              label: 'Confirmed',
              value: userBookings.filter((b) => b.status === 'confirmed').length,
              icon: CheckCircle,
              color: 'bg-green-500/10 text-green-600',
            },
            {
              label: 'Pending',
              value: userBookings.filter((b) => b.status === 'pending').length,
              icon: Clock,
              color: 'bg-yellow-500/10 text-yellow-600',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-secondary/50 rounded-3xl p-6 border border-border"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl mb-6">Your Bookings</h2>

          {userBookings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-border">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start planning your luxury getaway</p>
              <Link to="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {userBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`rounded-3xl p-6 md:p-8 border transition-colors ${getBookingCardClass(booking.status)}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-2xl">{booking.roomName}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Check-in: {formatDate(booking.checkIn)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Check-out: {formatDate(booking.checkOut)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{booking.guests} guests</span>
                        </div>

                        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="min-w-0 break-all">Booking ID: {booking.id}</span>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Booking ID: {booking.id}</span>

                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl mb-2">{formatCurrency(booking.totalPrice)}</p>
                      <Button
                        variant="outline"
                        onClick={() => setOpenBookingId(openBookingId === booking.id ? null : booking.id)}
                      >
                        {openBookingId === booking.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>

                  {openBookingId === booking.id ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="mt-6 overflow-hidden border-t border-border pt-6"
                    >
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="min-w-0 rounded-2xl bg-white/70 p-4 border border-border sm:p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Stay</p>
                          <div className="space-y-2 text-sm">
                            <p>Check-in: {formatDate(booking.checkIn)}</p>
                            <p>Check-out: {formatDate(booking.checkOut)}</p>
                            <p>{booking.guests} guest{booking.guests === 1 ? '' : 's'}</p>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-white/70 p-4 border border-border sm:p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Guest</p>
                          <div className="space-y-2 text-sm">
                            <p className="flex min-w-0 items-center gap-2">
                              <Users className="w-4 h-4 shrink-0 text-[#c19e58]" />
                              <span className="min-w-0 break-words">{booking.userName}</span>
                            </p>
                            <p className="flex min-w-0 items-center gap-2 break-all">
                              <Mail className="w-4 h-4 shrink-0 text-[#c19e58]" />
                              <span className="min-w-0 break-all">{booking.userEmail}</span>
                            </p>
                            {booking.phone ? (
                              <p className="flex min-w-0 items-center gap-2">
                                <Phone className="w-4 h-4 shrink-0 text-[#c19e58]" />
                                <span className="min-w-0 break-words">{booking.phone}</span>
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-white/70 p-4 border border-border sm:p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Payment</p>
                          <div className="space-y-3 text-sm">
                            <p className="flex min-w-0 items-center gap-2 capitalize">
                              <CreditCard className="w-4 h-4 shrink-0 text-[#c19e58]" />
                              <span className="min-w-0 break-words">{booking.paymentMethod.replace('_', ' ')}</span>
                            </p>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs capitalize ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {booking.paymentStatus}
                            </span>
                            <p className="break-words text-lg font-medium">{formatCurrency(booking.totalPrice)}</p>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-white/70 p-4 border border-border sm:p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Request</p>
                          <p className="text-sm text-muted-foreground leading-6">
                            {booking.specialRequests?.trim() || 'No special requests added.'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="break-words text-sm text-muted-foreground">Created on {formatDate(booking.createdAt)}</p>
                        <Link to={`/rooms/${booking.roomId}`} className="w-full sm:w-auto">
                          <Button variant="outline" className="w-full gap-2 sm:w-auto">
                            Open Room
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ) : null}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
