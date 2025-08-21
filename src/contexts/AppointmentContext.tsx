import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useEmployees } from './EmployeeContext';
import { useCustomers } from './CustomerContext';

interface Appointment {
  id: string;
  customer: string;
  service: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  phone: string;
  date: string;
  price: number;
  services: string[];
  employeeId: string;
  customerId?: string;
}

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updatedAppointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByEmployee: (employeeId: string) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { employees } = useEmployees();
  const { updateCustomer, getCustomerById, customers } = useCustomers();
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', customer: 'Maria Silva', service: 'Corte + Escova', time: '09:00', duration: 60, status: 'confirmed', phone: '(11) 99999-9999', date: new Date().toISOString().split('T')[0], price: 75, services: ['1', '3'], employeeId: '1' },
    { id: '2', customer: 'Ana Costa', service: 'Coloração', time: '10:30', duration: 120, status: 'scheduled', phone: '(11) 88888-8888', date: new Date().toISOString().split('T')[0], price: 120, services: ['2'], employeeId: '2' },
    { id: '3', customer: 'Julia Santos', service: 'Manicure', time: '14:00', duration: 45, status: 'confirmed', phone: '(11) 77777-7777', date: new Date().toISOString().split('T')[0], price: 25, services: ['5'], employeeId: '3' },
    { id: '4', customer: 'Carla Lima', service: 'Hidratação', time: '15:30', duration: 90, status: 'completed', phone: '(11) 66666-6666', date: new Date().toISOString().split('T')[0], price: 60, services: ['4'], employeeId: '1' },
  ]);

  // Função para atualizar dados do cliente baseado no agendamento
  const updateCustomerFromAppointment = (appointment: Appointment, isCompleted: boolean = false) => {
    const customer = customers.find(c => c.name === appointment.customer || c.phone === appointment.phone);
    
    if (customer) {
      const updates: any = {
        lastVisit: appointment.date
      };
      
      updateCustomer(customer.id, updates);
    }
  };

  // Sincronizar agendamentos quando funcionários são modificados
  useEffect(() => {
    const activeEmployeeIds = employees.filter(emp => emp.isActive).map(emp => emp.id);
    
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => {
        // Se o funcionário do agendamento não está mais ativo, marcar como não atribuído
        if (!activeEmployeeIds.includes(appointment.employeeId)) {
          return {
            ...appointment,
            employeeId: '', // Remover atribuição
            status: 'scheduled' as const // Voltar para agendado para reatribuição
          };
        }
        return appointment;
      })
    );
  }, [employees]);

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
    
    // Atualizar dados do cliente se o agendamento for completado
    if (appointment.status === 'completed') {
      updateCustomerFromAppointment(appointment, true);
    } else {
      updateCustomerFromAppointment(appointment, false);
    }
  };

  const updateAppointment = (id: string, updatedAppointment: Appointment) => {
    const previousAppointment = appointments.find(app => app.id === id);
    
    setAppointments(prev => prev.map(app => app.id === id ? updatedAppointment : app));
    
    // Se o status mudou para 'completed', atualizar dados do cliente
    if (previousAppointment && 
        previousAppointment.status !== 'completed' && 
        updatedAppointment.status === 'completed') {
      updateCustomerFromAppointment(updatedAppointment, true);
    }
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(app => app.date === date);
  };

  const getAppointmentsByEmployee = (employeeId: string) => {
    return appointments.filter(app => app.employeeId === employeeId);
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentsByDate,
      getAppointmentsByEmployee
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};