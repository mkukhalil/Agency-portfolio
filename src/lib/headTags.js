import { SITE } from '../data/seo';
import { getStructuredData, serializeJsonLd } from './structuredData';

/**
 * Head tags as plain descriptors, shared by the prerender script (HTML string)
 * and HeadManager (live DOM updates). Every tag carries data-head so it can be
 * found and replaced on client-side navigation.
 */
export function getHeadTags(meta) {
  const tags = [
    { tag: 'meta', attrs: { name: 'description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'robots', content: meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' } },
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: SITE.name } },
    { tag: 'meta', attrs: { property: 'og:locale', content: SITE.locale } },
    { tag: 'meta', attrs: { property: 'og:title', content: meta.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: meta.description } },
    { tag: 'meta', attrs: { property: 'og:image', content: meta.image } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: String(SITE.imageWidth) } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: String(SITE.imageHeight) } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: SITE.imageAlt } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: meta.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: meta.image } },
    { tag: 'meta', attrs: { name: 'twitter:image:alt', content: SITE.imageAlt } },
  ];

  if (meta.canonical) {
    tags.push(
      { tag: 'link', attrs: { rel: 'canonical', href: meta.canonical } },
      { tag: 'meta', attrs: { property: 'og:url', content: meta.canonical } },
    );
  }

  tags.push({
    tag: 'script',
    attrs: { type: 'application/ld+json' },
    content: serializeJsonLd(getStructuredData(meta)),
  });

  return tags;
}

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Serializes head metadata for prerendered HTML. */
export function renderHeadHtml(meta) {
  const tags = getHeadTags(meta).map(({ tag, attrs, content }) => {
    const attrString = Object.entries(attrs)
      .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
      .join(' ');

    return content === undefined
      ? `<${tag} data-head ${attrString} />`
      : `<${tag} data-head ${attrString}>${content}</${tag}>`;
  });

  return [`<title>${escapeHtml(meta.title)}</title>`, ...tags].join('\n  ');
}
