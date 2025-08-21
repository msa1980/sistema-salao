import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  loading: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getActiveCustomers: () => Customer[];
  searchCustomers: (term: string) => Customer[];
  refreshCustomers: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Os dados iniciais agora vêm do Supabase

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar clientes do Supabase
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar clientes:', error);
        return;
      }
      
      // Garantir que totalVisits e totalSpent sejam números válidos
      const processedData = (data || []).map(customer => ({
        ...customer,
        totalVisits: customer.totalVisits || 0,
        totalSpent: customer.totalSpent || 0
      }));
      
      setCustomers(processedData);
    } catch (error) {
      console.error('Erro inesperado ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCustomer = {
        ...customerData,
        id: `cust_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar cliente:', error);
        throw error;
      }
      
      setCustomers(prev => [data, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const updateData = {
        ...customerData,
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        throw error;
      }
      
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? data : customer
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar cliente:', error);
        throw error;
      }
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
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

  const refreshCustomers = async () => {
    await loadCustomers();
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      loading,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerById,
      getActiveCustomers,
      searchCustomers,
      refreshCustomers
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