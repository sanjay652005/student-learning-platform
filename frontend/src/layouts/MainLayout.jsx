import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      {/* Navbar appears on all pages */}
      <Navbar />

      {/* This renders the current page component */}
      <Outlet />
    </div>
  );
};

export default MainLayout;
