import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServiceById: (id: string) => Service | undefined;
  getActiveServices: () => Service[];
  getServicesByCategory: (category: string) => Service[];
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const initialServices: Service[] = [
  { id: '1', name: 'Corte Feminino', category: 'Cabelo', price: 45, duration: 60, description: 'Corte moderno com acabamento profissional', isActive: true },
  { id: '2', name: 'Coloração', category: 'Cabelo', price: 120, duration: 120, description: 'Coloração completa com produtos premium', isActive: true },
  { id: '3', name: 'Escova', category: 'Cabelo', price: 30, duration: 45, description: 'Escova modeladora com finalização', isActive: true },
  { id: '4', name: 'Hidratação', category: 'Cabelo', price: 60, duration: 90, description: 'Tratamento hidratante intensivo', isActive: true },
  { id: '5', name: 'Manicure', category: 'Unhas', price: 25, duration: 45, description: 'Cuidado completo das unhas das mãos', isActive: true },
  { id: '6', name: 'Pedicure', category: 'Unhas', price: 30, duration: 60, description: 'Cuidado completo das unhas dos pés', isActive: true },
  { id: '7', name: 'Depilação Perna', category: 'Depilação', price: 40, duration: 45, description: 'Depilação completa das pernas', isActive: true },
  { id: '8', name: 'Sobrancelha', category: 'Design', price: 20, duration: 30, description: 'Design e modelagem de sobrancelhas', isActive: true },
];

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(initialServices);

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString()
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id ? { ...service, ...serviceData } : service
      )
    );
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
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

  return (
    <ServiceContext.Provider value={{
      services,
      addService,
      updateService,
      deleteService,
      getServiceById,
      getActiveServices,
      getServicesByCategory
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