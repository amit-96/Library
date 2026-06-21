import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Dynamic header */}
        <Header title={title} />

        {/* Dynamic content wrapper */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
