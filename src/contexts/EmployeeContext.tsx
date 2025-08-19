import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  loading: boolean;
  updateEmployee: (id: string, updatedEmployee: Partial<Employee>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getActiveEmployees: () => Employee[];
  refreshEmployees: () => Promise<void>;
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar funcionários do Supabase
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar funcionários:', error);
        return;
      }
      
      setEmployees(data || []);
    } catch (error) {
      console.error('Erro inesperado ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadEmployees();
  }, []);

  const updateEmployee = async (id: string, updatedEmployee: Partial<Employee>) => {
    try {
      const updateData = {
        ...updatedEmployee,
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar funcionário:', error);
        throw error;
      }
      
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === id ? data : emp
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const newEmployee = {
        ...employeeData,
        id: `emp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar funcionário:', error);
        throw error;
      }
      
      setEmployees(prev => [data, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar funcionário:', error);
        throw error;
      }
      
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      throw error;
    }
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.isActive);
  };

  const refreshEmployees = async () => {
    await loadEmployees();
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      loading,
      updateEmployee,
      addEmployee,
      deleteEmployee,
      getActiveEmployees,
      refreshEmployees
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};