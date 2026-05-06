import { motion } from 'motion/react';
import { Award, Heart, Shield, Users } from 'lucide-react';
import { Parallax, ParallaxBanner } from 'react-scroll-parallax';
import { Effect } from '../../components/Effect';

export function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-24">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <ParallaxBanner
            layers={[
              {
                speed: -18,
                children: (
                  <img
                    src="https://images.unsplash.com/photo-1774192621035-20d11389f781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwbW9kZXJufGVufDF8fHx8MTc3NjE1ODEwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Hotel Lobby"
                    className="w-full h-full object-cover scale-[1.08]"
                  />
                ),
              },
              { speed: 8, children: <div className="absolute inset-0 hero-noise opacity-35" /> },
            ]}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        <Parallax speed={-8}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative z-10 text-center text-white px-4"
          >
            <h1 className="text-5xl md:text-7xl mb-6">About H Hotel</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Creating memorable Sarawak stays since 1985
            </p>
          </motion.div>
        </Parallax>
      </section>

      {/* Mission */}
      <section className="px-4 max-w-7xl mx-auto mb-24">
        <Parallax speed={-4}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
          <div>
            <h2 className="text-4xl md:text-5xl mb-6">
              Where Luxury Meets <span className="italic">Excellence</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              For nearly four decades, H Hotel has brought together riverfront charm, modern comfort,
              and warm Sarawak hospitality. Nestled beside the Kuching Waterfront, we craft memorable
              stays for travellers discovering Borneo and returning home again.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our commitment to excellence, attention to detail, and personalized service has made us
              one of the most distinctive city stays in Kuching. Every guest is treated like
              family, and every stay is designed to exceed expectations.
            </p>
          </div>
          <Parallax speed={7} className="relative">
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              src="https://images.unsplash.com/photo-1677763856232-d9eb9e127e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMHdlbGxuZXNzfGVufDF8fHx8MTc3NjE5MzMxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Spa"
              className="rounded-3xl w-full aspect-[4/5] object-cover"
            />
          </Parallax>
          </motion.div>
        </Parallax>
      </section>

      {/* Values */}
      <section className="px-4 max-w-7xl mx-auto mb-24">
        <Parallax speed={-3}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
          <h2 className="text-4xl md:text-5xl mb-4">Our Values</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
          </motion.div>
        </Parallax>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Award,
              title: 'Excellence',
              description: 'We strive for perfection in every detail, ensuring an unmatched level of quality.',
            },
            {
              icon: Heart,
              title: 'Hospitality',
              description: 'Genuine warmth and care are at the heart of everything we do for our guests.',
            },
            {
              icon: Shield,
              title: 'Integrity',
              description: 'We uphold the highest standards of honesty and ethical behavior in all interactions.',
            },
            {
              icon: Users,
              title: 'Community',
              description: 'We believe in giving back and creating positive impact in our local community.',
            },
          ].map((value, index) => (
            <Parallax key={value.title} speed={index % 2 === 0 ? 6 : -5}>
            <Effect
              inView
              delay={index * 90}
              slide="up"
              blur
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl mb-3">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </Effect>
            </Parallax>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 max-w-7xl mx-auto mb-24">
        <Parallax speed={-4}>
        <div className="bg-primary text-primary-foreground rounded-3xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '38+', label: 'Years of Excellence' },
              { value: '50K+', label: 'Happy Guests' },
              { value: '25+', label: 'Awards Won' },
              { value: '100%', label: 'Guest Satisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <p className="text-5xl mb-2">{stat.value}</p>
                <p className="opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        </Parallax>
      </section>

      {/* Team */}
      <section className="px-4 max-w-7xl mx-auto">
        <Parallax speed={-3}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
          <h2 className="text-4xl md:text-5xl mb-4">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Dedicated professionals committed to making your stay extraordinary
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our team of hospitality experts brings decades of combined experience and a genuine
            passion for service. From our concierge to our housekeeping staff, every member is
            dedicated to ensuring your comfort and satisfaction.
          </p>
          </motion.div>
        </Parallax>
      </section>
    </div>
  );
}
