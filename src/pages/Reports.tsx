import React, { useState, useMemo } from 'react';
import { Calendar, BarChart3, PieChart, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState<'financial' | 'services' | 'clients'>('financial');
  const [showFilters, setShowFilters] = useState(false);

  // Função para formatar data em português
  const formatDatePT = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para gerar dados baseados no período
  const generateFinancialData = (period: 'day' | 'week' | 'month' | 'year') => {
    const today = new Date();
    const data = [];
    
    switch (period) {
      case 'day':
        // Dados das últimas 24 horas (por hora)
        for (let i = 23; i >= 0; i--) {
          const date = new Date(today);
          date.setHours(date.getHours() - i);
          data.push({
            date: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            revenue: Math.floor(Math.random() * 200) + 50,
            expenses: Math.floor(Math.random() * 80) + 20,
            profit: 0
          });
        }
        break;
      case 'week':
        // Dados dos últimos 7 dias
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const revenue = Math.floor(Math.random() * 500) + 600;
          const expenses = Math.floor(Math.random() * 200) + 250;
          data.push({
            date: formatDatePT(date),
            revenue,
            expenses,
            profit: revenue - expenses
          });
        }
        break;
      case 'month':
        // Dados dos últimos 30 dias
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const revenue = Math.floor(Math.random() * 600) + 700;
          const expenses = Math.floor(Math.random() * 250) + 280;
          data.push({
            date: formatDatePT(date),
            revenue,
            expenses,
            profit: revenue - expenses
          });
        }
        break;
      case 'year':
        // Dados dos últimos 12 meses
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          const revenue = Math.floor(Math.random() * 15000) + 20000;
          const expenses = Math.floor(Math.random() * 8000) + 8000;
          data.push({
            date: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            revenue,
            expenses,
            profit: revenue - expenses
          });
        }
        break;
    }
    
    return data.map(item => ({
      ...item,
      profit: item.revenue - item.expenses
    }));
  };

  // Dados dinâmicos baseados no período selecionado
  const financialData = useMemo(() => generateFinancialData(dateRange), [dateRange]);

  // Função para gerar dados de serviços baseados no período
  const generateServicesData = (period: 'day' | 'week' | 'month' | 'year') => {
    const services = [
      { name: 'Corte de Cabelo', basePrice: 50 },
      { name: 'Coloração', basePrice: 120 },
      { name: 'Manicure', basePrice: 40 },
      { name: 'Pedicure', basePrice: 50 },
      { name: 'Tratamento Capilar', basePrice: 90 },
      { name: 'Maquiagem', basePrice: 120 },
    ];

    const multiplier = {
      day: 0.1,
      week: 0.7,
      month: 1,
      year: 12
    }[period];

    return services.map(({ name, basePrice }) => {
      const count = Math.floor((Math.random() * 50 + 20) * multiplier);
      const revenue = count * basePrice;
      return {
        name,
        count,
        revenue
      };
    });
  };

  // Função para gerar dados de clientes baseados no período
  const generateClientsData = (period: 'day' | 'week' | 'month' | 'year') => {
    const multiplier = {
      day: 0.1,
      week: 0.7,
      month: 1,
      year: 12
    }[period];

    const newClients = Math.floor((Math.random() * 20 + 10) * multiplier);
    const recurrentClients = Math.floor((Math.random() * 70 + 50) * multiplier);
    const inactiveClients = Math.floor((Math.random() * 15 + 5) * multiplier);
    const totalVisits = Math.floor((newClients + recurrentClients) * 1.8);

    return [
      { name: 'Novos Clientes', count: newClients },
      { name: 'Clientes Recorrentes', count: recurrentClients },
      { name: 'Clientes Inativos', count: inactiveClients },
      { name: 'Total de Visitas', count: totalVisits },
    ];
  };

  const servicesData = useMemo(() => generateServicesData(dateRange), [dateRange]);
  const clientsData = useMemo(() => generateClientsData(dateRange), [dateRange]);

  // Cálculos para o relatório financeiro
  const totalRevenue = financialData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = financialData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = financialData.reduce((sum, item) => sum + item.profit, 0);
  const profitMargin = (totalProfit / totalRevenue) * 100;

  // Cálculos para o relatório de serviços
  const totalServices = servicesData.reduce((sum, item) => sum + item.count, 0);
  const totalServiceRevenue = servicesData.reduce((sum, item) => sum + item.revenue, 0);
  const averageTicket = totalServiceRevenue / totalServices;

  // Cálculos para o relatório de clientes
  const totalClients = clientsData.reduce((sum, item) => sum + item.count, 0);
  const newClientsPercentage = (clientsData[0].count / totalClients) * 100;

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Receita Total</h3>
          <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Despesas</h3>
          <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Lucro</h3>
          <p className="text-2xl font-bold text-blue-600">R$ {totalProfit.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Margem de Lucro</h3>
          <p className="text-2xl font-bold text-purple-600">{profitMargin.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Receita x Despesas</h3>
        <div className="h-64 flex items-end space-x-2">
          {financialData.map((item, index) => {
            const maxValue = Math.max(...financialData.map(d => Math.max(d.revenue, d.expenses)));
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center space-x-1 items-end" style={{ height: '200px' }}>
                  <div 
                    className="w-4 bg-green-500 rounded-t" 
                    style={{ height: `${(item.revenue / maxValue) * 180}px` }}
                    title={`Receita: R$ ${item.revenue}`}
                  ></div>
                  <div 
                    className="w-4 bg-red-500 rounded-t" 
                    style={{ height: `${(item.expenses / maxValue) * 180}px` }}
                    title={`Despesas: R$ ${item.expenses}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.date.split('/')[0]}</p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Receita</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Despesas</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Detalhamento Financeiro</h3>
          <button className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Data</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Receita</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Despesas</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Lucro</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Margem</th>
              </tr>
            </thead>
            <tbody>
              {financialData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">R$ {item.revenue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">R$ {item.expenses.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600">R$ {item.profit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-600">
                    {((item.profit / item.revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-sm font-medium">Total</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-green-600">R$ {totalRevenue.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">R$ {totalExpenses.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">R$ {totalProfit.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">{profitMargin.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );

  const renderServicesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Serviços</h3>
          <p className="text-2xl font-bold text-blue-600">{totalServices}</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Receita de Serviços</h3>
          <p className="text-2xl font-bold text-green-600">R$ {totalServiceRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ticket Médio</h3>
          <p className="text-2xl font-bold text-purple-600">R$ {averageTicket.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Serviços por Quantidade</h3>
          <div className="h-64 flex items-end space-x-2">
            {servicesData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t" 
                  style={{ height: `${(item.count / 50) * 100}%` }}
                  title={`${item.name}: ${item.count}`}
                ></div>
                <p className="text-xs text-gray-500 mt-2 text-center">{item.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Serviços por Receita</h3>
          <div className="h-64 flex items-end space-x-2">
            {servicesData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t" 
                  style={{ height: `${(item.revenue / 3500) * 100}%` }}
                  title={`${item.name}: R$ ${item.revenue}`}
                ></div>
                <p className="text-xs text-gray-500 mt-2 text-center">{item.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Detalhamento de Serviços</h3>
          <button className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Serviço</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Quantidade</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Receita</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Ticket Médio</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {servicesData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600">{item.count}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">R$ {item.revenue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-600">
                    R$ {(item.revenue / item.count).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {((item.count / totalServices) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-sm font-medium">Total</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">{totalServices}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-green-600">R$ {totalServiceRevenue.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">R$ {averageTicket.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-600">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );

  // Função para traduzir período para português
  const translatePeriod = (period: 'day' | 'week' | 'month' | 'year'): string => {
    const translations = {
      day: 'Hoje',
      week: 'Esta Semana',
      month: 'Este Mês',
      year: 'Este Ano'
    };
    return translations[period];
  };

  const renderClientsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {clientsData.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{item.name}</h3>
            <p className="text-2xl font-bold text-blue-600">{item.count}</p>
            <p className="text-sm text-gray-500 mt-1">Período: {translatePeriod(dateRange)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Distribuição de Clientes</h3>
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{totalClients}</p>
                  <p className="text-sm text-gray-500">Total de Clientes</p>
                </div>
              </div>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="15" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="15" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="15" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="${251.2 * (1 - clientsData[0].count / totalClients)}"
                  transform="rotate(-90 50 50)" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="15" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="${251.2 * (1 - (clientsData[0].count + clientsData[1].count) / totalClients)}"
                  transform="rotate(-90 50 50)" 
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Novos</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Recorrentes</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Inativos</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Estatísticas de Clientes</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Novos Clientes</span>
                <span className="text-sm font-medium text-gray-800">{newClientsPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${newClientsPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Clientes Recorrentes</span>
                <span className="text-sm font-medium text-gray-800">
                  {((clientsData[1].count / totalClients) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(clientsData[1].count / totalClients) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Clientes Inativos</span>
                <span className="text-sm font-medium text-gray-800">
                  {((clientsData[2].count / totalClients) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(clientsData[2].count / totalClients) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Média de Visitas por Cliente</span>
                <span className="text-sm font-medium text-gray-800">
                  {(clientsData[3].count / (totalClients - clientsData[2].count)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Análise de Retenção</h3>
          <button className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          A análise de retenção mostra a frequência com que os clientes retornam ao salão após a primeira visita.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Período</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Novos Clientes</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Retorno em 30 dias</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Taxa de Retenção</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const today = new Date();
                const periods = [];
                
                for (let i = 0; i < 3; i++) {
                  const date = new Date(today);
                  date.setMonth(date.getMonth() - i);
                  const newClients = Math.floor(Math.random() * 20) + 15;
                  const retainedClients = Math.floor(newClients * (0.6 + Math.random() * 0.25));
                  const retentionRate = ((retainedClients / newClients) * 100).toFixed(1);
                  
                  periods.push({
                    period: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                    newClients,
                    retainedClients,
                    retentionRate
                  });
                }
                
                return periods.map((period, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{period.period}</td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">{period.newClients}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">{period.retainedClients}</td>
                    <td className="px-4 py-3 text-sm text-right text-purple-600">{period.retentionRate}%</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-600" />
          <span>Filtros</span>
          {showFilters ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Relatório</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setReportType('financial')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${reportType === 'financial' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Financeiro</span>
              </button>
              <button
                onClick={() => setReportType('services')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${reportType === 'services' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <PieChart className="w-5 h-5" />
                <span>Serviços</span>
              </button>
              <button
                onClick={() => setReportType('clients')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${reportType === 'clients' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Calendar className="w-5 h-5" />
                <span>Clientes</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Período</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setDateRange('day')}
                className={`px-4 py-2 rounded-lg transition-colors ${dateRange === 'day' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Hoje
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${dateRange === 'week' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 rounded-lg transition-colors ${dateRange === 'month' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Este Mês
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-4 py-2 rounded-lg transition-colors ${dateRange === 'year' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Este Ano
              </button>
            </div>
          </div>
        </div>
      )}

      {reportType === 'financial' && renderFinancialReport()}
      {reportType === 'services' && renderServicesReport()}
      {reportType === 'clients' && renderClientsReport()}
    </div>
  );
};

export default Reports;