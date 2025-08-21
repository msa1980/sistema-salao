import React from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Clock, AlertTriangle, Star, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import StatsCard from '../components/StatsCard';
import { useAppointments } from '../contexts/AppointmentContext';
import { useCustomers } from '../contexts/CustomerContext';
import { useServices } from '../contexts/ServiceContext';
import { useProducts } from '../contexts/ProductContext';
import { usePayments } from '../contexts/PaymentContext';

const Dashboard: React.FC = () => {
  const { appointments } = useAppointments();
  const { customers } = useCustomers();
  const { services } = useServices();
  const { products } = useProducts();
  const { payments, getTotalRevenue } = usePayments();

  // Dados dinâmicos baseados nos contextos
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const todayRevenue = getTotalRevenue('day');
  const newCustomersThisWeek = customers.filter(customer => {
    const customerDate = new Date(customer.createdAt || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return customerDate >= weekAgo;
  }).length;

  const lowStockItems = products.filter(product => product.stock <= product.minStock);

  // Dados para gráficos
  const revenueData = [
    { name: 'Seg', value: 850 },
    { name: 'Ter', value: 1200 },
    { name: 'Qua', value: 980 },
    { name: 'Qui', value: 1450 },
    { name: 'Sex', value: 1800 },
    { name: 'Sáb', value: 2200 },
    { name: 'Dom', value: 1100 }
  ];

  const servicesData = [
    { name: 'Corte', value: 35, color: '#8b5cf6' },
    { name: 'Coloração', value: 25, color: '#06b6d4' },
    { name: 'Manicure', value: 20, color: '#10b981' },
    { name: 'Outros', value: 20, color: '#f59e0b' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-600">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Agendamentos Hoje"
          value={todayAppointments.length}
          change={`${todayAppointments.length > 0 ? '+' : ''}${todayAppointments.length} hoje`}
          changeType={todayAppointments.length > 0 ? "positive" : "neutral"}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Faturamento Hoje"
          value={`R$ ${todayRevenue.toLocaleString('pt-BR')}`}
          change={`${todayRevenue > 0 ? '+' : ''}R$ ${todayRevenue.toLocaleString('pt-BR')} hoje`}
          changeType={todayRevenue > 0 ? "positive" : "neutral"}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Novos Clientes"
          value={newCustomersThisWeek}
          change={`${newCustomersThisWeek} esta semana`}
          changeType={newCustomersThisWeek > 0 ? "positive" : "neutral"}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total de Clientes"
          value={customers.length}
          change={`${customers.length} cadastrados`}
          changeType="positive"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos de Hoje */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Agendamentos Hoje</h3>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => {
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-500' : 
                        appointment.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.customer}</p>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{appointment.time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 
                         appointment.status === 'completed' ? 'Concluído' : 'Agendado'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Estoque */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Alertas de Estoque</h3>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          
          <div className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Estoque atual: {item.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600 font-medium">
                      {item.stock === 0 ? 'ESGOTADO' : 'BAIXO'}
                    </p>
                    <p className="text-xs text-gray-500">Mín: {item.minStock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Todos os produtos estão com estoque adequado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receita Semanal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Receita Semanal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `R$ ${(value/1000).toFixed(1)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Distribuição de Serviços */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-600" />
            Distribuição de Serviços
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Participação']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {servicesData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;