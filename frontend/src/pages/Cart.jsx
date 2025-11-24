import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    restaurantName,
    deliveryFee,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  } = useCart();
  const { user } = useAuth();

  const subtotal = getCartTotal();
  const total = subtotal + (cart.length > 0 ? deliveryFee : 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    navigate('/checkout');
  };

  if (user?.tipo !== 'cliente') {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h1>Área exclusiva para clientes</h1>
          <p>Somente contas de cliente podem acessar o carrinho e finalizar pedidos.</p>
          <Link to="/" className="btn-primary">Voltar ao dashboard</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h1>Seu carrinho está vazio</h1>
          <p>Explore o dashboard, escolha um restaurante e adicione itens antes de finalizar.</p>
          <div className="cart-empty-actions">
            <Link to="/" className="btn-primary">Ir para o dashboard</Link>
            <button className="btn-secondary" onClick={() => navigate('/restaurants')}>
              Procurar restaurantes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <p className="cart-kicker">Preparar pedido</p>
          <h1>Carrinho</h1>
          <p className="cart-restaurant">{restaurantName}</p>
        </div>
        <button type="button" className="btn-link" onClick={clearCart}>Limpar tudo</button>
      </div>

      <div className="cart-grid">
        <section className="cart-items">
          {cart.map((item) => (
            <article key={item.id_item} className="cart-item">
              <div>
                <h3>{item.nome}</h3>
                {item.descricao && <p className="item-description">{item.descricao}</p>}
                <span className="item-price">R$ {Number(item.preco).toFixed(2)}</span>
              </div>

              <div className="cart-item-actions">
                <div className="qty-control">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id_item, item.quantidade - 1)}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span>{item.quantidade}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id_item, item.quantidade + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-link text-danger"
                  onClick={() => removeFromCart(item.id_item)}
                >
                  Remover
                </button>
                <span className="line-total">
                  R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                </span>
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-summary">
          <h2>Resumo</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>R$ {subtotal.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Entrega estimada</span>
            <strong>R$ {deliveryFee.toFixed(2)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>R$ {total.toFixed(2)}</strong>
          </div>

          <button type="button" className="btn-primary btn-full" onClick={handleCheckout}>
            Ir para checkout
          </button>
          <button
            type="button"
            className="btn-secondary btn-full"
            onClick={() => navigate('/restaurants')}
          >
            Adicionar mais itens
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
