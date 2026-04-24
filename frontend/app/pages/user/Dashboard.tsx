import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { Button } from '../../components/Button';
import { hotelApi } from '../../api';
import type { Booking } from '../../types';
import { formatCurrency } from '../../components/utils';

export function Dashboard() {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

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
                  className="bg-secondary/30 rounded-3xl p-6 md:p-8 border border-border hover:border-primary/50 transition-colors"
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
                            Check-in: {new Date(booking.checkIn).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Check-out: {new Date(booking.checkOut).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{booking.guests} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Booking ID: {booking.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl mb-2">{formatCurrency(booking.totalPrice)}</p>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
