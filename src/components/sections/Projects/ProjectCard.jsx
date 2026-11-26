import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';

const isExternal = (link) => link.startsWith('http');

/** Work card with thumbnail, hover CTA, and summary. `hidden` keeps it in the DOM. */
const ProjectCard = ({ project, index, hidden = false }) => (
  <Card
    as={motion.article}
    className={`project-card group project-card-${project.accent}`}
    hidden={hidden}
    variants={FADE_UP}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT_CONFIG}
    custom={{ delay: index * 0.1, duration: 0.5, y: 30 }}
  >
    <div className="project-image-placeholder">
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
          target={isExternal(project.link) ? '_blank' : undefined}
          rel={isExternal(project.link) ? 'noreferrer' : undefined}
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
          {project.description && <p className="project-description">{project.description}</p>}
        </div>
      </div>
    </div>
  </Card>
);

export default ProjectCard;
