import { scrollToTop } from '../../../../utils/scroll';
import { cn } from '../../../../utils/cn';

export const NavbarLogo = ({ contrast, onClick }) => {
  const handleClick = () => {
    scrollToTop({ onComplete: onClick });
  };

  return (
    <div className={cn('logo', contrast && 'contrast')}>
      <button
        type="button"
        className="logo-link"
        onClick={handleClick}
        aria-label="Go to top"
      >
        <svg
          className="logo-mark"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M3.6 16.8C4.2 10.1 7.5 5.7 12.1 5.7c1.7 0 2.9.8 3.6 2.1.8-1.2 1.8-2.1 3-2.1 1.4 0 2.1 1.2 1.8 3.1l-1.3 8.1h-3.3l1.1-7.2c.1-.7-.1-1-.5-1-.9 0-1.8 1.7-2.4 5.1l-.5 3.1h-3.2l1.1-7.1c.1-.8-.1-1.1-.6-1.1-1.4 0-2.8 2.7-3.3 8.2h-5Z" />
        </svg>

        <span className="logo-wordmark">nukt</span>
      </button>
    </div>
  );
};