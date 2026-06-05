import { cn } from '../../utils/cn';

export const Container = ({ children, className, as: Component = 'div', ...props }) => {
  return (
    <Component className={cn('mx-auto w-full max-w-[1200px] px-5 sm:px-8', className)} {...props}>
      {children}
    </Component>
  );
};
