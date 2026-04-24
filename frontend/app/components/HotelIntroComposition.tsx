import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { HotelMark } from './HotelMark';

const heroImage =
  'https://images.unsplash.com/photo-1674382397731-0c376fbc3cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMGV4dGVyaW9yJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3NjI2NTk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

const brandLetters = 'LUXE'.split('');
const locationLetters = 'HOTEL'.split('');

export function HotelIntroComposition() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isMobile = width < 768;

  const logoIn = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 120,
      mass: 0.9,
    },
  });

  const morph = spring({
    frame: frame - 18,
    fps,
    config: {
      damping: 170,
      stiffness: 95,
      mass: 0.9,
    },
  });

  const cameraPush = interpolate(frame, [0, durationInFrames], [1, 1.28], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lightSweep = interpolate(frame, [0, 45, 120], [-100, 50, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const atmosphericDriftY = interpolate(frame, [0, durationInFrames], [0, -height * 0.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const outroStart = durationInFrames - 40;
  const outro = interpolate(frame, [outroStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.7, 0, 0.3, 1),
  });

  const introOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wholeScale = interpolate(outro, [0, 1], [1, 1.16]);
  const wholeOpacity = interpolate(outro, [0, 0.82, 1], [1, 1, 0]);
  const overlayOpacity = interpolate(outro, [0, 1], [1, 0.1]);

  const capsuleMaxWidth = Math.min(width * 0.9, 420);
  const capsuleMinWidth = Math.min(width * 0.25, 98);
  const capsuleWidth = interpolate(morph, [0, 1], [capsuleMinWidth, capsuleMaxWidth]);
  const capsuleRadius = interpolate(morph, [0, 1], [capsuleMinWidth / 2, 30]);
  const markTranslateX = interpolate(morph, [0, 1], [0, -capsuleMaxWidth * 0.34]);
  const markScale = interpolate(morph, [0, 1], [1, 0.72]);
  const labelOpacity = interpolate(morph, [0, 0.4, 1], [0, 0.4, 1]);
  const accentLineScale = interpolate(morph, [0.15, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [18, 42, outroStart - 10, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const circleSize = interpolate(frame, [0, 44, 96, durationInFrames], [width * 0.1, width * 0.2, width * 0.25, width * 0.3]);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        color: 'white',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        opacity: wholeOpacity,
        transform: `scale(${wholeScale})`,
      }}
    >
      <AbsoluteFill style={{ background: '#05080c' }} />

      <AbsoluteFill style={{ transform: `scale(${cameraPush}) translateY(${atmosphericDriftY}px)` }}>
        <Img
          src={heroImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at center, rgba(193,158,88,0.22), transparent 45%), linear-gradient(180deg, rgba(6,9,12,0.85), rgba(6,9,12,0.52) 40%, rgba(6,9,12,0.92))',
          opacity: overlayOpacity,
        }}
      />

      {/* Cinematic Light Sweep Overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.06) ${lightSweep - 5}%, rgba(255,255,255,0.12) ${lightSweep}%, rgba(255,255,255,0.06) ${lightSweep + 5}%, transparent 65%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.08) 0, transparent 28%), radial-gradient(circle at 85% 25%, rgba(255,255,255,0.06) 0, transparent 24%), radial-gradient(circle at 50% 75%, rgba(255,255,255,0.05) 0, transparent 32%)',
          mixBlendMode: 'screen',
          opacity: 0.55,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: introOpacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: circleSize,
            height: circleSize,
            borderRadius: 9999,
            border: '1px solid rgba(193,158,88,0.32)',
            background: 'rgba(193,158,88,0.06)',
            opacity: interpolate(frame, [0, 48, 110, durationInFrames], [0, 0.48, 0.22, 0]),
            transform: `scale(${interpolate(frame, [0, durationInFrames], [0.88, 1.45])})`,
            filter: 'blur(8px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: capsuleWidth,
            height: isMobile ? 88 : 112,
            borderRadius: capsuleRadius,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 100px -20px rgba(0,0,0,0.52)',
            backdropFilter: 'blur(28px)',
            position: 'relative',
            overflow: 'hidden',
            transform: `translateY(${interpolate(logoIn, [0, 1], [40, 0], { easing: Easing.bezier(0.22, 1, 0.36, 1) })}px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(110deg, rgba(255,255,255,0.06), transparent 40%, transparent 60%, rgba(255,255,255,0.04))',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: isMobile ? 54 : 72,
              height: isMobile ? 54 : 72,
              transform: `translate(calc(-50% + ${markTranslateX}px), -50%) scale(${markScale})`,
              transformOrigin: 'center center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: `drop-shadow(0 0 12px rgba(193,158,88,${interpolate(frame, [20, 45], [0, 0.35])}))`,
            }}
          >
            <HotelMark className="h-full w-full" />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: isMobile ? 2 : 6,
              marginLeft: isMobile ? width * 0.22 : 120,
              opacity: labelOpacity,
            }}
          >
            <div
              style={{
                fontSize: isMobile ? 32 : 48,
                fontWeight: 300,
                letterSpacing: '0.18em',
                lineHeight: 1,
                color: '#c19e58',
                fontStyle: 'italic',
                fontFamily: 'ui-serif, Georgia, serif',
              }}
            >
              HOTEL
            </div>
            <div
              style={{
                fontSize: isMobile ? 9 : 11,
                fontWeight: 600,
                letterSpacing: '0.55em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.38)',
                transform: `scaleX(${accentLineScale})`,
                transformOrigin: 'left center',
                marginLeft: 2,
              }}
            >
              Kuching Waterfront
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 220,
            textAlign: 'center',
            opacity: subtitleOpacity,
          }}
        >
            <p
              style={{
                fontSize: 12,
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.58)',
                margin: 0,
                marginBottom: 12,
              }}
            >
              H Hotel
            </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
