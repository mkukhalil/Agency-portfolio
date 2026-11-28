import { Link } from 'react-router';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import PostGrid from './PostGrid';
import { BLOG_PATH, latestPosts } from '../../../data/blog';

/** Home teaser for the three newest posts; renders nothing until a post exists. */
const LatestInsights = () => {
  if (!latestPosts.length) return null;

  return (
    <Container as="section" id="insights" className="section-tight">
      <SectionHeading
        className="detail-heading"
        title="Latest insights"
        subtitle="Practical notes on SEO, AI search, and websites for small businesses."
        custom={{ y: 18 }}
      />
      <PostGrid posts={latestPosts} />
      <Link to={BLOG_PATH} className="post-grid-all">
        All articles →
      </Link>
    </Container>
  );
};

export default LatestInsights;
