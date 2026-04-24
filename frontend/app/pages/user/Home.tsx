import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Parallax, ParallaxBanner } from 'react-scroll-parallax';
import {
  ArrowRight,
  Coffee,
  Clock3,
  Dumbbell,
  MapPin,
  Sparkles,
  Star,
  Trees,
  Waves,
  Wifi,
} from 'lucide-react';
import { Effect } from '../../components/Effect';
import { Magnetic } from '../../components/Magnetic';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../components/utils';
import { hotelApi } from '../../api';
import type { Room } from '../../types';

const amenityHighlights = [
  { icon: Wifi, title: 'High-Speed WiFi', description: 'Work, stream, and unwind on a property-wide ultra-fast network.' },
  { icon: Coffee, title: 'Chef-Led Dining', description: 'Sunrise breakfasts, rooftop cocktails, and tasting menus after dark.' },
  { icon: Dumbbell, title: 'Wellness Studio', description: 'Private coaching, recovery rooms, and a quiet fitness floor open all day.' },
  { icon: Sparkles, title: 'Spa Rituals', description: 'A slower rhythm with signature treatments and restorative wellness suites.' },
];

const experienceNotes = [
  { title: 'Waterfront arrival', value: '03 min', icon: Waves },
  { title: 'Private garden paths', value: '24/7', icon: Trees },
  { title: 'Concierge response', value: '<10 min', icon: Clock3 },
];

const testimonials = [
  { name: 'Sarah Johnson', rating: 5, text: 'Absolutely stunning. The atmosphere felt cinematic from the lobby to the suite.' },
  { name: 'Michael Chen', rating: 5, text: 'The service cadence, lighting, and room details made the whole stay feel elevated.' },
  { name: 'Emma Williams', rating: 5, text: 'One of the few hotel sites that now feels as polished as the property itself.' },
];

export function Home() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroGlowOpacity = useTransform(scrollYProgress, [0, 0.7], [0.9, 0.25]);

  useEffect(() => {
    hotelApi.getRooms()
      .then((data) => setFeaturedRooms(data.rooms.slice(0, 3)))
      .catch(() => setFeaturedRooms([]));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#090d12] text-white"
      >
        <motion.div
          initial={{ scale: 1.08, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <ParallaxBanner
            layers={[
              {
                speed: -22,
                children: (
                  <img
                    src="https://images.unsplash.com/photo-1674382397731-0c376fbc3cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMGV4dGVyaW9yJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3NjI2NTk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Luxury Hotel"
                    className="w-full h-full object-cover scale-[1.08]"
                  />
                ),
              },
              {
                speed: -8,
                children: <div className="hero-top-radial absolute inset-0" />,
              },
              {
                speed: 12,
                children: <div className="absolute inset-0 hero-noise opacity-45" />,
              },
            ]}
            className="absolute inset-0"
          />
          <motion.div
            style={{ y: heroImageY }}
            className="hero-image-overlay absolute inset-0"
          />
        </motion.div>

        <Parallax speed={-18} className="absolute inset-x-[-12%] top-[-18%] z-[1]">
          <motion.div
            style={{ opacity: heroGlowOpacity }}
            className="h-[62vh] rounded-full bg-[radial-gradient(circle,rgba(226,186,110,0.34),rgba(226,186,110,0.08)_38%,transparent_70%)] blur-3xl"
          />
        </Parallax>
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1.18 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
        >
          <div className="hero-arrival-bloom h-[52vw] w-[52vw] max-h-[46rem] max-w-[46rem]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: '-18%' }}
          animate={{ opacity: 1, x: '18%' }}
          transition={{ delay: 0.18, duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
          className="hero-light-sweep pointer-events-none absolute inset-y-0 left-[-20%] z-[2] w-[34%]"
        />
        <Parallax speed={-10} className="absolute inset-x-0 top-0 z-[1] pointer-events-none">
          <div className="entry-canopy mx-auto h-[18vh] max-w-[72rem]" />
        </Parallax>
        <Parallax speed={8} className="absolute left-0 top-0 bottom-0 z-[2] hidden xl:block pointer-events-none">
          <div className="entry-wing entry-wing-left h-full w-[18vw]" />
        </Parallax>
        <Parallax speed={8} className="absolute right-0 top-0 bottom-0 z-[2] hidden xl:block pointer-events-none">
          <div className="entry-wing entry-wing-right h-full w-[18vw]" />
        </Parallax>
        <Parallax speed={12} className="absolute inset-x-0 bottom-[-2%] z-[2] pointer-events-none">
          <div className="entry-threshold mx-auto h-[26vh] max-w-[82rem]" />
        </Parallax>
        <div className="entry-vignette absolute inset-0 z-[2] pointer-events-none" />
        <div className="cinematic-grid absolute inset-0 opacity-30" />

        <div className="absolute inset-0 pointer-events-none z-[3]">
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
            className="hero-door-panel hero-door-panel-left origin-left absolute left-0 top-0 bottom-0 w-1/2"
          />
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
            className="hero-door-panel hero-door-panel-right origin-right absolute right-0 top-0 bottom-0 w-1/2"
          />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="hero-door-panel hero-door-panel-top origin-top absolute inset-x-0 top-0 h-1/2"
          />
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="hero-door-panel hero-door-panel-bottom origin-bottom absolute inset-x-0 bottom-0 h-1/2"
          />
        </div>

        <motion.div style={{ y: heroContentY }} className="relative z-10 w-full px-4 md:px-8 pt-28 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            <div className="grid xl:grid-cols-[1.2fr_0.72fr] gap-12 items-end">
              <Parallax speed={-6}>
                <div>
                <Effect delay={120} slide="up" blur="12px" className="flex items-center gap-3 mb-7 flex-wrap">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] tracking-[0.34em] uppercase backdrop-blur-md">
                    H Hotel Signature Stay
                  </span>
                  <div className="flex items-center gap-2 text-sm text-white/78">
                    <MapPin className="w-4 h-4" />
                    Kuching Waterfront, Sarawak
                  </div>
                </Effect>
                <div className="overflow-hidden">
                  <motion.p
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.32, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                    className="section-kicker mb-5 text-white/70"
                  >
                    A hotel experience directed like a film scene
                  </motion.p>
                </div>
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: '108%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.38, duration: 1.02, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl text-[2.8rem] leading-[0.95] sm:text-[4.8rem] lg:text-[6.8rem] xl:text-[8.1rem] tracking-[-0.055em]"
                  >
                    Stay in motion.
                    <span className="block text-[#f2d39a] italic font-light">Luxury in slow reveal.</span>
                  </motion.h1>
                </div>
                <Effect
                  delay={560}
                  slide="up"
                  blur
                  className="mt-8 max-w-2xl text-base sm:text-lg text-white/74 leading-7"
                >
                    Inspired by Sarawak riverfront charm, this experience pairs dramatic reveals,
                    layered motion, and premium pacing with real booking functionality.
                </Effect>
                <Effect
                  delay={680}
                  slide="up"
                  blur="10px"
                  className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                  <Magnetic strength={14}>
                    <Link to="/rooms">
                      <Button size="lg" className="gap-2 rounded-full bg-[#c19e58] px-10 py-7 text-white hover:bg-[#a68748] shadow-lg shadow-[#c19e58]/20 transition-all duration-500">
                        Explore Rooms
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </Magnetic>
                  <Magnetic strength={10}>
                    <Link to="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white/20 bg-white/8 px-10 py-7 text-white backdrop-blur-md hover:bg-white/14 transition-all duration-500"
                      >
                        Contact Concierge
                      </Button>
                    </Link>
                  </Magnetic>
                </Effect>
                </div>
              </Parallax>

              <Parallax speed={8}>
                <Effect delay={520} slide="left" blur="12px" className="grid gap-4">
                  <div className="hero-atmosphere-shell rounded-[2rem] p-6 md:p-7">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="section-kicker text-white/50 mb-4">Atmosphere</div>
                        <p className="max-w-md text-[1.7rem] md:text-[2.35rem] leading-[1.02] tracking-[-0.05em]">
                          Cinematic transitions, restrained luxury, and a tactile sense of arrival.
                        </p>
                      </div>
                      <div className="hero-atmosphere-rail hidden md:flex">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className="mt-8 h-px w-full bg-[linear-gradient(90deg,rgba(240,211,164,0.55),rgba(255,255,255,0.06))]" />
                  </div>
                  <div className="grid sm:grid-cols-3 xl:grid-cols-1 gap-4">
                    {experienceNotes.map((item, index) => (
                      <Effect
                        key={item.title}
                        delay={660 + index * 80}
                        slide="up"
                        blur="10px"
                        className="hero-note-card rounded-[1.6rem] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[2rem] leading-none tracking-[-0.06em] text-white">{item.value}</p>
                            <p className="mt-3 text-sm uppercase tracking-[0.26em] text-white/40">timing</p>
                          </div>
                          <div className="hero-note-icon">
                            <item.icon className="w-5 h-5 text-[#c19e58]" />
                          </div>
                        </div>
                        <p className="mt-8 text-base text-white/72">{item.title}</p>
                      </Effect>
                    ))}
                  </div>
                </Effect>
              </Parallax>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      <section className="border-t border-border/60 bg-background">
        <div className="marquee-shell">
          <Parallax speed={6}>
            <div className="marquee-track">
            {['Riverfront suites', 'Sarawak dining', 'Spa rituals', 'Waterfront arrival', 'Tailored concierge'].map((item) => (
              <span key={item} className="marquee-item">
                {item}
              </span>
            ))}
            {['Riverfront suites', 'Sarawak dining', 'Spa rituals', 'Waterfront arrival', 'Tailored concierge'].map((item, index) => (
              <span key={`${item}-${index}`} className="marquee-item">
                {item}
              </span>
            ))}
            </div>
          </Parallax>
        </div>
      </section>

      <section className="py-24 px-4 max-w-7xl mx-auto">
        <Parallax speed={-5}>
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16"
          >
            <div>
              <p className="section-kicker mb-4">Rooms in reveal</p>
              <h2 className="text-4xl md:text-6xl tracking-[-0.04em] max-w-3xl">
                Spaces that feel edited, not templated.
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl">
              Each room card now lands with more depth, stronger hierarchy, and smoother hover behavior.
            </p>
          </motion.div>
        </Parallax>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room, index) => (
            <Parallax key={room.id} speed={index % 2 === 0 ? 7 : -7}>
              <Effect
                inView
                delay={index * 110}
                slide="up"
                zoom
                blur="12px"
              >
                <Magnetic strength={10}>
                  <Link to={`/rooms/${room.id}`} className="group block">
                <div className="room-card-shell relative overflow-hidden rounded-[2rem] aspect-[4/5] mb-5">
                  <motion.img
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,16,0.06),rgba(10,12,16,0.18)_45%,rgba(10,12,16,0.78))]" />
                  <div className="absolute inset-x-5 top-5 flex items-start justify-between">
                    <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs tracking-[0.2em] uppercase text-white/88 backdrop-blur-md">
                      {room.type}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md">
                      {room.capacity} guests
                    </span>
                  </div>
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <div className="overflow-hidden">
                      <motion.p
                        initial={{ y: 14, opacity: 0.7 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + index * 0.08, duration: 0.7 }}
                        className="text-sm text-white/66 mb-2"
                      >
                        {room.type} suite • {room.size} sqm
                      </motion.p>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-2xl mb-1">{room.name}</h3>
                        <p className="text-sm text-white/66">View details -&gt;</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl">{formatCurrency(room.price)}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/54">per night</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-5 px-1">
                  <p className="text-sm text-muted-foreground max-w-[16rem] leading-6">
                    {room.description}
                  </p>
                  <ArrowRight className="w-5 h-5 mt-1 text-muted-foreground transition-transform duration-500 group-hover:translate-x-1" />
                </div>
                  </Link>
                </Magnetic>
              </Effect>
            </Parallax>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/rooms">
            <Button size="lg" variant="outline" className="gap-2 rounded-full px-8">
              View All Rooms
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24 px-4 bg-[linear-gradient(180deg,rgba(246,243,238,0.55),rgba(244,239,230,0.95))]">
        <div className="max-w-7xl mx-auto">
          <Parallax speed={-4}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start mb-16"
            >
              <div>
                <p className="section-kicker mb-4">Movement with purpose</p>
                <h2 className="text-4xl md:text-6xl tracking-[-0.045em] mb-5">
                  Transitions that feel like a guided arrival.
                </h2>
              </div>
              <p className="text-muted-foreground text-lg leading-8 max-w-2xl">
                Instead of generic micro-interactions, the page now leans into layered depth, pacing,
                editorial typography, and softer reveals inspired by luxury portfolio sites.
              </p>
            </motion.div>
          </Parallax>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenityHighlights.map((amenity, index) => (
              <Parallax key={amenity.title} speed={index % 2 === 0 ? 6 : -5}>
                <Effect
                  inView
                  delay={index * 90}
                  slide="up"
                  blur
                  className="group rounded-[2rem] border border-black/6 bg-white/72 p-8 backdrop-blur-sm shadow-[0_24px_70px_rgba(19,25,35,0.06)]"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#11161d] text-[#c19e58] mb-6 group-hover:scale-110 transition-transform duration-500">
                    <amenity.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl mb-3">{amenity.title}</h3>
                  <p className="text-sm text-muted-foreground leading-6">{amenity.description}</p>
                </Effect>
              </Parallax>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="section-kicker mb-4">Guest perspective</p>
            <h2 className="text-4xl md:text-5xl mb-4 tracking-[-0.04em]">What the experience now feels like</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 40, rotateX: -8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.75 }}
                className="p-8 rounded-[2rem] bg-secondary/40 border border-border shadow-[0_24px_70px_rgba(20,25,30,0.06)]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-6 text-foreground/90 leading-7">"{testimonial.text}"</p>
                <p className="text-sm">- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Parallax speed={-16} className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1701568129402-0d4541e3dab7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb2Z0b3AlMjBwb29sJTIwc3Vuc2V0fGVufDF8fHx8MTc3NjE5MzMxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Pool"
              className="w-full h-[120%] object-cover"
            />
          </Parallax>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,12,0.42),rgba(5,9,12,0.82))]" />
          <Parallax speed={10} className="absolute right-[12%] top-[12%] hidden lg:block">
            <div className="floating-ribbon">Slow luxury, sharp details</div>
          </Parallax>
        </div>

        <Parallax speed={-7}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center text-white max-w-4xl mx-auto pt-10 md:pt-0"
          >
          <p className="section-kicker text-white/66 mb-5 px-4">The place for you to relax</p>
          <h2 className="text-[2.6rem] md:text-7xl tracking-[-0.05em] leading-[1.1] mb-8 px-4">Ready to step into the full experience?</h2>
          <p className="text-lg md:text-xl mb-10 text-white/82 max-w-2xl mx-auto px-6">
            The landing flow now carries the same premium energy as the property. The next step is yours.
          </p>
          <Magnetic strength={14} className="mx-auto w-fit">
            <Link to="/rooms">
              <Button size="lg" className="gap-2 text-base px-10 py-7 rounded-full bg-[#c19e58] text-white hover:bg-[#a68748] shadow-lg shadow-[#c19e58]/20 transition-all duration-500">
                Book Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </Magnetic>
          </motion.div>
        </Parallax>
      </section>
    </div>
  );
}
