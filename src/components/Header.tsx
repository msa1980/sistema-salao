import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSalon } from '../contexts/SalonContext';

interface HeaderProps {
  salonName: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'appointment' | 'stock' | 'system';
  read: boolean;
  timestamp: Date;
}

const Header: React.FC<HeaderProps> = ({ salonName }) => {
  const { logout } = useAuth();
  const { salonSettings } = useSalon();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Agendamento confirmado: Maria Silva às 09:00',
      type: 'appointment',
      read: false,
      timestamp: new Date(new Date().setHours(new Date().getHours() - 1))
    },
    {
      id: '2',
      message: 'Estoque baixo: Shampoo Reparador (2 unidades)',
      type: 'stock',
      read: false,
      timestamp: new Date(new Date().setHours(new Date().getHours() - 3))
    },
    {
      id: '3',
      message: 'Lembrete: 3 agendamentos amanhã',
      type: 'appointment',
      read: false,
      timestamp: new Date(new Date().setHours(new Date().getHours() - 5))
    }
  ]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{salonName}</h1>
          <p className="text-gray-600">Sistema de Gestão Profissional</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <h3 className="font-medium text-gray-900">Notificações</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-800"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-purple-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-purple-600 hover:text-purple-800"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Nenhuma notificação
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative" ref={userMenuRef}>
            <button 
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {salonSettings.logo ? (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    src={salonSettings.logo} 
                    alt="Logo do Salão" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-medium text-gray-900">Admin</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
                <button 
                  onClick={async () => {
                    await logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;