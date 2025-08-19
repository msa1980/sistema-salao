import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Package, 
  BarChart3, 
  Gift, 
  Settings, 
  Scissors,
  CreditCard,
  Warehouse
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'appointments', icon: Calendar, label: 'Agendamentos' },
    { id: 'customers', icon: Users, label: 'Clientes' },
    { id: 'services', icon: Scissors, label: 'Serviços' },
    { id: 'inventory', icon: Warehouse, label: 'Estoque' },
    { id: 'financial', icon: CreditCard, label: 'Financeiro' },
    { id: 'reports', icon: BarChart3, label: 'Relatórios' },
    { id: 'loyalty', icon: Gift, label: 'Fidelidade' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 min-h-screen text-white">
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <Scissors className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">SalonPro</h2>
            <p className="text-purple-200 text-sm">Sistema Profissional</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 hover:bg-purple-700 ${
                activeSection === item.id ? 'bg-purple-700 border-r-4 border-white' : ''
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;