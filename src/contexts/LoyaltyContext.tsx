import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCustomers, Customer as BaseCustomer } from './CustomerContext';

export interface LoyaltyCustomer extends BaseCustomer {
  points: number;
  level: 'bronze' | 'prata' | 'ouro' | 'diamante';
  loyaltyJoinedDate: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  available: boolean;
}

export interface PointsTransaction {
  id: string;
  customerId: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  date: string;
}

interface LoyaltyContextType {
  loyaltyCustomers: LoyaltyCustomer[];
  rewards: Reward[];
  pointsTransactions: PointsTransaction[];
  addCustomerToLoyalty: (customerId: string) => void;
  removeCustomerFromLoyalty: (customerId: string) => void;
  addPoints: (customerId: string, points: number, description: string) => void;
  redeemPoints: (customerId: string, points: number, description: string) => void;
  updateCustomerLevel: (customerId: string, level: LoyaltyCustomer['level']) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (id: string, reward: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  redeemReward: (customerId: string, rewardId: string) => boolean;
  getLoyaltyCustomerById: (id: string) => LoyaltyCustomer | undefined;
  calculateLevel: (points: number) => LoyaltyCustomer['level'];
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

const initialRewards: Reward[] = [
  { id: '1', name: 'Hidratação Gratuita', description: 'Uma sessão de hidratação capilar profunda', pointsCost: 200, available: true },
  { id: '2', name: 'Desconto de 20%', description: 'Desconto em qualquer serviço', pointsCost: 150, available: true },
  { id: '3', name: 'Manicure Gratuita', description: 'Uma sessão de manicure completa', pointsCost: 100, available: true },
  { id: '4', name: 'Kit de Produtos', description: 'Kit com shampoo e condicionador', pointsCost: 300, available: true },
  { id: '5', name: 'Corte Gratuito', description: 'Um corte de cabelo completo', pointsCost: 250, available: true },
];

export const LoyaltyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { customers } = useCustomers();
  const [loyaltyCustomerIds, setLoyaltyCustomerIds] = useState<string[]>(['1', '2', '3']); // IDs dos clientes já no programa
  const [customerPoints, setCustomerPoints] = useState<Record<string, number>>({
    '1': 450,
    '2': 180,
    '3': 720
  });
  const [customerLevels, setCustomerLevels] = useState<Record<string, LoyaltyCustomer['level']>>({
    '1': 'ouro',
    '2': 'prata', 
    '3': 'diamante'
  });
  const [loyaltyJoinDates, setLoyaltyJoinDates] = useState<Record<string, string>>({
    '1': '2024-01-15',
    '2': '2024-02-10',
    '3': '2024-01-05'
  });
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>([]);

  const calculateLevel = (points: number): LoyaltyCustomer['level'] => {
    if (points >= 500) return 'diamante';
    if (points >= 300) return 'ouro';
    if (points >= 150) return 'prata';
    return 'bronze';
  };

  const loyaltyCustomers: LoyaltyCustomer[] = customers
    .filter(customer => loyaltyCustomerIds.includes(customer.id))
    .map(customer => ({
      ...customer,
      points: customerPoints[customer.id] || 0,
      level: customerLevels[customer.id] || calculateLevel(customerPoints[customer.id] || 0),
      loyaltyJoinedDate: loyaltyJoinDates[customer.id] || new Date().toISOString().split('T')[0]
    }));

  const addCustomerToLoyalty = (customerId: string) => {
    if (!loyaltyCustomerIds.includes(customerId)) {
      setLoyaltyCustomerIds(prev => [...prev, customerId]);
      setCustomerPoints(prev => ({ ...prev, [customerId]: 0 }));
      setCustomerLevels(prev => ({ ...prev, [customerId]: 'bronze' }));
      setLoyaltyJoinDates(prev => ({ ...prev, [customerId]: new Date().toISOString().split('T')[0] }));
    }
  };

  const removeCustomerFromLoyalty = (customerId: string) => {
    setLoyaltyCustomerIds(prev => prev.filter(id => id !== customerId));
    setCustomerPoints(prev => {
      const newPoints = { ...prev };
      delete newPoints[customerId];
      return newPoints;
    });
    setCustomerLevels(prev => {
      const newLevels = { ...prev };
      delete newLevels[customerId];
      return newLevels;
    });
    setLoyaltyJoinDates(prev => {
      const newDates = { ...prev };
      delete newDates[customerId];
      return newDates;
    });
  };

  const addPoints = (customerId: string, points: number, description: string) => {
    const newPoints = (customerPoints[customerId] || 0) + points;
    setCustomerPoints(prev => ({ ...prev, [customerId]: newPoints }));
    setCustomerLevels(prev => ({ ...prev, [customerId]: calculateLevel(newPoints) }));
    
    const transaction: PointsTransaction = {
      id: Date.now().toString(),
      customerId,
      points,
      type: 'earned',
      description,
      date: new Date().toISOString()
    };
    setPointsTransactions(prev => [...prev, transaction]);
  };

  const redeemPoints = (customerId: string, points: number, description: string) => {
    const currentPoints = customerPoints[customerId] || 0;
    if (currentPoints >= points) {
      const newPoints = currentPoints - points;
      setCustomerPoints(prev => ({ ...prev, [customerId]: newPoints }));
      setCustomerLevels(prev => ({ ...prev, [customerId]: calculateLevel(newPoints) }));
      
      const transaction: PointsTransaction = {
        id: Date.now().toString(),
        customerId,
        points,
        type: 'redeemed',
        description,
        date: new Date().toISOString()
      };
      setPointsTransactions(prev => [...prev, transaction]);
      return true;
    }
    return false;
  };

  const updateCustomerLevel = (customerId: string, level: LoyaltyCustomer['level']) => {
    setCustomerLevels(prev => ({ ...prev, [customerId]: level }));
  };

  const addReward = (reward: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      ...reward,
      id: Date.now().toString()
    };
    setRewards(prev => [...prev, newReward]);
  };

  const updateReward = (id: string, reward: Partial<Reward>) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, ...reward } : r));
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const redeemReward = (customerId: string, rewardId: string): boolean => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && reward.available) {
      return redeemPoints(customerId, reward.pointsCost, `Resgate: ${reward.name}`);
    }
    return false;
  };

  const getLoyaltyCustomerById = (id: string): LoyaltyCustomer | undefined => {
    return loyaltyCustomers.find(customer => customer.id === id);
  };

  const value: LoyaltyContextType = {
    loyaltyCustomers,
    rewards,
    pointsTransactions,
    addCustomerToLoyalty,
    removeCustomerFromLoyalty,
    addPoints,
    redeemPoints,
    updateCustomerLevel,
    addReward,
    updateReward,
    deleteReward,
    redeemReward,
    getLoyaltyCustomerById,
    calculateLevel
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};