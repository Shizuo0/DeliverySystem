import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, restaurantId, restaurantName, getCartTotal, clearCart } = useCart();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      toast.warning('Seu carrinho está vazio');
      navigate('/restaurants');
      return;
    }

    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/clientes/enderecos');
      setAddresses(response.data);
      
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0].id_endereco_cliente.toString());
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.warning('Selecione um endereço de entrega');
      return;
    }

    if (!paymentMethod) {
      toast.warning('Selecione uma forma de pagamento');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        id_restaurante: restaurantId,
        id_endereco_entrega: parseInt(selectedAddress),
        forma_pagamento: paymentMethod,
        itens: cart.map(item => ({
          id_item: item.id_item,
          quantidade: item.quantidade
        }))
      };

      const response = await api.post('/pedidos', orderData);
      
      toast.success('Pedido realizado com sucesso!');
      clearCart();
      navigate(`/orders/${response.data.id_pedido}`);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const deliveryFee = 5.00;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Finalizar Pedido</h1>

        <div className="checkout-grid">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Endereço */}
              <section className="checkout-section">
                <h2>Endereço de Entrega</h2>
                
                {addresses.length === 0 ? (
                  <div className="no-addresses">
                    <p>Você ainda não tem endereços cadastrados.</p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate('/profile')}
                    >
                      Cadastrar Endereço
                    </button>
                  </div>
                ) : (
                  <div className="address-list">
                    {addresses.map((address) => (
                      <label
                        key={address.id_endereco_cliente}
                        className={`address-option ${
                          selectedAddress === address.id_endereco_cliente.toString()
                            ? 'selected'
                            : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id_endereco_cliente}
                          checked={selectedAddress === address.id_endereco_cliente.toString()}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                        />
                        <div className="address-info">
                          <strong>{address.nome_identificador || 'Endereço'}</strong>
                          <p>
                            {address.logradouro}, {address.numero}
                            {address.complemento && ` - ${address.complemento}`}
                          </p>
                          <p>
                            {address.bairro}, {address.cidade} - {address.estado}
                          </p>
                          <p>CEP: {address.cep}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {/* Forma de Pagamento */}
              <section className="checkout-section">
                <h2>Forma de Pagamento</h2>
                <div className="payment-methods">
                  <label className={`payment-option ${paymentMethod === 'dinheiro' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="dinheiro"
                      checked={paymentMethod === 'dinheiro'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💵 Dinheiro</span>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'cartao_credito' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cartao_credito"
                      checked={paymentMethod === 'cartao_credito'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💳 Cartão de Crédito</span>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'cartao_debito' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cartao_debito"
                      checked={paymentMethod === 'cartao_debito'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💳 Cartão de Débito</span>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'pix' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>📱 PIX</span>
                  </label>
                </div>
              </section>

              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={submitting || addresses.length === 0}
              >
                {submitting ? 'Finalizando...' : `Finalizar Pedido - R$ ${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="order-summary">
            <h2>Resumo do Pedido</h2>
            
            <div className="restaurant-info">
              <strong>{restaurantName}</strong>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id_item} className="cart-item-summary">
                  <div className="item-details">
                    <span className="item-qty">{item.quantidade}x</span>
                    <span className="item-name">{item.nome}</span>
                  </div>
                  <span className="item-price">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Taxa de entrega</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <strong>Total</strong>
                <strong>R$ {total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
