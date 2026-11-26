import { Outlet } from 'react-router';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import ContactModal from '../contact/ContactModal';
import { useLenis } from '../../hooks/useLenis';
import { useScrollToTopOnNavigate } from '../../hooks/useScrollToTopOnNavigate';

const SiteLayout = () => {
  useLenis();
  useScrollToTopOnNavigate();

  return (
    <div className="app-container">
      <Navbar />
      <Outlet />
      <Footer />
      <ContactModal />
    </div>
  );
};

export default SiteLayout;
