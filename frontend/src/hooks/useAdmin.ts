import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, productsApi } from "../services/api";
import type { Analytics, Product, ApiResponse } from '../types/api';
import toast from 'react-hot-toast';

export const useAnalytics = (range = '30d') => {
  return useQuery<ApiResponse<Analytics>>({
    queryKey: ['admin', 'analytics', range],
    queryFn: async () => {
      const { data } = await adminApi.getAnalytics(range);
      return data;
    },
  });
};

export const useAdminProducts = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['admin', 'products', params],
    queryFn: async () => {
      const { data } = await adminApi.getProducts(params);
      return data;
    },
  });
};

export const useAdminOrders = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const { data } = await adminApi.getOrders(params);
      return data;
    },
  });
};

export const useAdminCategories = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['admin', 'categories', params],
    queryFn: async () => {
      const { data } = await adminApi.getCategories(params);
      return data;
    },
  });
};

export const useAdminInventory = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['admin', 'inventory', params],
    queryFn: async () => {
      const { data } = await adminApi.getInventory(params);
      return data;
    },
  });
};

export const useAdminUsers = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const { data } = await adminApi.getUsers(params);
      return data;
    },
  });
};

export const useAdminAccounts = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['admin', 'accounts', params],
    queryFn: async () => {
      const { data } = await adminApi.getAdmins(params);
      return data;
    },
  });
};

export const useAdminAuditLog = (params?: Record<string, any>) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['admin', 'audit', params],
    queryFn: async () => {
      const { data } = await adminApi.getAuditLog(params);
      return data;
    },
  });
};

export const useAdminOrderDetail = (id: string) => {
  return useQuery<ApiResponse<any>>({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const { data } = await adminApi.getOrderDetail(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) => 
      adminApi.updateOrderStatus(id, status, note),
    onSuccess: (_, { id }) => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });
};

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: () => {
      toast.error('Failed to deactivate product');
    }
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminApi.createCategory(formData),
    onSuccess: () => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => 
      adminApi.updateCategory(id, formData),
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId, delta, reason }: { productId: string; variantId: string; delta: number; reason?: string }) => 
      adminApi.adjustStock(productId, variantId, delta, reason || ""),
    onSuccess: () => {
      toast.success('Stock adjusted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    }
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => adminApi.blockUser(id, blocked),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  });
};

export const useAdminProduct = (id: string) => {
  return useQuery<ApiResponse<any>>({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const { data } = await productsApi.getOne(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminApi.createProduct(formData),
    onSuccess: () => {
      toast.success('Product created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => 
      adminApi.updateProduct(id, formData),
    onSuccess: (_, { id }) => {
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: any) => adminApi.createAdmin(values),
    onSuccess: () => {
      toast.success('Admin account created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAdmin(id, data),
    onSuccess: () => {
      toast.success('Admin status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update admin');
    }
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdmin(id),
    onSuccess: () => {
      toast.success('Admin account removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove admin');
    }
  });
};

