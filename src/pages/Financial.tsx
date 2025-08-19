import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, CreditCard, Banknote, Download, BarChart3, Plus, X, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';
import { usePayments } from '../contexts/PaymentContext';
import { useCustomers } from '../contexts/CustomerContext';

const Financial: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'pix' | 'transfer',
    description: '',
    type: 'income' as 'income' | 'expense'
  });

  const { payments, addPayment, getTotalRevenue, getTotalExpenses, generateReceipt, getPaymentsByDate } = usePayments();
  const { customers } = useCustomers();

  // Função para exportar dados
  const handleExport = () => {
    const data = payments.map(payment => ({
      Data: payment.date,
      Cliente: payment.customerName,
      Descrição: payment.description,
      Valor: payment.amount,
      'Forma de Pagamento': payment.paymentMethod,
      Tipo: payment.type === 'income' ? 'Receita' : 'Despesa'
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPayment = () => {
    if (!paymentForm.amount || !paymentForm.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === paymentForm.customerId);
    
    addPayment({
      customerId: paymentForm.customerId,
      customerName: selectedCustomer?.name || 'Cliente não identificado',
      amount: parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      description: paymentForm.description,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: paymentForm.type
    });

    setPaymentForm({
      customerId: '',
      amount: '',
      paymentMethod: 'cash',
      description: '',
      type: 'income'
    });
    setShowPaymentModal(false);
  };

  // Dados dinâmicos baseados no PaymentContext
  const currentRevenue = getTotalRevenue(chartPeriod);
  const currentExpenses = getTotalExpenses(chartPeriod);
  const currentProfit = currentRevenue - currentExpenses;

  const monthlyData = {
    revenue: currentRevenue,
    expenses: currentExpenses,
    profit: currentProfit,
    appointments: payments.filter(p => p.type === 'income').length,
    newCustomers: customers.length,
    avgTicket: payments.filter(p => p.type === 'income').length > 0 
      ? currentRevenue / payments.filter(p => p.type === 'income').length 
      : 0
  };

  // Gerar dados do gráfico baseados no período selecionado
  const generateChartData = () => {
    const today = new Date();
    const data = [];

    if (chartPeriod === 'day') {
      // Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayPayments = getPaymentsByDate(dateStr);
        const receita = dayPayments.filter(p => p.type === 'income').reduce((sum, p) => sum + p.amount, 0);
        const despesas = dayPayments.filter(p => p.type === 'expense').reduce((sum, p) => sum + p.amount, 0);
        
        data.push({
          month: date.getDate().toString(),
          receita,
          despesas
        });
      }
    } else if (chartPeriod === 'week') {
      // Últimas 4 semanas
      for (let i = 3; i >= 0; i--) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (i * 7 + 6));
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - (i * 7));
        
        const weekPayments = payments.filter(p => 
          p.date >= startDate.toISOString().split('T')[0] && 
          p.date <= endDate.toISOString().split('T')[0]
        );
        
        const receita = weekPayments.filter(p => p.type === 'income').reduce((sum, p) => sum + p.amount, 0);
        const despesas = weekPayments.filter(p => p.type === 'expense').reduce((sum, p) => sum + p.amount, 0);
        
        data.push({
          month: `S${4-i}`,
          receita,
          despesas
        });
      }
    } else {
      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const monthPayments = payments.filter(p => p.date >= monthStart && p.date <= monthEnd);
        const receita = monthPayments.filter(p => p.type === 'income').reduce((sum, p) => sum + p.amount, 0);
        const despesas = monthPayments.filter(p => p.type === 'expense').reduce((sum, p) => sum + p.amount, 0);
        
        data.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          receita,
          despesas
        });
      }
    }
    
    return data;
  };

  const chartData = generateChartData();
  const transactions = payments.slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Gestão Financeira</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pagamento</span>
          </button>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receita Total"
          value={`R$ ${monthlyData.revenue.toLocaleString('pt-BR')}`}
          change="+12% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Despesas"
          value={`R$ ${monthlyData.expenses.toLocaleString('pt-BR')}`}
          change="+3% vs mês anterior"
          changeType="negative"
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Lucro Líquido"
          value={`R$ ${monthlyData.profit.toLocaleString('pt-BR')}`}
          change="+15% vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Ticket Médio"
          value={`R$ ${monthlyData.avgTicket.toFixed(2)}`}
          change="+5% vs mês anterior"
          changeType="positive"
          icon={Receipt}
          color="blue"
        />
      </div>

      {/* Gráfico de Receita x Despesas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Receita x Despesas
          </h3>
          <div className="flex items-center space-x-2">
            <select 
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value as 'day' | 'week' | 'month')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="day">Diário</option>
              <option value="week">Semanal</option>
              <option value="month">Mensal</option>
            </select>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString('pt-BR')}`, 
                  name === 'receita' ? 'Receita' : 'Despesas'
                ]}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ccc', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                formatter={(value) => value === 'receita' ? 'Receita' : 'Despesas'}
              />
              <Bar 
                dataKey="receita" 
                fill="#10b981" 
                name="receita"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="despesas" 
                fill="#ef4444" 
                name="despesas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transações Recentes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Transações Recentes</h3>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 6).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        {transaction.paymentMethod === 'card' && <CreditCard className="w-3 h-3 mr-1" />}
                        {transaction.paymentMethod === 'cash' && <Banknote className="w-3 h-3 mr-1" />}
                        {transaction.paymentMethod === 'pix' && <DollarSign className="w-3 h-3 mr-1" />}
                        {transaction.paymentMethod === 'card' ? 'Cartão' : 
                         transaction.paymentMethod === 'cash' ? 'Dinheiro' :
                         transaction.paymentMethod === 'pix' ? 'PIX' : 'Transferência'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                  </span>
                  {transaction.receiptNumber && (
                    <button
                      onClick={() => generateReceipt(transaction.id)}
                      className="text-purple-600 hover:text-purple-700 p-1 rounded"
                      title="Gerar comprovante"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Formas de Pagamento</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cartão</p>
                  <p className="text-sm text-gray-600">45% dos pagamentos</p>
                </div>
              </div>
              <span className="font-bold text-blue-600">R$ 3.938</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">PIX</p>
                  <p className="text-sm text-gray-600">35% dos pagamentos</p>
                </div>
              </div>
              <span className="font-bold text-green-600">R$ 3.063</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Banknote className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dinheiro</p>
                  <p className="text-sm text-gray-600">20% dos pagamentos</p>
                </div>
              </div>
              <span className="font-bold text-yellow-600">R$ 1.750</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Emissão de Notas Fiscais</h4>
            <p className="text-sm text-gray-600 mb-3">
              Mantenha sua contabilidade em dia com a emissão automática de notas fiscais.
            </p>
            <button 
              onClick={() => alert('Funcionalidade de NFe em desenvolvimento. Em breve você poderá configurar a emissão automática de notas fiscais!')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Configurar NFe
            </button>
          </div>
        </div>
      </div>

      {/* Metas Financeiras */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Metas do Mês</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Meta de Receita</span>
              <span className="text-sm font-bold text-purple-600">87%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">R$ 8.750 / R$ 10.000</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Agendamentos</span>
              <span className="text-sm font-bold text-blue-600">89%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">89 / 100 agendamentos</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Novos Clientes</span>
              <span className="text-sm font-bold text-green-600">120%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">12 / 10 novos clientes</p>
          </div>
        </div>
      </div>

      {/* Modal de Novo Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Novo Pagamento</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transação
                </label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>

              {paymentForm.type === 'income' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente
                  </label>
                  <select
                    value={paymentForm.customerId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, customerId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cliente</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' | 'pix' | 'transfer' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descrição do pagamento"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPayment}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Adicionar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;