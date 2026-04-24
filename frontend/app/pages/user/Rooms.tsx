import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Parallax, ParallaxBanner } from 'react-scroll-parallax';
import { Users, Maximize, ArrowRight } from 'lucide-react';
import { Effect } from '../../components/Effect';
import { Magnetic } from '../../components/Magnetic';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../components/utils';
import { hotelApi } from '../../api';
import type { Room } from '../../types';

export function Rooms() {
  const [filter, setFilter] = useState<string>('All');
  const [rooms, setRooms] = useState<Room[]>([]);
  const roomTypes = ['All', 'Standard', 'Deluxe', 'Suite', 'Penthouse'];

  useEffect(() => {
    hotelApi.getRooms()
      .then((data) => setRooms(data.rooms))
      .catch(() => setRooms([]));
  }, []);

  const filteredRooms = filter === 'All' ? rooms : rooms.filter((room) => room.type === filter);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="px-4 max-w-7xl mx-auto mb-16">
        <div className="relative overflow-hidden rounded-[2rem] min-h-[22rem] mb-12 bg-[#090d12] text-white">
          <ParallaxBanner
            layers={[
              {
                speed: -16,
                children: (
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
                    alt="Luxury suite"
                    className="w-full h-full object-cover scale-[1.06]"
                  />
                ),
              },
              { speed: 10, children: <div className="absolute inset-0 hero-noise opacity-35" /> },
            ]}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,12,0.36),rgba(7,9,12,0.72))]" />
          <Parallax speed={-7}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 text-center px-4 py-24"
            >
              <h1 className="text-5xl md:text-6xl mb-4">Our Accommodations</h1>
              <p className="text-lg text-white/78 max-w-2xl mx-auto">
                Find your perfect sanctuary from our collection of luxury rooms and suites
              </p>
            </motion.div>
          </Parallax>
        </div>

        {/* Filter Tabs */}
        <Parallax speed={-4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-3 rounded-full text-sm transition-all ${
                filter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {type}
            </button>
          ))}
          </motion.div>
        </Parallax>
      </section>

      {/* Rooms Grid */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {filteredRooms.map((room, index) => (
            <Parallax key={room.id} speed={index % 2 === 0 ? 6 : -6}>
            <Effect
              delay={index * 90}
              slide="up"
              blur
              className="group"
            >
              <Magnetic strength={9}>
              <Link to={`/rooms/${room.id}`}>
                <div className="relative overflow-hidden rounded-3xl aspect-[16/10] mb-6">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Room Type Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-sm">
                      {room.type}
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-center gap-6 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Up to {room.capacity} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize className="w-4 h-4" />
                        <span>{room.size}m2</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl mb-2">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {room.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs px-3 py-1 rounded-full bg-secondary"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-xs px-3 py-1 rounded-full bg-secondary">
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-3xl mb-1">{formatCurrency(room.price)}</p>
                    <p className="text-sm text-muted-foreground">per night</p>
                    <Button className="mt-4 gap-2">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
              </Magnetic>
            </Effect>
            </Parallax>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No rooms found in this category</p>
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="px-4 max-w-7xl mx-auto mt-24">
        <Parallax speed={-5}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary text-primary-foreground rounded-3xl p-12 text-center"
          >
          <h2 className="text-3xl md:text-4xl mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our concierge team is here to help you find the perfect accommodation
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="gap-2">
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          </motion.div>
        </Parallax>
      </section>
    </div>
  );
}
