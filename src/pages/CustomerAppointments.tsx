import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useEmployees } from '../contexts/EmployeeContext';
import { useServices } from '../contexts/ServiceContext';
import { Calendar, Clock, User, Phone, MapPin, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Appointment } from '../contexts/AppointmentContext';

const CustomerAppointments: React.FC = () => {
  const { user } = useAuth();
  const { appointments } = useAppointments();
  const { employees } = useEmployees();
  const { services } = useServices();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Filtrar agendamentos do cliente logado
  const customerAppointments = appointments.filter(appointment => 
    appointment.customerId === user?.id
  );

  // Filtrar por período
  const filteredAppointments = customerAppointments.filter(appointment => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return appointmentDate >= now && appointment.status !== 'cancelled' && appointment.status !== 'completed';
      case 'past':
        return appointmentDate < now || appointment.status === 'completed' || appointment.status === 'cancelled';
      default:
        return true;
    }
  });

  // Ordenar por data (mais próximos primeiro para upcoming, mais recentes primeiro para past)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    
    if (filter === 'upcoming') {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });

  const getEmployee = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h1>
          <p className="text-gray-600">Acompanhe seus horários agendados</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximos ({customerAppointments.filter(apt => {
                const appointmentDate = new Date(`${apt.date}T${apt.time}`);
                const now = new Date();
                return appointmentDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
              }).length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Histórico ({customerAppointments.filter(apt => {
                const appointmentDate = new Date(`${apt.date}T${apt.time}`);
                const now = new Date();
                return appointmentDate < now || apt.status === 'completed' || apt.status === 'cancelled';
              }).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({customerAppointments.length})
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'upcoming' ? 'Nenhum agendamento próximo' : 
                 filter === 'past' ? 'Nenhum histórico encontrado' : 
                 'Nenhum agendamento encontrado'}
              </h3>
              <p className="text-gray-500">
                {filter === 'upcoming' ? 'Que tal agendar um novo horário?' : 
                 'Seus agendamentos aparecerão aqui'}
              </p>
            </div>
          ) : (
            sortedAppointments.map((appointment) => {
              const employee = getEmployee(appointment.employeeId);
              const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
              const isUpcoming = appointmentDate >= new Date() && appointment.status !== 'cancelled' && appointment.status !== 'completed';
              
              return (
                <div key={appointment.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status e Data */}
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(appointment.status)}
                        <span className="font-medium text-gray-900">
                          {getStatusText(appointment.status)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {formatDate(appointment.date)}
                        </span>
                      </div>

                      {/* Horário e Profissional */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-900">
                            {formatTime(appointment.time)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700">
                            {employee ? `${employee.name} - ${employee.position}` : 'Profissional não encontrado'}
                          </span>
                        </div>
                      </div>

                      {/* Serviços */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Serviços:</h4>
                        <div className="space-y-1">
                          {appointment.services.map((serviceId) => {
                            const service = services.find(s => s.id === serviceId);
                            return service ? (
                              <div key={serviceId} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{service.name}</span>
                                <span className="text-gray-500">
                                  R$ {service.price.toFixed(2)} • {service.duration}min
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Preço Total */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-medium text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-purple-600">
                          R$ {appointment.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Observações */}
                      {appointment.observations && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Observações:</strong> {appointment.observations}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Badge de Status */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(appointment.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Estatísticas */}
        {customerAppointments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {customerAppointments.length}
                </div>
                <div className="text-sm text-gray-600">Total de Agendamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {customerAppointments.filter(apt => apt.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {customerAppointments.filter(apt => {
                    const appointmentDate = new Date(`${apt.date}T${apt.time}`);
                    const now = new Date();
                    return appointmentDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Próximos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  R$ {customerAppointments
                    .filter(apt => apt.status === 'completed')
                    .reduce((sum, apt) => sum + apt.price, 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Gasto</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;