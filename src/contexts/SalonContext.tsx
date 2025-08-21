import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SalonSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  workingHours: {
    start: string;
    end: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
}

export interface SalonContextType {
  salonSettings: SalonSettings;
  updateSalonSettings: (settings: Partial<SalonSettings>) => void;
  loading: boolean;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};

interface SalonProviderProps {
  children: ReactNode;
}

export const SalonProvider: React.FC<SalonProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [salonSettings, setSalonSettings] = useState<SalonSettings>({
    name: 'Salão Beleza & Estilo',
    logo: '',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-9999',
    email: 'contato@salaobelleza.com',
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    socialMedia: {
      instagram: '@salaobelleza',
      facebook: 'Salão Belleza',
      whatsapp: '11999999999'
    }
  });

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedSettings = localStorage.getItem('salon_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSalonSettings(parsedSettings);
      } catch (error) {
        console.error('Erro ao carregar configurações do salão:', error);
      }
    }
  }, []);

  const updateSalonSettings = (newSettings: Partial<SalonSettings>) => {
    setLoading(true);
    try {
      const updatedSettings = { ...salonSettings, ...newSettings };
      setSalonSettings(updatedSettings);
      
      // Salvar no localStorage
      localStorage.setItem('salon_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações do salão:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: SalonContextType = {
    salonSettings,
    updateSalonSettings,
    loading
  };

  return (
    <SalonContext.Provider value={value}>
      {children}
    </SalonContext.Provider>
  );
};