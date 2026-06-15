import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './Projects.css';

import { projects } from '../../../data/projects';

const Projects = () => {
  return (
    <Container as="section" id="projects" className="section projects-section">
      <SectionHeading
        className="projects-header"
        title={<>Our highlights. <span>Recent work We&apos;re proud of.</span></>}
      >
        <div className="projects-header-copy">
          <p className="projects-subtitle">
            We work with founders, creators, and product teams to launch digital experiences that look sharp and hold together technically.
          </p>
        </div>
      </SectionHeading>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <Card
            as={motion.article}
            key={project.id}
            className={`project-card group project-card-${project.accent}`}
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={{ delay: index * 0.1, duration: 0.5, y: 30 }}
          >
            <div className="project-image-placeholder">
              {project.image ? (
                <>
                  <img
                    src={project.image}
                    alt={`${project.title} preview`}
                    className="project-preview-image"
                    width={project.imageWidth}
                    height={project.imageHeight}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="project-image-shade" />
                </>
              ) : (
                <div className="project-mockup-frame" aria-hidden>
                  <div className="project-phone-mockup" />
                  <div className="project-mockup-bar" />
                  <div className="project-mockup-grid">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="project-mockup-line project-mockup-line-wide" />
                  <div className="project-mockup-line" />
                </div>
              )}

              <div className="project-labels">
                {project.labels.map((label) => (
                  <span key={label} className="project-label">
                    {label}
                  </span>
                ))}
              </div>

              <div className="project-hover-overlay">
                <a
                  href={project.link}
                  className="view-case-button"
                  target={project.link.startsWith('http') ? '_blank' : undefined}
                  rel={project.link.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {project.cta}
                  <ExternalLink className="project-cta-icon" aria-hidden />
                </a>
              </div>

              <div className="project-info">
                <div className="project-meta">
                  <span className="project-tags">{project.tags}</span>
                </div>

                <div>
                  <h3 className="project-title">{project.title}</h3>

                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default Projects;
