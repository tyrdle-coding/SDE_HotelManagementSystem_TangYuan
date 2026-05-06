import { Player } from '@remotion/player';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { Toaster } from '../../components/Toaster';
import { HotelIntroComposition } from '../../components/HotelIntroComposition';

export function Root() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setShowIntro(true);

    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, 5600);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="site-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="site-intro-shell"
          >
            <Player
              component={HotelIntroComposition}
              durationInFrames={150}
              fps={30}
              compositionWidth={dimensions.width}
              compositionHeight={dimensions.height}
              controls={false}
              autoPlay
              loop={false}
              clickToPlay={false}
              showVolumeControls={false}
              allowFullscreen={false}
              initiallyMuted
              onEnded={() => setShowIntro(false)}
              className="site-intro-player"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 34, scale: 1.015, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -18, filter: 'blur(10px)' }}
          transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Toaster />
    </div>
  );
}
