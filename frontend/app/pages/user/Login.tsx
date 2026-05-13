import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HotelMark } from '../../components/HotelMark';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Label } from '../../components/Label';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'sonner';
import { hotelApi } from '../../api';

export function Login() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const session = await hotelApi.login(formData.email, formData.password);
      const user = saveSession(session.user);
      toast.success('Signed in successfully');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mt-16 grid min-h-[calc(100vh-4rem)] overflow-hidden bg-white xl:grid-cols-2">
      <div className="absolute inset-0 xl:hidden">
        <img
          src="https://images.unsplash.com/photo-1603768182862-483aeb564747?auto=format&fit=crop&fm=jpg&q=80&w=1600"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex items-start justify-center px-4 py-8 sm:px-6 md:items-center xl:py-12">

    <div className="mt-16 grid min-h-[calc(100vh-4rem)] bg-white lg:grid-cols-2">
      <div className="flex items-start justify-center px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          
          className="w-full max-w-md rounded-lg bg-white/88 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm sm:p-7 xl:bg-transparent xl:p-0 xl:shadow-none xl:ring-0 xl:backdrop-blur-0"

          className="w-full max-w-md">
          <div className="mb-5 flex items-center gap-2">
            <HotelMark className="h-9 w-9" />
            <span className="text-xl tracking-[0.1em] font-medium text-slate-900 uppercase">Hotel</span>
          </div>

          <h1 className="mb-2 text-4xl leading-tight">Welcome back</h1>
          <p className="mb-5 text-muted-foreground">
            Sign in to manage your stays and upcoming bookings
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="lowercase">
                  email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  placeholder="name@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password" className="lowercase">
                  password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="enter your password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                {submitting ? 'Signing In' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Need an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden items-start justify-center p-8 xl:flex">
        <div className="relative h-[calc(100vh-8rem)] min-h-[520px] max-h-[680px] w-full overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1603768182862-483aeb564747?auto=format&fit=crop&fm=jpg&q=80&w=1600"
            alt="City street near the hotel"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="mb-2 text-3xl">A smoother stay starts here</h2>
            <p className="text-lg opacity-90">
              Access your reservations, room details, and personalized stay information in one place.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
