import { cn } from '../../utils/cn';

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  as: Component = 'button',
  ...props 
}) => {
  const variants = {
    primary: 'cta-button',
    nav: 'nav-cta',
    // More variants can be added here as needed
  };

  return (
    <Component 
      className={cn(variants[variant], className)} 
      {...props}
    >
      {children}
    </Component>
  );
};
