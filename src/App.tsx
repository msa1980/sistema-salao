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
import { EmployeeProvider } from './contexts/EmployeeContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ProductProvider } from './contexts/ProductContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [salonName] = useState('Salão Beleza & Estilo');

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

  return (
    <EmployeeProvider>
        <CustomerProvider>
          <ServiceProvider>
            <ProductProvider>
              <PaymentProvider>
                <LoyaltyProvider>
                  <AppointmentProvider>
                  <div className="flex h-screen bg-gray-100">
                    <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header salonName={salonName} />
                      <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        {renderContent()}
                      </main>
                    </div>
                  </div>
                  </AppointmentProvider>
                </LoyaltyProvider>
              </PaymentProvider>
            </ProductProvider>
          </ServiceProvider>
        </CustomerProvider>
      </EmployeeProvider>
  );
}

export default App;