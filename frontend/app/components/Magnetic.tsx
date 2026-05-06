import { useState, type HTMLAttributes } from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>;

interface MagneticProps extends DivProps {
  strength?: number;
}

export function Magnetic({
  children,
  className,
  strength = 18,
  onMouseLeave,
  onMouseMove,
  ...props
}: MagneticProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      className={cn(className)}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 18, mass: 0.35 }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * strength;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * strength;
        setPosition({ x, y });
        onMouseMove?.(event);
      }}
      onMouseLeave={(event) => {
        setPosition({ x: 0, y: 0 });
        onMouseLeave?.(event);
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
