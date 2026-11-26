import { useParams } from 'react-router';
import PageHero from '../../components/layout/PageHero/PageHero';
import DetailSection from '../../components/sections/DetailSection/DetailSection';
import PageCta from '../../components/sections/PageCta/PageCta';
import NotFound from '../NotFound';
import { getCaseStudy } from '../../data/caseStudies';

const CaseStudy = () => {
  const { slug } = useParams();
  const study = getCaseStudy(slug);

  if (!study) return <NotFound />;

  return (
    <main>
      <PageHero
        eyebrow={`Case study · ${study.industry}`}
        title={study.title}
        intro={study.summary}
        backTo="/#projects"
        backLabel="All work"
      >
        <div className="legal-meta">
          {study.services.map((service) => (
            <span key={service} className="legal-pill">{service}</span>
          ))}
        </div>
      </PageHero>

      <DetailSection id="story" title="The project." items={study.sections} numbered />
      <PageCta title="Have a similar project?" text="Tell us what you are building and we will map out the next steps." />
    </main>
  );
};

export default CaseStudy;
