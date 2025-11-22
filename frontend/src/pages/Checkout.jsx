import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getClientAddresses, createAddress, createOrder } from '../services/orderService';
import Loading from '../components/Loading';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, restaurant, getTotal, getTotalWithDelivery, clearCart } = useCart();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [newAddress, setNewAddress] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (items.length === 0) {
      navigate('/restaurants');
      return;
    }
    
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getClientAddresses();
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(data[0].id);
      } else {
        setShowAddressForm(true);
      }
    } catch (err) {
      setError('Erro ao carregar endereços');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const address = await createAddress(newAddress);
      setAddresses(prev => [...prev, address]);
      setSelectedAddress(address.id);
      setShowAddressForm(false);
      setNewAddress({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      });
    } catch (err) {
      setError('Erro ao adicionar endereço');
      console.error(err);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      setError('Selecione um endereço de entrega');
      return;
    }
    
    if (!paymentMethod) {
      setError('Selecione uma forma de pagamento');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const orderData = {
        restaurante_id: restaurant.id,
        endereco_cliente_id: selectedAddress,
        forma_pagamento: paymentMethod,
        itens: items.map(item => ({
          item_cardapio_id: item.id,
          quantidade: item.quantity,
          preco_unitario: item.preco
        }))
      };

      await createOrder(orderData);
      clearCart();
      navigate('/orders', { state: { message: 'Pedido realizado com sucesso!' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar pedido');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Carregando checkout..." />;
  }

  const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1>Finalizar Pedido</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Endereço de Entrega */}
          <section className="checkout-section">
            <h2>Endereço de Entrega</h2>
            
            {addresses.length > 0 && !showAddressForm && (
              <>
                <div className="address-list">
                  {addresses.map(address => (
                    <label key={address.id} className="address-option">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={() => setSelectedAddress(address.id)}
                      />
                      <div className="address-details">
                        <strong>{address.logradouro}, {address.numero}</strong>
                        {address.complemento && <span> - {address.complemento}</span>}
                        <br />
                        <span>{address.bairro}, {address.cidade} - {address.estado}</span>
                        <br />
                        <span>CEP: {address.cep}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowAddressForm(true)}
                >
                  + Adicionar novo endereço
                </button>
              </>
            )}

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>CEP *</label>
                    <input
                      type="text"
                      name="cep"
                      value={newAddress.cep}
                      onChange={handleAddressInputChange}
                      required
                      maxLength="9"
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Logradouro *</label>
                    <input
                      type="text"
                      name="logradouro"
                      value={newAddress.logradouro}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Número *</label>
                    <input
                      type="text"
                      name="numero"
                      value={newAddress.numero}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Complemento</label>
                    <input
                      type="text"
                      name="complemento"
                      value={newAddress.complemento}
                      onChange={handleAddressInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bairro *</label>
                    <input
                      type="text"
                      name="bairro"
                      value={newAddress.bairro}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cidade *</label>
                    <input
                      type="text"
                      name="cidade"
                      value={newAddress.cidade}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    name="estado"
                    value={newAddress.estado}
                    onChange={handleAddressInputChange}
                    required
                    maxLength="2"
                    placeholder="SP"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Salvar Endereço
                  </button>
                  {addresses.length > 0 && (
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Forma de Pagamento */}
          <section className="checkout-section">
            <h2>Forma de Pagamento</h2>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="dinheiro"
                  checked={paymentMethod === 'dinheiro'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-details">
                  <strong>💵 Dinheiro</strong>
                  <span>Pagar na entrega</span>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cartao"
                  checked={paymentMethod === 'cartao'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-details">
                  <strong>💳 Cartão</strong>
                  <span>Débito ou crédito na entrega</span>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-details">
                  <strong>🔲 PIX</strong>
                  <span>Pagamento instantâneo</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Resumo do Pedido */}
        <aside className="order-summary">
          <h2>Resumo do Pedido</h2>
          
          {restaurant && (
            <div className="summary-restaurant">
              <strong>{restaurant.nome}</strong>
              <span>⏱️ {restaurant.tempo_entrega_estimado} min</span>
            </div>
          )}

          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <div>
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.nome}</span>
                </div>
                <span className="item-price">
                  R$ {(parseFloat(item.preco) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
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

          {selectedAddressData && (
            <div className="summary-delivery">
              <strong>📍 Entregar em:</strong>
              <p>
                {selectedAddressData.logradouro}, {selectedAddressData.numero}
                {selectedAddressData.complemento && ` - ${selectedAddressData.complemento}`}
              </p>
            </div>
          )}

          <button 
            className="btn-finish-order"
            onClick={handleSubmitOrder}
            disabled={submitting || !selectedAddress || !paymentMethod}
          >
            {submitting ? 'Finalizando...' : 'Finalizar Pedido'}
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
