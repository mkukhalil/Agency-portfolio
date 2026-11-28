import { scrollToTop } from '../../../../utils/scroll';
import { cn } from '../../../../utils/cn';

const LOGO_WIDTH = 72;
const LOGO_HEIGHT = 24;

/**
 * Horizontal Nukt logo. Both colour variants are rendered and cross-faded, so
 * switching over light sections (`contrast`) never waits on an image request.
 */
export const NavbarLogo = ({ contrast, onClick }) => {
  const handleClick = () => {
    scrollToTop({ onComplete: onClick });
  };

  return (
    <div className={cn('logo', contrast && 'contrast')}>
      <button type="button" className="logo-link" onClick={handleClick}>
        <img
          className="logo-image logo-image-light"
          src="/brand/nukt-logo-horizontal-light.svg"
          alt={contrast ? '' : 'Nukt Agency'}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
        />
        <img
          className="logo-image logo-image-dark"
          src="/brand/nukt-logo-horizontal-dark.svg"
          alt={contrast ? 'Nukt Agency' : ''}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
        />
      </button>
    </div>
  );
};
