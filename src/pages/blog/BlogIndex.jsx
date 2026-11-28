import { Container } from '../../components/ui/Container';
import PageHero from '../../components/layout/PageHero/PageHero';
import PageCta from '../../components/sections/PageCta/PageCta';
import { seoAeo } from '../../data/seoAeo';
import PostGrid from '../../components/sections/LatestInsights/PostGrid';
import { posts } from '../../data/blog';

const BlogIndex = () => (
  <main>
    <PageHero
      eyebrow="Blog"
      title="Insights on SEO, AI search, and websites."
      intro="Plain-English notes for small business owners on getting found on Google, ChatGPT, and AI search."
    />

    <Container as="section" className="section-tight" aria-label="Articles">
      {posts.length ? (
        <PostGrid posts={posts} />
      ) : (
        <p className="post-empty">The first articles are on their way.</p>
      )}
    </Container>

    <PageCta
      title="Want to know if AI search mentions you?"
      text="Ask for a free AI visibility check and we will see whether ChatGPT and Google mention your business."
      label="Get the free check"
      preset={seoAeo.freeCheck.preset}
    />
  </main>
);

export default BlogIndex;
