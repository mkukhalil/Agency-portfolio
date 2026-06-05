import { useRef } from 'react';
import { Grid } from '../../layout/Grid';
import { Container } from '../../ui/Container';
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

      <Container className="hero__shell container">
        <Grid className="hero__grid">
          <HeroMeta />
          <HeroTitle />
        </Grid>
      </Container>
    </section>
  );
}

export default Hero;
