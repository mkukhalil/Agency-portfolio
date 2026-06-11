import { useRef } from 'react';
import { HeroBackground } from './components/HeroBackground';
import { HeroMask } from './components/HeroMask';
import { HeroMeta } from './components/HeroMeta';
import { HeroTitle } from './components/HeroTitle';
import './Hero.css';

export function Hero() {
  const sectionRef = useRef(null);

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <HeroMask />
      <HeroBackground />

      <div className="hero__shell">
        <div className="hero__grid">
          <HeroMeta />
          <HeroTitle />
        </div>
      </div>
    </section>
  );
}

export default Hero;