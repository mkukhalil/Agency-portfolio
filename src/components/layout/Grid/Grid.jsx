import { clsx } from 'clsx';
import './Grid.css';

export function Grid({ as: Component = 'div', className, children, ...rest }) {
  return (
    <Component className={clsx('grid layout-grid', className)} {...rest}>
      {children}
    </Component>
  );
}

export function Row({ as: Component = 'div', className, children, ...rest }) {
  return (
    <Component className={clsx('flex flex-row items-center layout-row', className)} {...rest}>
      {children}
    </Component>
  );
}
