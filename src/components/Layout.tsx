
import { useAppContext } from '@/lib/app-context';
import Sidebar from './Sidebar';
import AudioPlayer from './AudioPlayer';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar, currentSound } = useAppContext();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 md:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : ''
        } p-6 mt-12 md:mt-0 pb-28`}
      >
        {children}
      </main>

      {/* Audio player */}
      {currentSound && <AudioPlayer />}

      {/* Overlay for closing sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
