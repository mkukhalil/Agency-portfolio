import { projectCategories } from '../../../data/projects';

/** Category toggle above the work grid, styled as the project label pills. */
const ProjectFilter = ({ active, onChange }) => (
  <div className="project-filter" role="group" aria-label="Filter projects">
    {projectCategories.map((category) => (
      <button
        key={category.id}
        type="button"
        className="project-label project-filter-option"
        aria-pressed={active === category.id}
        onClick={() => onChange(category.id)}
      >
        {category.label}
      </button>
    ))}
  </div>
);

export default ProjectFilter;
