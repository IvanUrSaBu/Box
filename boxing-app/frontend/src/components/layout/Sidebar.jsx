import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Trophy, 
  Swords,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, logout, isGeneralAdmin, isClubAdmin, isBoxer } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['administrador_general', 'administrador_club', 'boxeador']
    },
    {
      name: 'Clubes',
      href: '/clubes',
      icon: Building,
      roles: ['administrador_general', 'administrador_club']
    },
    {
      name: 'Boxeadores',
      href: '/boxeadores',
      icon: Users,
      roles: ['administrador_general', 'administrador_club', 'boxeador']
    },
    {
      name: 'Torneos',
      href: '/torneos',
      icon: Trophy,
      roles: ['administrador_general', 'administrador_club', 'boxeador']
    },
    {
      name: 'Combates',
      href: '/combates',
      icon: Swords,
      roles: ['administrador_general', 'administrador_club', 'boxeador']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.rol)
  );

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Swords className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">BoxeoApp</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombreUsuario}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.rol?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    active ? "text-blue-700" : "text-gray-400"
                  )} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              to="/perfil"
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/perfil')
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Settings className="h-5 w-5 text-gray-400" />
              <span>Perfil</span>
            </Link>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

