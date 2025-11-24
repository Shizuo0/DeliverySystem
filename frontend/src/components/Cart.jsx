import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart({ isOpen, onClose }) {
  const { items, restaurant, removeItem, updateQuantity, getTotal, getTotalWithDelivery, getItemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={onClose}></div>
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Seu Carrinho</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Seu carrinho está vazio</p>
            <span>Adicione itens para começar</span>
          </div>
        ) : (
          <>
            {restaurant && (
              <div className="cart-restaurant">
                <strong>{restaurant.nome}</strong>
                <span>⏱️ {restaurant.tempo_entrega_estimado} min</span>
              </div>
            )}

            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.nome}</h4>
                    <p className="cart-item-price">R$ {parseFloat(item.preco).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="Remover item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>R$ {getTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Taxa de entrega</span>
                <span>R$ {parseFloat(restaurant?.taxa_entrega || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <strong>Total</strong>
                <strong>R$ {getTotalWithDelivery().toFixed(2)}</strong>
              </div>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Finalizar Pedido ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;
