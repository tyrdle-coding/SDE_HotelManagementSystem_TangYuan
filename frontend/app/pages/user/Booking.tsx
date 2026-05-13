import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Users, Check, Globe, Star } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Label } from '../../components/Label';
import { Magnetic } from '../../components/Magnetic';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'sonner';
import { hotelApi } from '../../api';
import { formatCurrency } from '../../components/utils';
import type { Room } from '../../types';

export function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1',
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'bank_transfer',
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    hotelApi.getRoom(id)
      .then((data) => setRoom(data.room))
      .catch(() => setRoom(null));
  }, [id]);

  if (!room) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Room not found</h2>
          <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const subtotal = room.price * nights;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      const { booking } = await hotelApi.createBooking({
        roomId: room.id,
        userName: `${formData.firstName} ${formData.lastName}`.trim(),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: Number(formData.guests),
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod,
      });

      toast.success('Booking created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafafa] pt-24 pb-16 text-slate-900">
      <div className="px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="gap-2 text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => navigate(`/rooms/${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Room Details
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="break-words text-4xl md:text-[4rem] tracking-tight font-light text-slate-950 mb-3">
            Secure Your <span className="italic font-serif text-[#c19e58]">Stay</span>
          </h1>
          <p className="break-words text-lg text-slate-500 font-light mb-8 sm:text-xl sm:mb-12">
            Experience the energy of Kuching Waterfront hospitality
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3 xl:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-8">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-white rounded-[2rem] p-5 sm:p-8 md:p-10 border border-slate-100 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4 mb-8">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#c19e58]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-medium text-slate-900 sm:text-2xl">Stay Details</h2>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mt-1">Select your dates</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 md:gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="checkIn" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Check-in Date</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="checkOut" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Check-out Date</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="guests" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      min="1"
                      max={room.capacity}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                    <p className="text-[10px] text-slate-400 font-medium ml-1">Maximum {room.capacity} guests allowed for this room</p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white rounded-[2rem] p-5 sm:p-8 md:p-10 border border-slate-100 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4 mb-8">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#c19e58]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-medium text-slate-900 sm:text-2xl">Guest Information</h2>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mt-1">Personal details</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 md:gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-slate-50/50 border-slate-100 focus:border-[#c19e58] focus:bg-white h-14 rounded-2xl px-6"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label htmlFor="specialRequests" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Special Requests (Optional)</Label>
                    <textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 focus:border-[#c19e58] focus:bg-white focus:outline-none text-slate-900 resize-none transition-all duration-300 font-light"
                      placeholder="Pillow preference, airport transfer, etc."
                    />
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white rounded-[2rem] p-5 sm:p-8 md:p-10 border border-slate-100 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4 mb-8">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#c19e58]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-medium text-slate-900 sm:text-2xl">Payment Method</h2>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mt-1">Payment method</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                      className={`flex min-w-0 flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 sm:p-5 ${
                        formData.paymentMethod === 'bank_transfer'
                          ? 'border-[#c19e58] bg-[#c19e58]/5 text-[#c19e58]'
                          : 'border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <Globe className="w-6 h-6 mb-2" />
                      <span className="text-center text-[10px] font-bold uppercase tracking-widest sm:text-xs">Bank Payment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                      className={`flex min-w-0 flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 sm:p-5 ${
                        formData.paymentMethod === 'cash'
                          ? 'border-[#c19e58] bg-[#c19e58]/5 text-[#c19e58]'
                          : 'border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <Check className="w-6 h-6 mb-2" />
                      <span className="text-center text-[10px] font-bold uppercase tracking-widest sm:text-xs">Pay at Counter</span>
                    </button>
                  </div>

                  {formData.paymentMethod === 'bank_transfer' && (
                    <p className="text-sm text-slate-500 font-light italic p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      After submitting, this reservation is recorded as paid by bank payment.
                    </p>
                  )}

                  {formData.paymentMethod === 'cash' && (
                    <p className="text-sm text-slate-500 font-light italic p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      Payment will be collected at the hotel counter. Admin can mark it paid after receiving payment.
                    </p>
                  )}
                </div>
              </motion.section>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white rounded-[2rem] p-5 sm:p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Star className="w-24 h-24 text-slate-900" />
                </div>

                <h2 className="text-2xl font-medium mb-8">Summary</h2>

                <div className="space-y-6 mb-8 pb-8 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#c19e58] mb-1">{room.type}</p>
                      <h3 className="break-words text-lg font-medium leading-tight">{room.name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Check-in</p>
                      <p className="text-sm font-medium">{formData.checkIn || '--'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Check-out</p>
                      <p className="text-sm font-medium">{formData.checkOut || '--'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex min-w-0 justify-between gap-3 text-slate-500 font-light">
                    <span className="min-w-0 break-words">{formatCurrency(room.price)} x {nights} nights</span>
                    <span className="shrink-0">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex min-w-0 justify-between gap-3 text-slate-500 font-light">
                    <span className="min-w-0 break-words">Occupancy tax (10%)</span>
                    <span className="shrink-0">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex min-w-0 justify-between gap-3 text-lg font-medium text-slate-950 pt-4 border-t border-slate-100 sm:text-xl">
                    <span>Total Amount</span>
                    <span className="break-words text-right text-[#c19e58]">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Magnetic strength={10}>
                  <Button
                    form="booking-form"
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full h-14 rounded-2xl bg-[#c19e58] text-sm text-white hover:bg-[#a68748] font-medium group transition-all duration-500 shadow-lg shadow-[#c19e58]/20 disabled:opacity-50 sm:h-16 sm:text-lg"
                  >
                    {submitting ? 'Orchestrating...' : 'Complete Reservation'}
                  </Button>
                </Magnetic>

                <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest mt-6">
                  Guaranteed Secure Checkout
                </p>
              </motion.div>

              <div className="p-6 bg-[#fafafa] rounded-[2rem] border border-slate-100 border-dashed">
                <p className="text-xs text-slate-500 leading-relaxed font-light italic">
                  By clicking the booking button, you agree to our 24-hour cancellation policy and terms of service. Your luxury experience begins here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
