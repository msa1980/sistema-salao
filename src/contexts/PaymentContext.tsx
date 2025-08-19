import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'transfer';
  description: string;
  date: string;
  time: string;
  type: 'income' | 'expense';
  receiptNumber?: string;
  createdAt: string;
}

interface PaymentContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'receiptNumber'>) => void;
  updatePayment: (id: string, updatedPayment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByDate: (date: string) => Payment[];
  getPaymentsByPeriod: (startDate: string, endDate: string) => Payment[];
  getPaymentsByCustomer: (customerId: string) => Payment[];
  getTotalRevenue: (period: 'day' | 'week' | 'month', date?: string) => number;
  getTotalExpenses: (period: 'day' | 'week' | 'month', date?: string) => number;
  generateReceipt: (paymentId: string) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
};

// Dados iniciais de exemplo
const initialPayments: Payment[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Maria Silva',
    amount: 75,
    paymentMethod: 'card',
    description: 'Corte + Escova',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    type: 'income',
    receiptNumber: 'REC001',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Ana Costa',
    amount: 120,
    paymentMethod: 'pix',
    description: 'Coloração',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    type: 'income',
    receiptNumber: 'REC002',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    customerId: '',
    customerName: 'Fornecedor ABC',
    amount: 200,
    paymentMethod: 'transfer',
    description: 'Compra de produtos',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '14:30',
    type: 'expense',
    receiptNumber: 'REC003',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    customerId: '3',
    customerName: 'Julia Santos',
    amount: 25,
    paymentMethod: 'cash',
    description: 'Manicure',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '15:00',
    type: 'income',
    receiptNumber: 'REC004',
    createdAt: new Date().toISOString()
  }
];

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'receiptNumber'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      receiptNumber: `REC${String(payments.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, updatedPayment: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updatedPayment } : payment
    ));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(payment => payment.id !== id));
  };

  const getPaymentsByDate = (date: string) => {
    return payments.filter(payment => payment.date === date);
  };

  const getPaymentsByPeriod = (startDate: string, endDate: string) => {
    return payments.filter(payment => 
      payment.date >= startDate && payment.date <= endDate
    );
  };

  const getPaymentsByCustomer = (customerId: string) => {
    return payments.filter(payment => payment.customerId === customerId);
  };

  const getTotalRevenue = (period: 'day' | 'week' | 'month', date?: string) => {
    const targetDate = date ? new Date(date) : new Date();
    let startDate: Date;
    let endDate: Date = new Date(targetDate);

    switch (period) {
      case 'day':
        startDate = new Date(targetDate);
        break;
      case 'week':
        startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - 6);
        break;
      case 'month':
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(targetDate);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return payments
      .filter(payment => 
        payment.type === 'income' && 
        payment.date >= startDateStr && 
        payment.date <= endDateStr
      )
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getTotalExpenses = (period: 'day' | 'week' | 'month', date?: string) => {
    const targetDate = date ? new Date(date) : new Date();
    let startDate: Date;
    let endDate: Date = new Date(targetDate);

    switch (period) {
      case 'day':
        startDate = new Date(targetDate);
        break;
      case 'week':
        startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - 6);
        break;
      case 'month':
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(targetDate);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return payments
      .filter(payment => 
        payment.type === 'expense' && 
        payment.date >= startDateStr && 
        payment.date <= endDateStr
      )
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const generateReceipt = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const receiptContent = `
COMPROVANTE DE PAGAMENTO
========================

Número: ${payment.receiptNumber}
Data: ${new Date(payment.date).toLocaleDateString('pt-BR')}
Hora: ${payment.time}

Cliente: ${payment.customerName}
Descrição: ${payment.description}
Valor: R$ ${payment.amount.toFixed(2)}
Forma de Pagamento: ${getPaymentMethodLabel(payment.paymentMethod)}

========================
Salão Beleza & Estilo
Obrigado pela preferência!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-${payment.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX',
      transfer: 'Transferência'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <PaymentContext.Provider value={{
      payments,
      addPayment,
      updatePayment,
      deletePayment,
      getPaymentsByDate,
      getPaymentsByPeriod,
      getPaymentsByCustomer,
      getTotalRevenue,
      getTotalExpenses,
      generateReceipt
    }}>
      {children}
    </PaymentContext.Provider>
  );
};