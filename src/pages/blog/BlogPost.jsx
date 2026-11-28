import { Suspense, use } from 'react';
import { useParams } from 'react-router';
import PageHero from '../../components/layout/PageHero/PageHero';
import PageCta from '../../components/sections/PageCta/PageCta';
import { seoAeo } from '../../data/seoAeo';
import NotFound from '../NotFound';
import { Markdown } from '../../lib/blog/markdown';
import { BLOG_PATH, formatPostDate, getPost, getPostBody } from '../../data/blog';
import './Blog.css';

const PostBody = ({ slug }) => <Markdown source={use(getPostBody(slug))} />;

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPost(slug);

  if (!post) return <NotFound />;

  return (
    <main>
      <PageHero
        eyebrow={`${formatPostDate(post.date)} · ${post.readingMinutes} min read`}
        title={post.title}
        intro={post.description}
        backTo={BLOG_PATH}
        backLabel="All articles"
      />

      <div className="legal-shell">
        <article className="legal-document blog-article">
          <div className="blog-article-inner legal-section">
            <Suspense fallback={null}>
              <PostBody slug={post.slug} />
            </Suspense>
          </div>
        </article>
      </div>

      <PageCta
        title="Free AI visibility check"
        text="We will check whether ChatGPT and Google mention your business, and tell you what to fix first."
        label="Get the free check"
      preset={seoAeo.freeCheck.preset}
      />
    </main>
  );
};

export default BlogPost;
