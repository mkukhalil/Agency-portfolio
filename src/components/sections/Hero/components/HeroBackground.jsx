const HERO_IFRAME_SANDBOX =
  'allow-same-origin allow-scripts allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-storage-access-by-user-activation allow-top-navigation-by-user-activation';

export const HeroBackground = () => (
  <div className="hero__gradient">
    <iframe
      src="https://gradientshader-nine.vercel.app/"
      title="Hero background gradient"
      loading="lazy"
      fetchPriority="auto"
      referrerPolicy="no-referrer"
      sandbox={HERO_IFRAME_SANDBOX}
    />
  </div>
);
