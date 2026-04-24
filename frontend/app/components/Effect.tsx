import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>;

interface EffectProps extends DivProps {
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
  delay?: number;
  blur?: boolean | string;
  fade?: boolean;
  zoom?: boolean;
  slide?: boolean | SlideDirection;
}

function getOffset(slide: EffectProps['slide']) {
  switch (slide) {
    case 'down':
      return { x: 0, y: -28 };
    case 'left':
      return { x: 28, y: 0 };
    case 'right':
      return { x: -28, y: 0 };
    case 'up':
    case true:
      return { x: 0, y: 28 };
    default:
      return { x: 0, y: 0 };
  }
}

export const Effect = forwardRef<HTMLDivElement, EffectProps>(function Effect(
  {
    children,
    className,
    delay = 0,
    inView = false,
    inViewOnce = true,
    inViewMargin = '0px 0px -10% 0px',
    blur = false,
    fade = true,
    zoom = false,
    slide = false,
    ...props
  },
  ref
) {
  const offset = getOffset(slide);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{
        opacity: fade ? 0 : 1,
        x: offset.x,
        y: offset.y,
        scale: zoom ? 0.94 : 1,
        filter: blur ? `blur(${typeof blur === 'string' ? blur : '10px'})` : 'blur(0px)',
      }}
      whileInView={inView ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' } : undefined}
      animate={!inView ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' } : undefined}
      viewport={{ once: inViewOnce, margin: inViewMargin }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
