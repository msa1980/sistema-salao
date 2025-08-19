import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  lastVisit?: string;
  totalVisits: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  preferences?: string[];
}

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getActiveCustomers: () => Customer[];
  searchCustomers: (term: string) => Customer[];
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1985-03-15',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    notes: 'Prefere horários pela manhã',
    createdAt: '2024-01-15',
    lastVisit: '2024-12-15',
    totalVisits: 12,
    totalSpent: 850.00,
    status: 'active',
    preferences: ['Corte', 'Escova']
  },
  {
    id: '2',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 88888-8888',
    birthDate: '1990-07-22',
    address: 'Av. Paulista, 456 - São Paulo, SP',
    notes: 'Alérgica a produtos com amônia',
    createdAt: '2024-02-10',
    lastVisit: '2024-12-10',
    totalVisits: 8,
    totalSpent: 640.00,
    status: 'active',
    preferences: ['Coloração', 'Hidratação']
  },
  {
    id: '3',
    name: 'Julia Santos',
    email: 'julia.santos@email.com',
    phone: '(11) 77777-7777',
    birthDate: '1988-11-08',
    address: 'Rua Augusta, 789 - São Paulo, SP',
    notes: 'Cliente VIP - desconto especial',
    createdAt: '2024-01-05',
    lastVisit: '2024-12-12',
    totalVisits: 15,
    totalSpent: 1200.00,
    status: 'active',
    preferences: ['Manicure', 'Pedicure', 'Design de Sobrancelhas']
  },
  {
    id: '4',
    name: 'Carla Lima',
    email: 'carla.lima@email.com',
    phone: '(11) 66666-6666',
    birthDate: '1992-05-30',
    address: 'Rua Oscar Freire, 321 - São Paulo, SP',
    notes: 'Prefere produtos naturais',
    createdAt: '2024-03-20',
    lastVisit: '2024-12-08',
    totalVisits: 6,
    totalSpent: 420.00,
    status: 'active',
    preferences: ['Hidratação', 'Tratamentos Capilares']
  },
  {
    id: '5',
    name: 'Fernanda Oliveira',
    email: 'fernanda.oliveira@email.com',
    phone: '(11) 55555-5555',
    birthDate: '1987-12-03',
    address: 'Rua Consolação, 654 - São Paulo, SP',
    notes: 'Cancelou últimos agendamentos',
    createdAt: '2024-01-30',
    lastVisit: '2024-10-15',
    totalVisits: 4,
    totalSpent: 280.00,
    status: 'inactive',
    preferences: ['Corte', 'Coloração']
  }
];

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      totalVisits: 0,
      totalSpent: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === id ? { ...customer, ...customerData } : customer
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const getActiveCustomers = () => {
    return customers.filter(customer => customer.status === 'active');
  };

  const searchCustomers = (term: string) => {
    const searchTerm = term.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.phone.includes(searchTerm)
    );
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerById,
      getActiveCustomers,
      searchCustomers
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};