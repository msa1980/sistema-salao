// Types para o sistema de agendamento
export interface Salon {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  category: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalVisits: number;
  lastVisit?: Date;
  preferences?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  employeeId?: string; // ID do funcionário responsável pelo atendimento
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  cost: number;
  supplier?: string;
}

export interface FinancialReport {
  revenue: number;
  expenses: number;
  profit: number;
  period: string;
  appointments: number;
  newCustomers: number;
}

export interface LoyaltyRule {
  id: string;
  pointsPerService: number;
  discountThreshold: number;
  discountPercentage: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo?: string;
  specialties: string[];
  isActive: boolean;
  hireDate: string;
  workingHours: {
    start: string;
    end: string;
  };
}