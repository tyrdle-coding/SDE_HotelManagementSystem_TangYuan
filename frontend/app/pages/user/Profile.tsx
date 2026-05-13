import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Phone, User, UserRoundCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Label } from '../../components/Label';
import { useAuth } from '../../components/AuthContext';
import { hotelApi } from '../../api';

export function Profile() {
  const { user, saveSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const initials = useMemo(() => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'HH';
  }, [name]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await hotelApi.updateCurrentUser({ name, email, phone });
      saveSession(response.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] pt-24 pb-16 text-slate-950">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="section-kicker mb-4 text-[#8a6d31]">Account center</p>
            <h1 className="text-4xl md:text-6xl tracking-[-0.045em]">Account profile</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Manage the contact details used for account access, arrival updates, and concierge follow-up.
            </p>
          </div>
          {!isAdmin ? (
            <Link to="/dashboard">
              <Button variant="outline" className="bg-white">
                View My Bookings
              </Button>
            </Link>
          ) : null}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="overflow-hidden rounded-[2rem] border border-white bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,22,31,0.16)]"
          >
            <div className="relative p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,158,88,0.28),transparent_34%)]" />
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-2xl font-medium text-[#f4deb4]">
                  {initials}
                </div>
                <h2 className="mt-6 text-3xl tracking-[-0.03em]">{user.name}</h2>
                <p className="mt-2 text-sm text-white/62">{user.email}</p>
                <p className="mt-1 text-sm text-white/62">{user.phone || 'No contact number saved'}</p>
              </div>
            </div>

          </motion.aside>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="rounded-[2rem] border border-white bg-white p-6 shadow-[0_30px_90px_rgba(15,22,31,0.08)] md:p-8"
          >
            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c19e58]/10 text-[#c19e58]">
                  <UserRoundCog className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl tracking-[-0.03em]">Personal information</h2>
                  <p className="text-sm text-muted-foreground">These details appear on your account records.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="h-13 bg-slate-50 pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+60 12-345 6789"
                    className="h-13 bg-slate-50 pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-13 bg-slate-50 pl-11"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Changes are saved to your account{isAdmin ? '.' : ' and linked booking records.'}
              </p>
              <Button type="submit" disabled={submitting} className="min-w-36">
                {submitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
