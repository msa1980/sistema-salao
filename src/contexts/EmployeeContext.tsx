import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo: string;
  specialties: string[];
  isActive: boolean;
  hireDate: string;
  workingHours: { start: string; end: string };
}

interface EmployeeContextType {
  employees: Employee[];
  updateEmployee: (id: string, updatedEmployee: Employee) => void;
  addEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  getActiveEmployees: () => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    { 
      id: '1', 
      name: 'João Silva', 
      role: 'Cabeleireiro', 
      email: 'joao@salao.com',
      phone: '(11) 98765-4321',
      photo: '',
      specialties: ['Corte Feminino', 'Escova', 'Coloração'], 
      isActive: true,
      hireDate: '2021-01-15',
      workingHours: { start: '08:00', end: '18:00' }
    },
    { 
      id: '2', 
      name: 'Carla Oliveira', 
      role: 'Colorista', 
      email: 'carla@salao.com',
      phone: '(11) 91234-5678',
      photo: '',
      specialties: ['Coloração', 'Hidratação'], 
      isActive: true,
      hireDate: '2021-03-10',
      workingHours: { start: '09:00', end: '17:00' }
    },
    { 
      id: '3', 
      name: 'Ana Paula', 
      role: 'Manicure', 
      email: 'ana@salao.com',
      phone: '(11) 99876-5432',
      photo: '',
      specialties: ['Manicure', 'Pedicure'], 
      isActive: true,
      hireDate: '2022-05-20',
      workingHours: { start: '08:30', end: '17:30' }
    },
    { 
      id: '4', 
      name: 'Roberto Santos', 
      role: 'Cabeleireiro', 
      email: 'roberto@salao.com',
      phone: '(11) 95555-9999',
      photo: '',
      specialties: ['Corte Feminino', 'Corte Masculino'], 
      isActive: true,
      hireDate: '2020-11-05',
      workingHours: { start: '08:00', end: '18:00' }
    },
  ]);

  const updateEmployee = (id: string, updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
  };

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.isActive);
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      updateEmployee,
      addEmployee,
      deleteEmployee,
      getActiveEmployees
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};