import { lazy, Suspense, useEffect } from 'react';
import Navbar from './components/layout/Navbar/Navbar';
import Hero from './components/sections/Hero/Hero';
import About from './components/sections/About/About';
import Projects from './components/sections/Projects/Projects';
import Services from './components/sections/Services/Services';
import ToolsTicker from './components/sections/ToolsTicker/ToolsTicker';
import Trust from './components/sections/Trust/Trust';
import Pricing from './components/sections/Pricing/Pricing';
import FAQ from './components/sections/FAQ/FAQ';
import Footer from './components/layout/Footer/Footer';
import ContactModal from './components/contact/ContactModal';

const Terms = lazy(() => import('./pages/legal/Terms'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));

function App() {
  const pathname = window.location.pathname;
  const isTermsPage = pathname === '/terms';
  const isPrivacyPage = pathname === '/privacy';
  const isLegalPage = isTermsPage || isPrivacyPage;

  useEffect(() => {
    if (isLegalPage) {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      return undefined;
    }

    let cancelled = false;
    let frameId;
    let lenis;

    const startSmoothScroll = async () => {
      const { default: Lenis } = await import('lenis');

      if (cancelled) {
        return;
      }

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        frameId = requestAnimationFrame(raf);
      }

      frameId = requestAnimationFrame(raf);
    };

    startSmoothScroll();

    return () => {
      cancelled = true;

      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      lenis?.destroy();
    };
  }, [isLegalPage]);

  if (isTermsPage) {
    return (
      <Suspense fallback={null}>
        <Terms />
      </Suspense>
    );
  }

  if (isPrivacyPage) {
    return (
      <Suspense fallback={null}>
        <Privacy />
      </Suspense>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      <main>
        <Hero />
        <About />
        <Projects />
        <Trust />
        <ToolsTicker />
        <Services />
        <Pricing />
        <FAQ />
      </main>

      <Footer />

      <ContactModal />
    </div>
  );
}

export default App;
