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
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2">
            <HotelMark className="h-9 w-9" />
            <span className="text-xl tracking-[0.1em] font-medium text-slate-900 uppercase">Hotel</span>
          </div>

          <h1 className="mb-2 text-4xl">Welcome back</h1>
          <p className="mb-8 text-muted-foreground">
            Sign in to manage your stays and upcoming bookings
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="mt-2"
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
                  className="mt-2"
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                {submitting ? 'Signing In' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
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
        className="relative hidden overflow-hidden lg:block"
      >
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGludGVyaW9yfGVufDF8fHx8MTc3NjI2NTk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="H Hotel interior"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="mb-2 text-3xl">A smoother stay starts here</h2>
          <p className="text-lg opacity-90">
            Access your reservations, room details, and personalized stay information in one place.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
