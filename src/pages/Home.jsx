import Hero from '../components/sections/Hero/Hero';
import About from '../components/sections/About/About';
import Projects from '../components/sections/Projects/Projects';
import Services from '../components/sections/Services/Services';
import ToolsTicker from '../components/sections/ToolsTicker/ToolsTicker';
import Trust from '../components/sections/Trust/Trust';
import Pricing from '../components/sections/Pricing/Pricing';
import LatestInsights from '../components/sections/LatestInsights/LatestInsights';
import FAQ from '../components/sections/FAQ/FAQ';

const Home = () => (
  <main>
    <Hero />
    <About />
    <Projects />
    <Trust />
    <ToolsTicker />
    <Services />
    <Pricing />
    <LatestInsights />
    <FAQ />
  </main>
);

export default Home;
