import { cn } from '../../utils/cn';

export const Card = ({ children, className, as: Component = 'div', ...props }) => {
  return (
    <Component className={cn('card-primitive', className)} {...props}>
      {children}
    </Component>
  );
};
