import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Landmark, UtensilsCrossed, ShoppingBag, Trees, ArrowRight, MessageSquare, Globe, Sparkles } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Label } from '../../components/Label';
import { HotelLocationMap } from '../../components/HotelLocationMap';
import { Effect } from '../../components/Effect';
import { Magnetic } from '../../components/Magnetic';
import { toast } from 'sonner';
import { useState } from 'react';

const contactChannels = [
  { icon: Phone, title: 'Direct Line', detail: '+60 82-288 191', kicker: '24/7 Concierge' },
  { icon: Mail, title: 'Email Inquiry', detail: 'reservations@hhotel.my', kicker: 'Response < 2h' },
  { icon: MessageSquare, title: 'Live Chat', detail: 'Available in-app', kicker: 'Instant Support' },
  { icon: Globe, title: 'Regional Reach', detail: 'Kuching • Kuala Lumpur • Singapore', kicker: 'Borneo Gateway' },
];

export function Contact() {
  const hotelLocation = {
    name: 'H Hotel',
    addressLine1: 'Jalan Tunku Abdul Rahman',
    addressLine2: 'Kuching Waterfront, 93000 Kuching, Sarawak, Malaysia',
    latitude: 1.5577,
    longitude: 110.344,
    description: 'Kuching Waterfront, 93000 Kuching, Sarawak, Malaysia',
  };

  const nearbyPlaces = [
    {
      name: 'Darul Hana Bridge',
      type: 'Waterfront stroll',
      distance: '5 minutes on foot',
      latitude: 1.5601,
      longitude: 110.3467,
      description: 'A scenic pedestrian bridge linking the waterfront promenade to the riverbank gardens.',
      icon: Trees,
    },
    {
      name: 'Main Bazaar',
      type: 'Heritage shopping',
      distance: '8 minutes on foot',
      latitude: 1.5587,
      longitude: 110.3478,
      description: 'A lively heritage street for Sarawak crafts, local snacks, and riverside browsing.',
      icon: ShoppingBag,
    },
    {
      name: 'Carpenter Street',
      type: 'Dining and nightlife',
      distance: '10 minutes away',
      latitude: 1.5564,
      longitude: 110.3456,
      description: 'A local favourite for cafes, supper spots, and evening walks through old Kuching.',
      icon: UtensilsCrossed,
    },
    {
      name: 'Borneo Cultures Museum',
      type: 'Cultural landmark',
      distance: '6 minutes by car',
      latitude: 1.5583,
      longitude: 110.3498,
      description: 'Sarawak’s flagship museum showcasing regional heritage, design, and storytelling.',
      icon: Landmark,
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been sent to our concierge team. We will respond shortly.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#f0d3a4]/50">
      {/* Hero Section */}
      <section className="relative pt-48 pb-24 overflow-hidden bg-[#fafafa]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(226,186,110,0.15),transparent_70%)]" />
        </div>

        <div className="px-4 max-w-7xl mx-auto relative z-10">
          <Effect delay={100} slide="up" blur="10px" className="flex items-center gap-3 mb-10">
            <span className="rounded-full border border-black/5 bg-white/40 px-5 py-2.5 text-[10px] font-medium tracking-[0.4em] uppercase backdrop-blur-sm shadow-sm">
              Concierge Services
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#c19e58]" />
              +60 82-288 191
            </div>
          </Effect>

          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-16 items-end">
            <Effect delay={200} slide="up">
              <h1 className="text-[3.8rem] md:text-[6rem] lg:text-[7.8rem] leading-[0.85] tracking-[-0.06em] text-slate-950 font-light">
                Reach out to <br />
                <span className="text-[#c19e58] italic font-serif">the inner circle.</span>
              </h1>
            </Effect>
            <Effect delay={300} slide="up" className="max-w-md pb-6">
              <p className="text-xl text-slate-500 leading-relaxed font-light">
                Whether you're planning a signature event or a private retreat, our concierge team is dedicated to orchestrating every detail of your stay.
              </p>
            </Effect>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-24">
          {/* Contact Details & Channels */}
          <div className="space-y-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-8">
              {contactChannels.map((channel, index) => (
                <Effect
                  key={channel.title}
                  delay={400 + index * 100}
                  slide="up"
                  blur="12px"
                  className="bg-white rounded-[2.5rem] p-9 group hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] transition-all duration-700 border border-slate-100"
                >
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#f0d3a4]/50 transition-colors">
                      <channel.icon className="w-6 h-6 text-[#c19e58]" />
                    </div>
                    <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-slate-300">{channel.kicker}</span>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">{channel.title}</h3>
                    <p className="text-2xl md:text-3xl text-slate-900 tracking-tight font-light">{channel.detail}</p>
                  </div>
                </Effect>
              ))}
            </div>

            <Effect delay={800} slide="up" className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
              <h3 className="text-2xl mb-5 tracking-tight font-medium text-slate-900">Visit the Estate</h3>
              <p className="text-slate-500 mb-10 leading-relaxed font-light">
                Experience contemporary Sarawak hospitality moments from the Kuching Waterfront promenade.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-5 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <MapPin className="w-5 h-5 text-[#c19e58] mt-1" />
                  <div>
                    <p className="text-slate-900 font-medium">{hotelLocation.addressLine1}</p>
                    <p className="text-slate-400 text-sm">{hotelLocation.addressLine2}</p>
                  </div>
                </div>
              </div>
            </Effect>
          </div>

          {/* Contact Form */}
          <Effect delay={500} slide="left" blur="15px" className="relative">
            <div className="sticky top-32">
              <div className="bg-white rounded-[3.5rem] p-10 md:p-16 overflow-hidden relative border border-slate-100 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.08)]">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <MessageSquare className="w-48 h-48 text-slate-900" />
                </div>

                <div className="mb-14">
                  <h2 className="text-4xl md:text-5xl mb-5 tracking-tight text-slate-950 font-light">Direct Message</h2>
                  <p className="text-slate-500 text-lg font-light">Inquire about availability, events, or private bookings.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-slate-50/50 border-slate-100 focus:border-[#f0d3a4] focus:bg-white h-16 rounded-2xl px-7 text-slate-900 transition-all duration-300"
                        placeholder="Luxury Guest"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-slate-50/50 border-slate-100 focus:border-[#f0d3a4] focus:bg-white h-16 rounded-2xl px-7 text-slate-900 transition-all duration-300"
                        placeholder="guest@hhotel.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-slate-50/50 border-slate-100 focus:border-[#f0d3a4] focus:bg-white h-16 rounded-2xl px-7 text-slate-900 transition-all duration-300"
                        placeholder="+60 12-345 6789"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Inquiry Type</Label>
                      <div className="relative">
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="w-full bg-slate-50/50 border border-slate-100 focus:border-[#f0d3a4] focus:bg-white h-16 rounded-2xl px-7 text-slate-900 appearance-none transition-all duration-300 outline-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-white">Select Inquiry Type</option>
                          <option value="Private Stay" className="bg-white">Private Stay & Suite Inquiry</option>
                          <option value="Event Planning" className="bg-white">Signature Event Planning</option>
                          <option value="Corporate" className="bg-white">Corporate Retreats</option>
                          <option value="Concierge Request" className="bg-white">Personal Concierge Request</option>
                          <option value="Other" className="bg-white">General Inquiry</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-7 text-[#c19e58]">
                          <ArrowRight className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Message</Label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="w-full rounded-[2.5rem] border border-slate-100 bg-slate-50/50 px-8 py-7 focus:border-[#f0d3a4] focus:bg-white focus:outline-none text-slate-900 resize-none transition-all duration-300 font-light"
                      placeholder="How can we assist you?"
                    />
                  </div>

                  <Magnetic strength={10}>
                    <Button type="submit" size="lg" className="w-full h-18 rounded-2xl bg-[#c19e58] text-white hover:bg-[#a68748] text-lg font-medium group transition-all duration-500 shadow-lg shadow-[#c19e58]/20">
                      Send Inquiry
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Magnetic>
                </form>
              </div>
            </div>
          </Effect>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-32 border-t border-slate-50 bg-[#fafafa]">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-20 items-center mb-20">
            <Effect inView slide="up">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c19e58] mb-5">Location</p>
              <h2 className="text-5xl md:text-6xl tracking-tight mb-8 font-light text-slate-950">In the heart of <br /><span className="italic font-serif">Kuching Waterfront.</span></h2>
              <p className="text-slate-500 text-xl max-w-md font-light leading-relaxed">
                Perfectly positioned beside the Sarawak River, with heritage streets, local dining, and riverfront landmarks within easy reach.
              </p>
            </Effect>

            <div className="grid grid-cols-2 gap-6">
              {nearbyPlaces.map((place, index) => (
                <Effect key={place.name} inView delay={index * 100} slide="up" className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <place.icon className="w-6 h-6 text-[#c19e58]" />
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-300">{place.distance}</span>
                  </div>
                  <h4 className="text-xl font-medium mb-2 text-slate-900">{place.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{place.type}</p>
                </Effect>
              ))}
            </div>
          </div>

          <Effect inView slide="up" delay={400} className="rounded-[4rem] overflow-hidden border border-slate-100 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.1)] relative group">
             <div className="absolute inset-0 z-10 pointer-events-none border-[16px] border-white rounded-[4rem]" />
             <div className="aspect-[21/9] min-h-[500px]">
               <HotelLocationMap hotel={hotelLocation} nearbyPlaces={nearbyPlaces} />
             </div>
          </Effect>
        </div>
      </section>
    </div>
  );
}
