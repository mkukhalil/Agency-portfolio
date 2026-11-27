import { useParams } from 'react-router';
import ServicePage from './ServicePage';
import NotFound from '../NotFound';
import { servicePages } from '../../data/servicePages';

const ServiceRoute = () => {
  const content = servicePages[useParams().slug];

  return content ? <ServicePage content={content} /> : <NotFound />;
};

export default ServiceRoute;
