import { useState } from 'react';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import { Button } from '../../ui/Button';
import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';
import { projects } from '../../../data/projects';
import { scrollToTarget } from '../../../utils/scroll';
import './Projects.css';

const COLLAPSED_COUNT = 4;

const DEFAULT_TITLE = <>Our highlights. <span>Recent work We&apos;re proud of.</span></>;
const DEFAULT_SUBTITLE =
  'We work with founders, creators, and product teams to launch digital experiences that look sharp and hold together technically.';

/**
 * Work grid. With `category` it shows only that category, in full. Otherwise it
 * adds a filter and shows the first few cards with a "See more" toggle.
 * Filtered-out and collapsed cards stay in the markup (hidden) so crawlers see
 * every project.
 */
const Projects = ({ id = 'projects', title = DEFAULT_TITLE, subtitle = DEFAULT_SUBTITLE, category }) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const isFixed = Boolean(category);
  const items = isFixed ? projects.filter((project) => project.category === category) : projects;
  const matches = (project) => filter === 'all' || project.category === filter;
  const matchCount = items.filter(matches).length;
  const canCollapse = !isFixed && matchCount > COLLAPSED_COUNT;
  const gridId = `${id}-grid`;

  const changeFilter = (next) => {
    setFilter(next);
    setExpanded(false);
  };

  const toggleExpanded = () => {
    if (expanded) scrollToTarget(id);
    setExpanded(!expanded);
  };

  let shown = 0;

  return (
    <Container as="section" id={id} className="section projects-section">
      <SectionHeading className="projects-header" title={title}>
        <div className="projects-header-copy">
          <p className="projects-subtitle">{subtitle}</p>
        </div>
      </SectionHeading>

      {!isFixed && <ProjectFilter active={filter} onChange={changeFilter} />}

      <div id={gridId} className="projects-grid">
        {items.map((project) => {
          const position = matches(project) ? shown++ : -1;
          const visible = position >= 0 && (!canCollapse || expanded || position < COLLAPSED_COUNT);

          return (
            <ProjectCard
              key={project.id}
              project={project}
              index={Math.max(position, 0) % COLLAPSED_COUNT}
              hidden={!visible}
            />
          );
        })}
      </div>

      {canCollapse && (
        <div className="projects-more">
          <Button type="button" aria-expanded={expanded} aria-controls={gridId} onClick={toggleExpanded}>
            {expanded ? 'Show less' : 'See more projects'}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Projects;
