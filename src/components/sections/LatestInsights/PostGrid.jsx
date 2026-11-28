import PostCard from './PostCard';
import './LatestInsights.css';

const PostGrid = ({ posts }) => (
  <div className="post-grid">
    {posts.map((post, index) => (
      <PostCard key={post.slug} post={post} index={index} />
    ))}
  </div>
);

export default PostGrid;
