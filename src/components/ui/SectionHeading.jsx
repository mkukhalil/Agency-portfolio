import { motion } from 'framer-motion';
import { FADE_UP, VIEWPORT_CONFIG } from '../../lib/animations';
import { cn } from '../../utils/cn';

export const SectionHeading = ({ 
  title, 
  subtitle, 
  className, 
  children,
  motionProps = {},
  ...props 
}) => {
  return (
    <motion.div
      className={cn('section-header-primitive', className)}
      variants={FADE_UP}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      {...motionProps}
      {...props}
    >
      {title && <h2>{title}</h2>}
      {subtitle && <p className="section-subtitle-primitive">{subtitle}</p>}
      {children}
    </motion.div>
  );
};
