import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestaurantId = localStorage.getItem('cartRestaurantId');
    const savedRestaurantName = localStorage.getItem('cartRestaurantName');
    const savedDeliveryFee = localStorage.getItem('cartDeliveryFee');

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }

    if (savedRestaurantId) {
      setRestaurantId(Number(savedRestaurantId));
    }

    if (savedRestaurantName) {
      setRestaurantName(savedRestaurantName);
    }

    if (savedDeliveryFee) {
      setDeliveryFee(Number(savedDeliveryFee));
    }
    
    setLoading(false);
  }, []);

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('cartRestaurantId', restaurantId.toString());
    } else {
      localStorage.removeItem('cartRestaurantId');
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantName) {
      localStorage.setItem('cartRestaurantName', restaurantName);
    } else {
      localStorage.removeItem('cartRestaurantName');
    }
  }, [restaurantName]);

  useEffect(() => {
    if (deliveryFee) {
      localStorage.setItem('cartDeliveryFee', deliveryFee.toString());
    } else {
      localStorage.removeItem('cartDeliveryFee');
    }
  }, [deliveryFee]);

  const addToCart = (item, restaurant) => {
    // Verificar se é de outro restaurante
    if (restaurantId && restaurantId !== restaurant.id) {
      const confirm = window.confirm(
        `Seu carrinho contém itens de ${restaurantName}. Deseja limpar o carrinho e adicionar itens de ${restaurant.nome}?`
      );
      
      if (!confirm) {
        return;
      }
      
      // Limpar carrinho atual
      setCart([]);
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.nome);
      setDeliveryFee(Number(restaurant.taxa_entrega || 0));
    } else if (!restaurantId) {
      // Primeiro item do carrinho
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.nome);
      setDeliveryFee(Number(restaurant.taxa_entrega || 0));
    }

    // Verificar se o item já está no carrinho
    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.id_item === item.id_item
    );

    if (existingItemIndex !== -1) {
      // Atualizar quantidade
      const newCart = [...cart];
      newCart[existingItemIndex].quantidade += 1;
      setCart(newCart);
      toast.success('Quantidade atualizada no carrinho');
    } else {
      // Adicionar novo item
      setCart([...cart, { ...item, quantidade: 1 }]);
      toast.success('Item adicionado ao carrinho');
    }
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(item => item.id_item !== itemId);
    setCart(newCart);
    
    // Se o carrinho ficou vazio, limpar restaurante
    if (newCart.length === 0) {
      setRestaurantId(null);
      setRestaurantName('');
      setDeliveryFee(0);
    }
    
    toast.info('Item removido do carrinho');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const newCart = cart.map(item =>
      item.id_item === itemId
        ? { ...item, quantidade: newQuantity }
        : item
    );
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
    setRestaurantName('');
    setDeliveryFee(0);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartRestaurantId');
    localStorage.removeItem('cartRestaurantName');
    localStorage.removeItem('cartDeliveryFee');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantidade, 0);
  };

  const value = {
    cart,
    restaurantId,
    restaurantName,
    deliveryFee,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { useCart, CartProvider };
