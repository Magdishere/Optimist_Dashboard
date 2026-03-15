import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useAdminTheme } from '../theme/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Coffee, 
  LogOut, 
  Sun, 
  Moon,
  ShoppingCart,
  Menu,
  X,
  MapPin
} from 'lucide-react';

const AdminLayout = () => {
  const { isDarkMode, toggleDarkMode, theme } = useAdminTheme();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Products', path: '/products', icon: Coffee },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Locations', path: '/locations', icon: MapPin },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col shadow-xl transition-all duration-300 transform lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: theme.card, borderRight: `1px solid ${theme.border}` }}
      >
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-center" style={{ color: theme.primary }}>
              OPTIMIST
            </h1>
            <p className="text-[10px] text-center uppercase tracking-tighter opacity-70">
              Admin Panel
            </p>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 rounded-lg" style={{ color: theme.text }}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 group"
                style={{ 
                  backgroundColor: isActive ? theme.primary : 'transparent',
                  color: isActive ? theme.background : theme.text
                }}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: theme.border }}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header 
          className="h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm transition-colors duration-300"
          style={{ backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 p-2 rounded-lg lg:hidden"
              style={{ color: theme.text, backgroundColor: theme.surface }}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg lg:text-xl font-bold truncate max-w-[150px] sm:max-w-none" style={{ color: theme.text }}>
              {menuItems.find(m => m.path === location.pathname)?.name || 'Admin'}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full transition-colors"
              style={{ backgroundColor: theme.surface }}
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} style={{ color: theme.text }} />}
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm sm:text-base"
                style={{ backgroundColor: theme.primary }}
              >
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-bold leading-tight" style={{ color: theme.text }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] sm:text-xs opacity-60 uppercase font-semibold">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;