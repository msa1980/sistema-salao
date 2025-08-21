import React, { useState, useEffect } from 'react';
import { useEmployees } from '../contexts/EmployeeContext';
import { useServices } from '../contexts/ServiceContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Calendar, Clock, User, Scissors, CheckCircle } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const { employees } = useEmployees();
  const { services } = useServices();
  const { addAppointment, getAppointmentsByEmployee } = useAppointments();
  const { user, isAuthenticated } = useAuth();

  const [appointmentForm, setAppointmentForm] = useState({
    customer: isAuthenticated && user ? user.name : '',
    phone: '',
    employeeId: '',
    date: '',
    time: '',
    selectedServices: [] as string[],
    observations: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Gerar horários disponíveis (9h às 18h, intervalos de 30min)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Verificar se um horário está disponível
  const isSlotAvailable = (date: string, time: string, employeeId: string) => {
    if (!employeeId) return true;
    
    const employeeAppointments = getAppointmentsByEmployee(employeeId);
    const conflictingAppointment = employeeAppointments.find(apt => 
      apt.date === date && apt.time === time && apt.status !== 'cancelled'
    );
    
    return !conflictingAppointment;
  };

  // Atualizar horários disponíveis quando funcionário ou data mudam
  useEffect(() => {
    if (appointmentForm.employeeId && appointmentForm.date) {
      const allSlots = generateTimeSlots();
      const available = allSlots.filter(slot => 
        isSlotAvailable(appointmentForm.date, slot, appointmentForm.employeeId)
      );
      setAvailableSlots(available);
    } else {
      setAvailableSlots(generateTimeSlots());
    }
  }, [appointmentForm.employeeId, appointmentForm.date]);

  // Submeter agendamento
  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.customer || !appointmentForm.phone || !appointmentForm.employeeId || 
        !appointmentForm.date || !appointmentForm.time || appointmentForm.selectedServices.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedServiceObjects = services.filter(service => 
        appointmentForm.selectedServices.includes(service.id)
      );
      
      const totalPrice = selectedServiceObjects.reduce((sum, service) => sum + service.price, 0);
      const totalDuration = selectedServiceObjects.reduce((sum, service) => sum + service.duration, 0);
      const serviceNames = selectedServiceObjects.map(service => service.name).join(', ');
      
      const newAppointment = {
        id: Date.now().toString(),
        customer: appointmentForm.customer,
        phone: appointmentForm.phone,
        customerId: undefined, // Deixar undefined para criação automática do cliente
        employeeId: appointmentForm.employeeId,
        date: appointmentForm.date,
        time: appointmentForm.time,
        service: serviceNames,
        services: appointmentForm.selectedServices,
        duration: totalDuration,
        price: totalPrice,
        status: 'scheduled' as const,
        observations: appointmentForm.observations
      };
      
      await addAppointment(newAppointment);
      setSubmitSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setAppointmentForm({
          customer: '',
          phone: '',
          employeeId: '',
          date: '',
          time: '',
          selectedServices: [],
          observations: ''
        });
        setSubmitSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternar seleção de serviços
  const handleServiceToggle = (serviceId: string) => {
    setAppointmentForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  // Obter data mínima (hoje)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Calcular preço total
  const getTotalPrice = () => {
    return services
      .filter(service => appointmentForm.selectedServices.includes(service.id))
      .reduce((sum, service) => sum + service.price, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span>Agendar Horário</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Agendamento Realizado!</h3>
              <p className="text-gray-600">Seu horário foi agendado com sucesso. Em breve entraremos em contato.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAppointment} className="space-y-6">
              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={appointmentForm.customer}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, customer: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={appointmentForm.phone}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              {/* Seleção de Profissional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Escolha o Profissional *
                </label>
                <select
                  value={appointmentForm.employeeId}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, employeeId: e.target.value, time: '' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {employees.filter(emp => emp.isActive).map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data *
                  </label>
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value, time: '' }))}
                    min={getMinDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Horário *
                  </label>
                  <select
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    disabled={!appointmentForm.employeeId || !appointmentForm.date}
                  >
                    <option value="">Selecione um horário</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  {appointmentForm.employeeId && appointmentForm.date && availableSlots.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">Nenhum horário disponível para esta data</p>
                  )}
                </div>
              </div>

              {/* Seleção de Serviços */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Scissors className="w-4 h-4 inline mr-1" />
                  Escolha os Serviços *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.filter(service => service.isActive).map(service => (
                    <label key={service.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appointmentForm.selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          R$ {service.price.toFixed(2)} • {service.duration}min
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {appointmentForm.selectedServices.length > 0 && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900">
                      Total: R$ {getTotalPrice().toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={appointmentForm.observations}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Alguma observação especial?"
                />
              </div>

              {/* Botão de Submissão */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || appointmentForm.selectedServices.length === 0}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;