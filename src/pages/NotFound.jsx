import PageHero from '../components/layout/PageHero/PageHero';

const NotFound = () => (
  <main>
    <PageHero
      eyebrow="404"
      title="Page not found."
      intro="The page you are looking for does not exist or has moved. Head back home to see our work and services."
    />
    <div className="section-tight" aria-hidden />
  </main>
);

export default NotFound;
