import React, { createContext, useContext } from "react";
import { cartApi } from "../services/api";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "../types/api";
import toast from "react-hot-toast";

export interface CartItem {
  _id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productTitle: string;
  variantLabel: string;
  productImage: string;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  total: number;
}

interface CartContextValue {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  refreshCart: () => void;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartRes, isLoading, isFetching, refetch: refreshCart } = useQuery<ApiResponse<Cart>>({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const { data } = await cartApi.getCart();
      return data;
    },
    enabled: isAuthenticated,
  });

  const cart = cartRes?.data || null;
  const loading = isLoading || isFetching;

  const addItemMutation = useMutation({
    mutationFn: ({ productId, variantId, quantity }: { productId: string; variantId: string; quantity: number }) => 
      cartApi.addItem(productId, variantId, quantity),
    onSuccess: () => {
      toast.success("Added to bag");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => toast.error("Failed to add to bag")
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => 
      cartApi.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      toast.success("Removed from bag");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const addToCart = async (productId: string, variantId: string, quantity = 1) => {
    await addItemMutation.mutateAsync({ productId, variantId, quantity });
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    await updateItemMutation.mutateAsync({ itemId, quantity });
  };

  const removeCartItem = async (itemId: string) => {
    await removeItemMutation.mutateAsync(itemId);
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, cartCount, loading: loading || addItemMutation.isPending || updateItemMutation.isPending || removeItemMutation.isPending, 
      refreshCart: () => refreshCart(), addToCart, updateCartItem, removeCartItem 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
