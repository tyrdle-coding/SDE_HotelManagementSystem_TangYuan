import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Calendar, DollarSign, Users, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { hotelApi } from '../../api';
import type { AdminStats } from '../../types';
import { useAuth } from '../../components/AuthContext';
import { formatCurrency } from '../../components/utils';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [statsData, setStatsData] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    hotelApi.getAdminStats()
      .then((data) => setStatsData(data.stats))
      .catch(() => setStatsData(null));
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

  const totalRevenue = statsData?.totalRevenue ?? 0;
  const totalBookings = statsData?.totalBookings ?? 0;
  const occupancyRate = statsData?.occupancyRate ?? 0;
  const availableRooms = statsData?.availableRooms ?? 0;
  const monthlyData = statsData?.monthlyData ?? [];

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      label: 'Total Bookings',
      value: totalBookings,
      change: '+8.3%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: 'Rooms Available',
      value: availableRooms,
      change: '0%',
      trend: 'neutral',
      icon: Hotel,
      color: 'bg-orange-500/10 text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Monitor and manage your hotel operations</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-secondary/50 rounded-3xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    stat.trend === 'up'
                      ? 'bg-green-500/10 text-green-600'
                      : stat.trend === 'down'
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-secondary'
                  }`}
                >
                  {stat.trend === 'up' && <ArrowUp className="w-3 h-3" />}
                  {stat.trend === 'down' && <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-secondary/50 rounded-3xl p-8 border border-border"
          >
            <h3 className="text-2xl mb-6">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--secondary))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bookings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-secondary/50 rounded-3xl p-8 border border-border"
          >
            <h3 className="text-2xl mb-6">Monthly Bookings</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--secondary))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-secondary/50 rounded-3xl p-8 border border-border"
        >
          <h3 className="text-2xl mb-6">Recent Bookings</h3>
          <div className="space-y-4">
            {(statsData?.recentBookings ?? []).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.userName}</p>
                    <p className="text-sm text-muted-foreground">{booking.roomName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
