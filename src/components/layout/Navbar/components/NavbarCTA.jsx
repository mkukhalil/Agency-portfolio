import { Sparkle } from 'lucide-react';
import { openContactModal } from '../../../../utils/contact';
import { cn } from '../../../../utils/cn';

export const NavbarCTA = ({ contrast, onClick }) => {
  const handleClick = () => {
    openContactModal();
    onClick?.();
  };

  return (
    <div className="nav-right">
      <button
        type="button"
        className={cn('nav-cta', contrast && 'contrast')}
        onClick={handleClick}
        aria-haspopup="dialog"
      >
        <Sparkle className="nav-cta-icon" aria-hidden />
        Get in touch
      </button>
    </div>
  );
};