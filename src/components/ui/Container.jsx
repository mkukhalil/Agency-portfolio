import { cn } from '../../utils/cn';

export const Container = ({ children, className, as: Component = 'div', ...props }) => {
  return (
    <Component className={cn('site-container', className)} {...props}>
      {children}
    </Component>
  );
};
