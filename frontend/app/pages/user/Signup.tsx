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
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8">
            <Hotel className="w-8 h-8 text-primary" />
            <span className="text-xl tracking-tight">H HOTEL</span>
          </div>

          <h1 className="text-4xl mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">
            Sign up to book rooms and manage your stays
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="lowercase">
                  full name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="your full name"
                  autoComplete="name"
                  required
                  className="mt-2"
                />
              </div>

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
                  placeholder="create a strong password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="lowercase">
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
                  className="mt-2"
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                {submitting ? 'Creating Account' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
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
        className="hidden lg:block relative overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJlZHJvb218ZW58MXx8fHwxNzc2MjY1OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Luxury hotel bedroom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-3xl mb-2">Settle into your next stay</h2>
          <p className="text-lg opacity-90">
            Create your account to reserve elegant rooms, track bookings, and return to a restful space.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
