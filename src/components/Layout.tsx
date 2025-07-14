import React, { useEffect } from 'react';
import '../styles/main.css'; // Import the global styles
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * A responsive layout component that wraps the entire application.
 * It provides a consistent, centered content area that adapts to different screen sizes.
 * @param {LayoutProps} props The component props.
 * @param {React.ReactNode} props.children The page content to render inside the layout.
 * @returns {JSX.Element} The rendered layout component.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // This effect ensures the vertical scrollbar is always present, preventing
  // the layout from "jumping" when navigating between pages of different
  // content heights. This stabilizes the width of the viewport, and consequently
  // the Navbar's width.
  useEffect(() => {
    document.documentElement.style.overflowY = 'scroll';
    // Cleanup function to reset the style to its default when the Layout component unmounts.
    return () => {
      document.documentElement.style.overflowY = 'auto';
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  return (
    <div className="app-container">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;