import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import SiteLayout from './components/layout/SiteLayout';
import HeadManager from './components/layout/HeadManager';
import Home from './pages/Home';
import ServiceRoute from './pages/services/ServiceRoute';
import CaseStudy from './pages/work/CaseStudy';
import NotFound from './pages/NotFound';
import BlogIndex from './pages/blog/BlogIndex';
import BlogPost from './pages/blog/BlogPost';

const Terms = lazy(() => import('./pages/legal/Terms'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));

const App = () => (
  <>
    <HeadManager />

    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="services/:slug" element={<ServiceRoute />} />
        <Route path="work/:slug" element={<CaseStudy />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
      <Route path="privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
    </Routes>
  </>
);

export default App;
