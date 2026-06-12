import { useEffect } from 'react';
import Lenis from 'lenis';
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
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';

function App() {
  const pathname = window.location.pathname;

  if (pathname === '/terms') {
    return <Terms />;
  }

  if (pathname === '/privacy') {
    return <Privacy />;
  }
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    let frameId;

    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

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
    </div>
  );
}

export default App;
