
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  shippingPrice: number;
  imageUrl: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalShipping: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [phoneNumber, setPhoneState] = useState<string>('');

  useEffect(() => {
    const savedCart = localStorage.getItem('jocmart_cart');
    const savedPhone = localStorage.getItem('jocmart_phone');
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
    
    if (savedPhone) {
      setPhoneState(savedPhone);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jocmart_cart', JSON.stringify(items));
  }, [items]);

  const setPhoneNumber = (phone: string) => {
    setPhoneState(phone);
    localStorage.setItem('jocmart_phone', phone);
  };

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalShipping = items.reduce((acc, item) => acc + (item.shippingPrice || 0) * item.quantity, 0);

  return (
    <div dir="rtl">
      <CartContext.Provider
        value={{ 
          items, 
          phoneNumber, 
          setPhoneNumber, 
          addToCart, 
          removeFromCart, 
          updateQuantity, 
          clearCart, 
          totalItems, 
          totalPrice,
          totalShipping
        }}
      >
        {children}
      </CartContext.Provider>
    </div>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
