import { useState } from 'react';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';
import { projects } from '../../../data/projects';
import './Projects.css';

const DEFAULT_TITLE = <>Our highlights. <span>Recent work We&apos;re proud of.</span></>;
const DEFAULT_SUBTITLE =
  'We work with founders, creators, and product teams to launch digital experiences that look sharp and hold together technically.';

/**
 * Work grid. With `category` it shows only that category; otherwise it adds a
 * filter. Filtered-out cards stay in the markup (hidden) so crawlers see every project.
 */
const Projects = ({ id = 'projects', title = DEFAULT_TITLE, subtitle = DEFAULT_SUBTITLE, category }) => {
  const [filter, setFilter] = useState('all');
  const items = category ? projects.filter((project) => project.category === category) : projects;
  const isVisible = (project) => filter === 'all' || project.category === filter;
  let visibleIndex = 0;

  return (
    <Container as="section" id={id} className="section projects-section">
      <SectionHeading className="projects-header" title={title}>
        <div className="projects-header-copy">
          <p className="projects-subtitle">{subtitle}</p>
        </div>
      </SectionHeading>

      {!category && <ProjectFilter active={filter} onChange={setFilter} />}

      <div className="projects-grid">
        {items.map((project) => {
          const visible = isVisible(project);
          return (
            <ProjectCard
              key={project.id}
              project={project}
              index={visible ? visibleIndex++ : 0}
              hidden={!visible}
            />
          );
        })}
      </div>
    </Container>
  );
};

export default Projects;
