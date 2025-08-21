import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useEmployees } from './EmployeeContext';
import { useCustomers } from './CustomerContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  addAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointment: (id: string, updatedAppointment: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar agendamentos do Supabase
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(*),
          employee:employees(*),
          service:services(*)
        `)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return;
      }
      
      // Transformar dados do Supabase para o formato esperado
      const transformedAppointments: Appointment[] = data.map(appointment => ({
        id: appointment.id,
        customer: appointment.customer?.name || 'Cliente não encontrado',
        phone: appointment.customer?.phone || '',
        customerId: appointment.customerId,
        employeeId: appointment.employeeId,
        service: appointment.service?.name || 'Serviço não encontrado',
        services: [appointment.serviceId], // Usando serviceId como array para compatibilidade
        date: new Date(appointment.date).toISOString().split('T')[0],
        time: appointment.startTime,
        duration: appointment.service?.duration || 60,
        price: appointment.totalPrice,
        status: appointment.status.toLowerCase(),
        observations: appointment.notes
      }));
      
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadAppointments();
  }, []);

  // Função para atualizar dados do cliente baseado no agendamento
  const updateCustomerFromAppointment = (appointment: Appointment, isCompleted: boolean = false) => {
    const customer = customers.find(c => c.name === appointment.customer || c.phone === appointment.phone);
    
    if (customer) {
      // Atualizar apenas o updatedAt para registrar a atividade
      const updates: any = {
        updatedAt: new Date().toISOString()
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

  const addAppointment = async (appointment: Appointment) => {
    try {
      console.log('🔍 Iniciando addAppointment:', appointment);
      
      // Primeiro, verificar se o cliente existe ou criar um novo
      let customerId = appointment.customerId;
      console.log('📋 CustomerId inicial:', customerId);
      
      if (!customerId) {
        console.log('🔍 Buscando cliente existente pelo telefone:', appointment.phone);
        
        // Buscar cliente existente pelo telefone
        const { data: existingCustomer, error: searchError } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', appointment.phone)
          .single();
        
        console.log('📊 Resultado da busca:', { existingCustomer, searchError });
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
          console.log('✅ Cliente existente encontrado:', customerId);
        } else {
          console.log('➕ Criando novo cliente:', { name: appointment.customer, phone: appointment.phone });
          
          // Criar novo cliente
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert([{
              id: crypto.randomUUID(),
              name: appointment.customer,
              phone: appointment.phone,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }])
            .select('id')
            .single();
          
          console.log('📊 Resultado da criação:', { newCustomer, customerError });
          
          if (customerError) {
            console.error('❌ Erro ao criar cliente:', customerError);
            throw customerError;
          }
          
          customerId = newCustomer.id;
          console.log('✅ Novo cliente criado:', customerId);
        }
      }
      
      console.log('🎯 CustomerId final para agendamento:', customerId);
      
      // Buscar o primeiro serviço para usar como serviceId (compatibilidade com schema)
      const firstServiceId = appointment.services[0] || 'default-service-id';
      
      // Preparar dados para o Supabase conforme o schema
      const appointmentData = {
        id: appointment.id,
        date: new Date(appointment.date + 'T' + appointment.time).toISOString(),
        startTime: appointment.time,
        endTime: appointment.time, // Pode ser calculado baseado na duração
        status: appointment.status.toUpperCase(),
        notes: appointment.observations || null,
        totalPrice: appointment.price,
        customerId: customerId,
        employeeId: appointment.employeeId,
        serviceId: firstServiceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar agendamento:', error);
        throw error;
      }
      
      // Atualizar estado local
      setAppointments(prev => [...prev, appointment]);
      
      // Atualizar dados do cliente se o agendamento for completado
      if (appointment.status === 'completed') {
        updateCustomerFromAppointment(appointment, true);
      } else {
        updateCustomerFromAppointment(appointment, false);
      }
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updatedAppointment: Appointment) => {
    try {
      const previousAppointment = appointments.find(app => app.id === id);
      
      // Buscar o primeiro serviço para usar como serviceId (compatibilidade com schema)
      const firstServiceId = updatedAppointment.services[0] || 'default-service-id';
      
      // Preparar dados para o Supabase conforme o schema
      const updateData = {
        date: new Date(updatedAppointment.date + 'T' + updatedAppointment.time).toISOString(),
        startTime: updatedAppointment.time,
        endTime: updatedAppointment.time,
        status: updatedAppointment.status.toUpperCase(),
        notes: updatedAppointment.observations || null,
        totalPrice: updatedAppointment.price,
        employeeId: updatedAppointment.employeeId,
        serviceId: firstServiceId,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar agendamento:', error);
        throw error;
      }
      
      // Atualizar estado local
      setAppointments(prev => prev.map(app => app.id === id ? updatedAppointment : app));
      
      // Se o status mudou para 'completed', atualizar dados do cliente
      if (previousAppointment && 
          previousAppointment.status !== 'completed' && 
          updatedAppointment.status === 'completed') {
        updateCustomerFromAppointment(updatedAppointment, true);
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar agendamento:', error);
        throw error;
      }
      
      // Atualizar estado local
      setAppointments(prev => prev.filter(app => app.id !== id));
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      throw error;
    }
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