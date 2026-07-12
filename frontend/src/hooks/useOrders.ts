import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/api';
import type { ApiResponse } from '../types/api';
import toast from 'react-hot-toast';

export const useOrders = (page: number = 1) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['orders', page],
    queryFn: async () => {
      const { data } = await ordersApi.getOrders(page);
      return data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: any) => ordersApi.createOrder(orderData),
    onSuccess: () => {
      toast.success('Order placed successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
  });
};
