import { Sparkle } from 'lucide-react';
import { cn } from '../../../../utils/cn';

const openContactModal = () => {
  window.dispatchEvent(new Event('open-contact-modal'));
};

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