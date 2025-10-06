import React from 'react';
import { useApp } from '../context/AppContext';
import Footer from './Footer';
import Header from './Header';
import './Layout.css';
import NotificationContainer from './NotificationContainer';
import Sidebar from './Sidebar';

const Layout = ({ children, showHeader = true, showFooter = true, showSidebar = false }) => {
  const { sidebarOpen, theme } = useApp();

  return (
    <div className={`layout ${theme}`}>
      {showHeader && <Header />}
      
      <div className="layout-body">
        {showSidebar && <Sidebar isOpen={sidebarOpen} />}
        
        <main className={`main-content ${showSidebar ? 'with-sidebar' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <NotificationContainer />
          {children}
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
