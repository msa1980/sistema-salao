import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, Filter, X, User, Phone, Edit, Trash2, Briefcase, ChevronDown } from 'lucide-react';
import { useEmployees } from '../contexts/EmployeeContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useCustomers } from '../contexts/CustomerContext';

const Appointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formattedDate, setFormattedDate] = useState(
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );
  
  // Função para formatar data no padrão dd/mm/yyyy
  const formatDateToBrazilian = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { appointments, addAppointment, updateAppointment, deleteAppointment, getAppointmentsByDate } = useAppointments();

  const services = [
    { id: '1', name: 'Corte Feminino', price: 45, duration: 60 },
    { id: '2', name: 'Coloração', price: 120, duration: 120 },
    { id: '3', name: 'Escova', price: 30, duration: 45 },
    { id: '4', name: 'Hidratação', price: 60, duration: 90 },
    { id: '5', name: 'Manicure', price: 25, duration: 45 },
    { id: '6', name: 'Pedicure', price: 30, duration: 60 },
  ];

  const { getActiveEmployees } = useEmployees();
  const employees = getActiveEmployees();
  const { customers, getActiveCustomers } = useCustomers();

  // Funções auxiliares para cálculo de datas
  const getWeekDates = (date: string) => {
    const currentDate = new Date(date + 'T00:00:00');
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const getMonthDates = (date: string) => {
    const currentDate = new Date(date + 'T00:00:00');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const monthDates = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      monthDates.push(date.toISOString().split('T')[0]);
    }
    return monthDates;
  };

  const getAppointmentsForPeriod = () => {
    if (viewMode === 'day') {
      return getAppointmentsByDate(selectedDate);
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(selectedDate);
      return appointments.filter(app => weekDates.includes(app.date));
    } else if (viewMode === 'month') {
      const monthDates = getMonthDates(selectedDate);
      return appointments.filter(app => monthDates.includes(app.date));
    }
    return [];
  };

  // Filtrar agendamentos pela data selecionada
  const appointmentsByDate = getAppointmentsByDate(selectedDate);
  const appointmentsForPeriod = getAppointmentsForPeriod();
  const filteredAppointments = appointmentsByDate.filter(app => 
    searchTerm === '' || app.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Agendado';
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      deleteAppointment(appointmentId);
    }
  };

  const handleSaveAppointment = (formData: any) => {
    // Calcular duração total e preço total com base nos serviços selecionados
    const selectedServicesData = formData.selectedServices.map((serviceId: string) => 
      services.find(s => s.id === serviceId)
    ).filter(Boolean);
    
    const totalDuration = selectedServicesData.reduce((sum, service) => sum + (service?.duration || 0), 0);
    const totalPrice = selectedServicesData.reduce((sum, service) => sum + (service?.price || 0), 0);
    
    // Criar string com nomes dos serviços
    const serviceNames = selectedServicesData.map(service => service?.name).join(' + ');
    
    const appointmentData = {
      id: editingAppointment?.id || Date.now().toString(),
      customer: formData.customer,
      phone: formData.phone,
      service: serviceNames,
      time: formData.time,
      date: formData.date,
      duration: totalDuration,
      status: formData.status || 'scheduled',
      price: totalPrice,
      services: formData.selectedServices,
      employeeId: formData.employeeId,
    };

    if (editingAppointment && editingAppointment.id) {
      updateAppointment(editingAppointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }
    
    setShowModal(false);
    setEditingAppointment(null);
  };

  const AppointmentModal = () => {
    const [formData, setFormData] = useState({
      customer: editingAppointment?.customer || '',
      phone: editingAppointment?.phone || '',
      customerId: editingAppointment?.customerId || '',
      selectedServices: editingAppointment?.services || [],
      time: editingAppointment?.time || '',
      date: editingAppointment?.date || selectedDate,
      status: editingAppointment?.status || 'scheduled',
      employeeId: editingAppointment?.employeeId || '',
    });
    
    // Calcular o total com base nos serviços selecionados
    const selectedServicesData = formData.selectedServices.map(serviceId => 
      services.find(s => s.id === serviceId)
    ).filter(Boolean);
    
    const totalPrice = selectedServicesData.reduce((sum, service) => sum + (service?.price || 0), 0);
    const totalDuration = selectedServicesData.reduce((sum, service) => sum + (service?.duration || 0), 0);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.customer || !formData.phone || formData.selectedServices.length === 0 || !formData.time || !formData.date || !formData.employeeId) {
        alert('Por favor, preencha todos os campos obrigatórios, selecione pelo menos um serviço e um profissional.');
        return;
      }
      handleSaveAppointment(formData);
    };
    
    const handleServiceToggle = (serviceId: string) => {
      setFormData(prev => {
        if (prev.selectedServices.includes(serviceId)) {
          return {
            ...prev,
            selectedServices: prev.selectedServices.filter(id => id !== serviceId)
          };
        } else {
          return {
            ...prev,
            selectedServices: [...prev.selectedServices, serviceId]
          };
        }
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seleção de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Cliente *
              </label>
              <div className="space-y-2">
                <select
                  value={formData.customerId || ''}
                  onChange={(e) => {
                    const customerId = e.target.value;
                    if (customerId) {
                      const selectedCustomer = customers.find(c => c.id === customerId);
                      if (selectedCustomer) {
                        setFormData(prev => ({
                          ...prev,
                          customerId: customerId,
                          customer: selectedCustomer.name,
                          phone: selectedCustomer.phone
                        }));
                      }
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        customerId: '',
                        customer: '',
                        phone: ''
                      }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecionar cliente existente ou criar novo</option>
                  {getActiveCustomers().map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
                
                {/* Campos manuais quando não há cliente selecionado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={formData.customer}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          customer: e.target.value,
                          customerId: '' // Limpar seleção quando digitar manualmente
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          phone: e.target.value,
                          customerId: '' // Limpar seleção quando digitar manualmente
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serviços *</label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {services.map(service => (
                  <div key={service.id} className="flex items-center mb-2 last:mb-0">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={formData.selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`service-${service.id}`} className="flex-1 text-sm">
                      {service.name} - R$ {service.price} ({service.duration}min)
                    </label>
                  </div>
                ))}
              </div>
              {formData.selectedServices.length === 0 && (
                <p className="text-red-500 text-xs mt-1">Selecione pelo menos um serviço</p>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold text-purple-600">R$ {totalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Duração estimada:</span>
                <span>{totalDuration} minutos</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data *
                </label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.date ? formatDateToBrazilian(formData.date) : ''}
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário *
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Profissional *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um profissional</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
              </select>
              {!formData.employeeId && (
                <p className="text-red-500 text-xs mt-1">Selecione um profissional</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {editingAppointment ? 'Atualizar' : 'Agendar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-900">Agendamentos</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleNewAppointment}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
            <button
              onClick={() => {
                setEditingAppointment({
                  time: '09:00', 
                  date: selectedDate,
                  customer: '',
                  phone: '',
                  selectedServices: [],
                  status: 'scheduled',
                  employeeId: ''
                });
                setShowModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Rápido</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setSelectedDate(newDate);
                  
                  // Atualiza a data formatada
                  const dateObj = new Date(newDate + 'T00:00:00');
                  setFormattedDate(
                    dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  );
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formatDateToBrazilian(selectedDate)}
              </div>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Agenda */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {viewMode === 'day' ? `Agenda - ${formattedDate}` : 
           viewMode === 'week' ? 'Agenda Semanal' : 'Agenda Mensal'}
        </h3>

        {viewMode === 'day' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="space-y-1">
              {timeSlots.map((time) => {
                const appointment = filteredAppointments.find(app => app.time === time);
                
                return (
                  <div key={time} className="flex items-center space-x-4 min-h-[60px]">
                    <div className="w-16 text-sm text-gray-600 font-medium">{time}</div>
                    <div className="flex-1">
                    {appointment ? (
                      <div className={`p-3 rounded-lg border-2 ${getStatusColor(appointment.status)} hover:shadow-md transition-all cursor-pointer group`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{appointment.customer}</p>
                            <p className="text-sm opacity-75">{appointment.service}</p>
                            <p className="text-xs opacity-60">{appointment.phone}</p>
                            <p className="text-xs text-purple-600">
                              <Briefcase className="w-3 h-3 inline mr-1" />
                              {employees.find(emp => emp.id === appointment.employeeId)?.name || 'Não atribuído'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right mr-2">
                              <div className="flex items-center text-xs opacity-60">
                                <Clock className="w-3 h-3 mr-1" />
                                {appointment.duration}min
                              </div>
                              <div className="text-xs font-medium">
                                R$ {appointment.price}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Cancelar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          // Inicializa com valores padrão para um novo agendamento
                          setEditingAppointment({
                            time, 
                            date: selectedDate,
                            customer: '',
                            phone: '',
                            selectedServices: [],
                            status: 'scheduled'
                          });
                          setShowModal(true);
                        }}
                        className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 hover:border-purple-300 hover:text-purple-500 cursor-pointer transition-all"
                      >
                        <span className="text-sm">Horário disponível - Clique para agendar</span>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo do Dia */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">Resumo do Dia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{filteredAppointments.length}</p>
                    <p className="text-sm text-gray-600">Agendamentos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {filteredAppointments.reduce((sum, app) => sum + app.price, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Faturamento</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Próximos Agendamentos</h4>
                <div className="space-y-3">
                  {filteredAppointments
                    .filter(app => app.status !== 'completed' && app.status !== 'cancelled')
                    .slice(0, 3)
                    .map((appointment) => (
                    <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{appointment.customer}</p>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <p className="text-xs text-purple-600">
                            <Briefcase className="w-3 h-3 inline mr-1" />
                            {employees.find(emp => emp.id === appointment.employeeId)?.name || 'Não atribuído'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-purple-600">{appointment.time}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredAppointments.filter(app => app.status !== 'completed' && app.status !== 'cancelled').length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum agendamento pendente para este dia</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualização Semanal */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {getWeekDates(selectedDate).map((date, index) => {
                const dayAppointments = appointments.filter(app => app.date === date && 
                  (searchTerm === '' || app.customer.toLowerCase().includes(searchTerm.toLowerCase())));
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const isToday = date === new Date().toISOString().split('T')[0];
                const isSelected = date === selectedDate;
                
                return (
                  <div key={date} className={`border rounded-lg p-3 min-h-[200px] ${
                    isToday ? 'border-purple-500 bg-purple-50' : 
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="text-center mb-2">
                      <p className="text-xs font-medium text-gray-600">{dayNames[index]}</p>
                      <p className={`text-sm font-bold ${
                        isToday ? 'text-purple-600' : 
                        isSelected ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {new Date(date + 'T00:00:00').getDate()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.map((appointment) => (
                        <div key={appointment.id} 
                             className={`p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all ${
                               getStatusColor(appointment.status)
                             }`}
                             onClick={() => {
                               setSelectedDate(date);
                               setViewMode('day');
                             }}>
                          <p className="font-medium truncate">{appointment.customer}</p>
                          <p className="text-xs opacity-75">{appointment.time}</p>
                          <p className="text-xs opacity-60 truncate">{appointment.service}</p>
                        </div>
                      ))}
                      {dayAppointments.length === 0 && (
                        <div 
                          className="p-2 border border-dashed border-gray-300 rounded text-center text-gray-400 cursor-pointer hover:border-purple-300 hover:text-purple-500 transition-all"
                          onClick={() => {
                            setSelectedDate(date);
                            setEditingAppointment({
                              time: '09:00', 
                              date: date,
                              customer: '',
                              phone: '',
                              selectedServices: [],
                              status: 'scheduled',
                              employeeId: ''
                            });
                            setShowModal(true);
                          }}
                        >
                          <span className="text-xs">+</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Resumo da Semana */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">Resumo da Semana</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{appointmentsForPeriod.length}</p>
                  <p className="text-sm text-gray-600">Agendamentos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {appointmentsForPeriod.reduce((sum, app) => sum + app.price, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Faturamento</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {appointmentsForPeriod.filter(app => app.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Concluídos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualização Mensal */}
        {viewMode === 'month' && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1">
              {/* Cabeçalho dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
                  {day}
                </div>
              ))}
              
              {/* Dias do mês */}
              {(() => {
                const currentDate = new Date(selectedDate + 'T00:00:00');
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                
                const calendarDays = [];
                for (let i = 0; i < 42; i++) {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + i);
                  const dateString = date.toISOString().split('T')[0];
                  const isCurrentMonth = date.getMonth() === month;
                  const isToday = dateString === new Date().toISOString().split('T')[0];
                  const isSelected = dateString === selectedDate;
                  const dayAppointments = appointments.filter(app => app.date === dateString && 
                    (searchTerm === '' || app.customer.toLowerCase().includes(searchTerm.toLowerCase())));
                  
                  calendarDays.push(
                    <div key={dateString} 
                         className={`border p-1 min-h-[80px] cursor-pointer hover:bg-gray-50 transition-colors ${
                           isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                         } ${
                           isToday ? 'border-purple-500 bg-purple-50' : 
                           isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                         }`}
                         onClick={() => {
                           setSelectedDate(dateString);
                           setViewMode('day');
                         }}>
                      <div className={`text-xs font-medium mb-1 ${
                        isToday ? 'text-purple-600' : 
                        isSelected ? 'text-blue-600' : 
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((appointment) => (
                          <div key={appointment.id} 
                               className={`p-1 rounded text-xs truncate ${
                                 getStatusColor(appointment.status)
                               }`}>
                            <p className="font-medium truncate">{appointment.customer}</p>
                            <p className="text-xs opacity-75">{appointment.time}</p>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayAppointments.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return calendarDays;
              })()}
            </div>
            
            {/* Resumo do Mês */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">Resumo do Mês</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{appointmentsForPeriod.length}</p>
                  <p className="text-sm text-gray-600">Agendamentos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {appointmentsForPeriod.reduce((sum, app) => sum + app.price, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Faturamento</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {appointmentsForPeriod.filter(app => app.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {appointmentsForPeriod.filter(app => app.status === 'scheduled' || app.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && <AppointmentModal />}
    </div>
  );
};

export default Appointments;