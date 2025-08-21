import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Financial from './pages/Financial';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Loyalty from './pages/Loyalty';
import Customers from './pages/Customers';
import AuthPage from './components/AuthPage';
import PublicDashboard from './pages/PublicDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SalonProvider, useSalon } from './contexts/SalonContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ProductProvider } from './contexts/ProductContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';

// Componente interno que usa o contexto de autenticação
const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { salonSettings } = useSalon();
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <Appointments />;
      case 'services':
        return <Services />;
      case 'financial':
        return <Financial />;
      case 'settings':
        return <Settings />;
      case 'customers':
        return <Customers />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'loyalty':
        return <Loyalty />;
      default:
        return <Dashboard />;
    }
  };

  // Se ainda está carregando, não renderiza nada (ProtectedRoute vai mostrar loading)
  if (loading) {
    return null;
  }

  // Se não está autenticado, mostra tela de login
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Se está autenticado mas não é admin, mostra dashboard público
  if (isAuthenticated && !isAdmin) {
    return <PublicDashboard />;
  }

  // Se é admin, mostra o sistema completo
  return (
    <EmployeeProvider>
      <CustomerProvider>
        <ServiceProvider>
          <ProductProvider>
            <PaymentProvider>
              <LoyaltyProvider>
                <AppointmentProvider>
                  <ProtectedRoute requireAdmin={true}>
                    <div className="flex h-screen bg-gray-100">
                      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Header salonName={salonSettings.name} />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto">
                          {renderContent()}
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                </AppointmentProvider>
              </LoyaltyProvider>
            </PaymentProvider>
          </ProductProvider>
        </ServiceProvider>
      </CustomerProvider>
    </EmployeeProvider>
  );
};

// Componente principal que fornece o contexto de autenticação
function App() {
  return (
    <AuthProvider>
      <SalonProvider>
        <EmployeeProvider>
          <CustomerProvider>
            <ServiceProvider>
              <ProductProvider>
                <AppointmentProvider>
                  <PaymentProvider>
                    <LoyaltyProvider>
                      <AppContent />
                    </LoyaltyProvider>
                  </PaymentProvider>
                </AppointmentProvider>
              </ProductProvider>
            </ServiceProvider>
          </CustomerProvider>
        </EmployeeProvider>
      </SalonProvider>
    </AuthProvider>
  );
}

export default App;