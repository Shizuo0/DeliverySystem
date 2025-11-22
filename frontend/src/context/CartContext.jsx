import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestaurant = localStorage.getItem('cartRestaurant');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedRestaurant) {
      setRestaurant(JSON.parse(savedRestaurant));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    if (restaurant) {
      localStorage.setItem('cartRestaurant', JSON.stringify(restaurant));
    } else {
      localStorage.removeItem('cartRestaurant');
    }
  }, [items, restaurant]);

  const addItem = (item, restaurantInfo) => {
    // If cart is from different restaurant, clear it
    if (restaurant && restaurant.id !== restaurantInfo.id) {
      if (!confirm(`Seu carrinho contém itens de ${restaurant.nome}. Deseja limpar o carrinho e adicionar itens de ${restaurantInfo.nome}?`)) {
        return false;
      }
      setItems([]);
    }

    setRestaurant(restaurantInfo);

    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    return true;
  };

  const removeItem = (itemId) => {
    setItems(prevItems => prevItems.filter(i => i.id !== itemId));
    if (items.length === 1) {
      setRestaurant(null);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
  };

  const getTotalWithDelivery = () => {
    const subtotal = getTotal();
    const deliveryFee = restaurant?.taxa_entrega || 0;
    return subtotal + parseFloat(deliveryFee);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    items,
    restaurant,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalWithDelivery,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
