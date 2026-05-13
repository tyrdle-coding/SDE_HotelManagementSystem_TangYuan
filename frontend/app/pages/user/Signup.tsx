import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Hotel } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Label } from '../../components/Label';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'sonner';
import { hotelApi } from '../../api';

export function Signup() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);

    try {
      const session = await hotelApi.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      saveSession(session.user);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mt-16 grid min-h-[calc(100vh-4rem)] overflow-hidden bg-white lg:grid-cols-2">
      <div className="absolute inset-0 lg:hidden">
        <img
          src="https://images.unsplash.com/photo-1762774364978-4157c7ecf35f?auto=format&fit=crop&fm=jpg&q=80&w=1600"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/84 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex items-start justify-center px-4 py-6 sm:px-6 md:items-center lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm sm:p-7 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0 lg:backdrop-blur-0"
        >
          <div className="mb-4 flex items-center gap-2">
            <Hotel className="h-7 w-7 text-primary" />
            <span className="text-xl tracking-tight">H HOTEL</span>
          </div>

          <h1 className="mb-1 text-3xl leading-tight sm:text-4xl">Create Account</h1>
          <p className="mb-4 text-muted-foreground">
            Sign up to book rooms and manage your stays
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm lowercase">
                  full name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="your full name"
                  autoComplete="name"
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm lowercase">
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
                <Label htmlFor="phone" className="text-sm lowercase">
                  contact number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+60 12-345 6789"
                  autoComplete="tel"
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm lowercase">
                  password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="create a strong password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="confirmPassword" className="text-sm lowercase">
                  confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="repeat your password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

              <Button type="submit" className="h-11 w-full gap-2" disabled={submitting}>
                {submitting ? 'Creating Account' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden items-start justify-center p-8 lg:flex"
      >
        <div className="relative h-[calc(100vh-8rem)] min-h-[520px] max-h-[680px] w-full overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1762774364978-4157c7ecf35f?auto=format&fit=crop&fm=jpg&q=80&w=1600"
            alt="Ornate building surrounded by flowers"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="mb-2 text-3xl">Settle into your next stay</h2>
            <p className="text-lg opacity-90">
              Create your account to reserve elegant rooms, track bookings, and return to a restful space.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
