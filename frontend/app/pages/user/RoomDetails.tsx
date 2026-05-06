import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users, Maximize, Check, Calendar, Sparkles, Star, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'sonner';
import { hotelApi } from '../../api';
import { Effect } from '../../components/Effect';
import { Magnetic } from '../../components/Magnetic';
import { formatCurrency } from '../../components/utils';
import type { Room } from '../../types';

export function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [otherRooms, setOtherRooms] = useState<Room[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    hotelApi.getRoom(id)
      .then((data) => setRoom(data.room))
      .catch(() => setRoom(null));

    hotelApi.getRooms()
      .then((data) => setOtherRooms(data.rooms.filter((item) => item.id !== id).slice(0, 3)))
      .catch(() => setOtherRooms([]));
  }, [id]);

  if (!room) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white text-slate-900">
        <div className="text-center">
          <h2 className="text-3xl font-light mb-8">Room not found</h2>
          <Link to="/rooms">
            <Button className="rounded-full px-8 bg-[#c19e58] text-white">Back to Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please sign in to secure your reservation');
      navigate('/login');
      return;
    }
    navigate(`/booking/${room.id}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#c19e58]/30 pt-24 pb-32">
      {/* Header Section */}
      <section className="px-4 max-w-7xl mx-auto mb-16">
        <div className="flex items-center justify-between mb-12">
          <Link to="/rooms">
            <Button variant="ghost" className="gap-2.5 text-slate-400 hover:text-slate-900 group transition-colors">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Collection
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#c19e58]" />
            Signature Suite
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-16 items-end">
          <Effect slide="up">
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7.2rem] leading-[0.85] tracking-[-0.06em] font-light text-slate-950">
              {room.name.split(' ')[0]} <br />
              <span className="text-[#c19e58] italic font-serif">{room.name.split(' ').slice(1).join(' ')}</span>
            </h1>
          </Effect>
          <Effect delay={100} slide="up" className="max-w-md pb-6">
            <p className="text-xl text-slate-500 font-light leading-relaxed">
              Experience Sarawak riverfront luxury in our meticulously designed {room.type.toLowerCase()}.
            </p>
          </Effect>
        </div>
      </section>

      {/* Gallery & Core Info */}
      <section className="px-4 max-w-7xl mx-auto mb-24">
        <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-12">
          {/* Main Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[3rem] aspect-[16/10] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100"
            >
              <img
                src={room.images[selectedImage] || room.image}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              {room.images.map((image, index) => (
                <Effect
                  key={index}
                  delay={index * 100}
                  slide="up"
                  className={`relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer border-2 transition-all duration-500 ${
                    selectedImage === index ? 'border-[#c19e58] shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${room.name} ${index + 1}`} className="w-full h-full object-cover" />
                </Effect>
              ))}
            </div>
          </div>

          {/* Reservation Card */}
          <div className="relative">
            <div className="sticky top-32">
              <Effect delay={200} slide="left" blur="15px" className="bg-white rounded-[3.5rem] p-10 md:p-12 border border-slate-100 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.08)]">
                <div className="mb-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mb-2">Private Rate</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-light text-slate-950">{formatCurrency(room.price)}</span>
                        <span className="text-slate-400 font-light">/night</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#c19e58]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-slate-900">4.9</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Capacity</span>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Users className="w-4 h-4 text-[#c19e58]" />
                        <span className="text-sm font-medium">{room.capacity} Guests</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-slate-200 pl-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Surface</span>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Maximize className="w-4 h-4 text-[#c19e58]" />
                        <span className="text-sm font-medium">{room.size}m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-xs text-slate-500 leading-relaxed font-light italic">
                      Includes 24/7 Butler Service, priority reservation at H Dining, and complimentary airport transfer.
                    </p>
                  </div>

                  <Magnetic strength={10}>
                    <Button
                      size="lg"
                      className="w-full h-18 rounded-2xl bg-[#c19e58] text-white hover:bg-[#a68748] text-lg font-medium group transition-all duration-500 shadow-xl shadow-[#c19e58]/20"
                      onClick={handleBookNow}
                    >
                      Reserve Your Stay
                      <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Magnetic>

                  <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-[0.2em]">
                    Best Rate Guaranteed
                  </p>
                </div>
              </Effect>
            </div>
          </div>
        </div>
      </section>

      {/* Description & Amenities */}
      <section className="px-4 max-w-7xl mx-auto mb-32">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-24">
          <Effect inView slide="up">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c19e58] mb-6">Experience</p>
            <h2 className="text-5xl tracking-tight font-light text-slate-950 mb-10 leading-[1.1]">
              A sanctuary of <br />
              <span className="italic font-serif">refined comfort.</span>
            </h2>
            <div className="prose prose-slate prose-lg max-w-none">
              <p className="text-slate-500 font-light leading-relaxed">
                {room.description}
              </p>
            </div>
          </Effect>

          <div>
            <Effect inView delay={100} slide="up">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mb-10">Exclusive Amenities</h3>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                {room.amenities.map((amenity, index) => (
                  <Effect
                    key={amenity}
                    inView
                    delay={index * 80}
                    slide="up"
                    className="flex items-center gap-5 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#c19e58]/30 transition-colors duration-500">
                      <Check className="w-5 h-5 text-[#c19e58]" />
                    </div>
                    <span className="text-lg font-light text-slate-800">{amenity}</span>
                  </Effect>
                ))}
              </div>
            </Effect>
          </div>
        </div>
      </section>

      {/* Recommended Rooms */}
      <section className="py-32 border-t border-slate-50 bg-[#fafafa]">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <Effect inView slide="up">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c19e58] mb-5">Explore More</p>
              <h2 className="text-5xl tracking-tight font-light text-slate-950">You may also <span className="italic font-serif">desire.</span></h2>
            </Effect>
            <Link to="/rooms">
              <Button variant="ghost" className="text-slate-500 hover:text-[#c19e58] gap-2 p-0">
                View Entire Collection
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {otherRooms.map((otherRoom, index) => (
              <Effect key={otherRoom.id} inView delay={index * 100} slide="up" className="group cursor-pointer">
                <Link to={`/rooms/${otherRoom.id}`}>
                  <div className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] mb-8 border border-slate-200 shadow-sm">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      src={otherRoom.image}
                      alt={otherRoom.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#c19e58] mb-2">{otherRoom.type}</p>
                      <h3 className="text-2xl font-light text-slate-950 leading-none">{otherRoom.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light">{formatCurrency(otherRoom.price)}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">per night</p>
                    </div>
                  </div>
                </Link>
              </Effect>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
