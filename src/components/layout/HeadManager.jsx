import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getPageMeta } from '../../lib/pageMeta';
import { getHeadTags } from '../../lib/headTags';

/** Keeps <head> in sync with the route after client-side navigation. */
const HeadManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = meta.title;

    document.head.querySelectorAll('[data-head]').forEach((node) => node.remove());

    getHeadTags(meta).forEach(({ tag, attrs }) => {
      const node = document.createElement(tag);
      node.setAttribute('data-head', '');
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      document.head.appendChild(node);
    });
  }, [pathname]);

  return null;
};

export default HeadManager;
