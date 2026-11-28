import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import { formatPostDate, getPostPath } from '../../../data/blog';

/** Blog post teaser; the whole card is one link to the post. */
const PostCard = ({ post, index = 0 }) => (
  <Card
    as={motion.article}
    className="surface-card post-card"
    variants={FADE_UP}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT_CONFIG}
    custom={{ delay: index * 0.08, y: 18 }}
  >
    <Link to={getPostPath(post.slug)} className="post-card-link">
      <p className="post-card-meta">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <span aria-hidden> · </span>
        {post.readingMinutes} min read
      </p>
      <h3>{post.title}</h3>
      <p className="post-card-description">{post.description}</p>
      <span className="post-card-more">Read article →</span>
    </Link>
  </Card>
);

export default PostCard;
