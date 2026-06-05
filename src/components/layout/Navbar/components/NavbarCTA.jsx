import { Sparkle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { cn } from '../../../../utils/cn';

export const NavbarCTA = ({ contrast }) => {
  return (
    <div className="nav-right">
      <Button 
        as="a" 
        href="#contact" 
        variant="nav" 
        className={cn(contrast && 'contrast')}
      >
        <Sparkle className="nav-cta-icon" aria-hidden />
        Get in touch
      </Button>
    </div>
  );
};
