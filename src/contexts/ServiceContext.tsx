import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  isActive: boolean;
}

interface ServiceContextType {
  services: Service[];
  loading: boolean;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  getServiceById: (id: string) => Service | undefined;
  getActiveServices: () => Service[];
  getServicesByCategory: (category: string) => Service[];
  refreshServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Os dados iniciais agora vêm do Supabase

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar serviços do Supabase
  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar serviços:', error);
        return;
      }
      
      setServices(data || []);
    } catch (error) {
      console.error('Erro inesperado ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadServices();
  }, []);

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const newService = {
        ...serviceData,
        id: `serv_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar serviço:', error);
        throw error;
      }
      
      setServices(prev => [data, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      throw error;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const updateData = {
        ...serviceData,
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar serviço:', error);
        throw error;
      }
      
      setServices(prev => 
        prev.map(service => 
          service.id === id ? data : service
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar serviço:', error);
        throw error;
      }
      
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  };

  const getServiceById = (id: string) => {
    return services.find(service => service.id === id);
  };

  const getActiveServices = () => {
    return services.filter(service => service.isActive);
  };

  const getServicesByCategory = (category: string) => {
    return services.filter(service => service.category === category && service.isActive);
  };

  const refreshServices = async () => {
    await loadServices();
  };

  return (
    <ServiceContext.Provider value={{
      services,
      loading,
      addService,
      updateService,
      deleteService,
      getServiceById,
      getActiveServices,
      getServicesByCategory,
      refreshServices
    }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};