import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import SiteLayout from './components/layout/SiteLayout';
import Home from './pages/Home';
import SeoAeoService from './pages/services/SeoAeoService';
import CaseStudy from './pages/work/CaseStudy';
import NotFound from './pages/NotFound';

const Terms = lazy(() => import('./pages/legal/Terms'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));

const App = () => (
  <Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<Home />} />
      <Route path="services/seo-aeo" element={<SeoAeoService />} />
      <Route path="work/:slug" element={<CaseStudy />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route path="terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
    <Route path="privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
  </Routes>
);

export default App;
