import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRestaurantItems,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemAvailability
} from '../services/restaurantService';
import Loading from '../components/Loading';
import './AdminMenu.css';

function AdminMenu() {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ nome: '', descricao: '' });
  const [itemForm, setItemForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: ''
  });

  useEffect(() => {
    if (user?.id_restaurante) {
      fetchData();
    } else if (user && !user.id_restaurante) {
      setLoading(false);
      setError('ID do restaurante não encontrado.');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuData, categoriesData] = await Promise.all([
        getRestaurantItems(),
        getCategorias()
      ]);
      setMenu(menuData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ nome: category.nome_categoria, descricao: '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ nome: '', descricao: '' });
    }
    setShowCategoryModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.nome.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }
    
    if (categoryForm.nome.trim().length < 2) {
      setError('Nome da categoria deve ter no mínimo 2 caracteres');
      return;
    }
    
    if (categoryForm.nome.trim().length > 100) {
      setError('Nome da categoria deve ter no máximo 100 caracteres');
      return;
    }
    
    // Verificar caracteres especiais perigosos
    if (/[<>{}\[\]\\]/.test(categoryForm.nome)) {
      setError('Nome da categoria contém caracteres não permitidos');
      return;
    }

    try {
      const dataToSend = {
        nome_categoria: categoryForm.nome
      };

      if (editingCategory) {
        await updateCategoria(editingCategory.id_categoria, dataToSend);
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await createCategoria(dataToSend);
        setSuccess('Categoria criada com sucesso!');
      }
      setShowCategoryModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar categoria');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os itens desta categoria serão removidos.')) {
      return;
    }

    try {
      await deleteCategoria(id);
      setSuccess('Categoria excluída com sucesso!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir categoria');
    }
  };

  // Item handlers
  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        nome: item.nome,
        descricao: item.descricao || '',
        preco: item.preco,
        categoria_id: item.id_categoria
      });
    } else {
      setEditingItem(null);
      setItemForm({
        nome: '',
        descricao: '',
        preco: '',
        categoria_id: categories[0]?.id_categoria || ''
      });
    }
    setShowItemModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveItem = async () => {
    // Validar nome
    if (!itemForm.nome.trim()) {
      setError('Nome do item é obrigatório');
      return;
    }
    
    if (itemForm.nome.trim().length < 2) {
      setError('Nome do item deve ter no mínimo 2 caracteres');
      return;
    }
    
    if (itemForm.nome.trim().length > 100) {
      setError('Nome do item deve ter no máximo 100 caracteres');
      return;
    }
    
    // Verificar caracteres especiais perigosos no nome
    if (/[<>{}\[\]\\]/.test(itemForm.nome)) {
      setError('Nome do item contém caracteres não permitidos');
      return;
    }
    
    // Validar preço
    const preco = parseFloat(itemForm.preco);
    if (!itemForm.preco || isNaN(preco)) {
      setError('Preço é obrigatório e deve ser um número válido');
      return;
    }
    
    if (preco <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }
    
    if (preco > 9999.99) {
      setError('Preço não pode exceder R$ 9.999,99');
      return;
    }
    
    // Verificar casas decimais
    const precoStr = itemForm.preco.toString();
    if (precoStr.includes('.')) {
      const decimals = precoStr.split('.')[1];
      if (decimals && decimals.length > 2) {
        setError('Preço deve ter no máximo 2 casas decimais');
        return;
      }
    }
    
    // Validar categoria
    if (!itemForm.categoria_id) {
      setError('Selecione uma categoria');
      return;
    }
    
    // Validar descrição se fornecida
    if (itemForm.descricao && itemForm.descricao.length > 500) {
      setError('Descrição deve ter no máximo 500 caracteres');
      return;
    }
    
    if (itemForm.descricao && /[<>{}\[\]\\]/.test(itemForm.descricao)) {
      setError('Descrição contém caracteres não permitidos');
      return;
    }

    try {
      const dataToSend = {
        nome: itemForm.nome,
        descricao: itemForm.descricao,
        preco: parseFloat(itemForm.preco),
        id_categoria: itemForm.categoria_id
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id_item_cardapio, dataToSend);
        setSuccess('Item atualizado com sucesso!');
      } else {
        await createMenuItem(dataToSend);
        setSuccess('Item criado com sucesso!');
      }
      setShowItemModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      await deleteMenuItem(id);
      setSuccess('Item excluído com sucesso!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      // Toggle the current availability
      const newAvailability = !item.disponivel;
      await updateMenuItemAvailability(item.id_item_cardapio, newAvailability);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar disponibilidade');
    }
  };

  const groupedMenu = menu.reduce((acc, item) => {
    const categoria = item.categoria_nome || 'Sem categoria';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {});

  if (loading) {
    return <Loading message="Carregando cardápio..." />;
  }

  return (
    <div className="admin-menu">
      <div className="page-header">
        <h1>Gerenciar Cardápio</h1>
        <div className="header-actions">
          <button onClick={() => handleOpenCategoryModal()} className="btn-secondary">
            + Nova Categoria
          </button>
          <button onClick={() => handleOpenItemModal()} className="btn-secondary">
            + Novo Item
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Categories Section */}
      <div className="categories-section">
        <h2>Categorias</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id_categoria} className="category-card">
              <div className="category-info">
                <h3>{category.nome_categoria}</h3>
              </div>
              <div className="category-actions">
                <button 
                  onClick={() => handleOpenCategoryModal(category)}
                  className="btn-icon"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id_categoria)}
                  className="btn-icon btn-danger"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="empty-message">Nenhuma categoria criada ainda.</p>
          )}
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="menu-items-section">
        <h2>Itens do Cardápio</h2>
        {Object.keys(groupedMenu).length === 0 ? (
          <p className="empty-message">Nenhum item no cardápio ainda.</p>
        ) : (
          Object.keys(groupedMenu).map(categoryName => (
            <div key={categoryName} className="category-section">
              <h3>{categoryName}</h3>
              <div className="items-list">
                {groupedMenu[categoryName].map(item => (
                  <div key={item.id_item_cardapio} className="menu-item-card">
                    <div className="item-info">
                      <h4>{item.nome}</h4>
                      <p className="item-description">{item.descricao}</p>
                      <p className="item-price">R$ {parseFloat(item.preco).toFixed(2)}</p>
                      <span className={`availability-badge ${item.disponivel ? 'available' : 'unavailable'}`}>
                        {item.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className="btn-icon"
                        title={item.disponivel ? 'Tornar indisponível' : 'Tornar disponível'}
                      >
                        {item.disponivel ? '👁️' : '🚫'}
                      </button>
                      <button
                        onClick={() => handleOpenItemModal(item)}
                        className="btn-icon"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id_item_cardapio)}
                        className="btn-icon btn-danger"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowCategoryModal(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome da Categoria *</label>
                <input
                  type="text"
                  value={categoryForm.nome}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })}
                  placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                  maxLength="100"
                />
                <span className="field-hint">Este nome aparecerá no cardápio para os clientes</span>
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={categoryForm.descricao}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descricao: e.target.value })}
                  placeholder="Descreva os tipos de itens desta categoria..."
                  rows="3"
                  maxLength="255"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCategoryModal(false)} className="btn-secondary">
                Cancelar
              </button>
              <button onClick={handleSaveCategory} className="btn-primary">
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Editar Item' : 'Novo Item'}</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowItemModal(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Item *</label>
                <input
                  type="text"
                  value={itemForm.nome}
                  onChange={(e) => setItemForm({ ...itemForm, nome: e.target.value })}
                  placeholder="Ex: Pizza Margherita, Hambúrguer Artesanal"
                  maxLength="100"
                />
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={itemForm.descricao}
                  onChange={(e) => setItemForm({ ...itemForm, descricao: e.target.value })}
                  placeholder="Descreva os ingredientes e detalhes do item..."
                  rows="3"
                  maxLength="500"
                />
                <span className="field-hint">Uma boa descrição ajuda os clientes a escolher</span>
              </div>
              <div className="form-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  value={itemForm.preco}
                  onChange={(e) => setItemForm({ ...itemForm, preco: e.target.value })}
                  placeholder="0,00"
                  step="0.01"
                  min="0.01"
                  max="9999.99"
                />
                <span className="field-hint">Valor entre R$ 0,01 e R$ 9.999,99</span>
              </div>
              <div className="form-group">
                <label>Categoria *</label>
                <select
                  value={itemForm.categoria_id}
                  onChange={(e) => setItemForm({ ...itemForm, categoria_id: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome_categoria}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowItemModal(false)} className="btn-secondary">
                Cancelar
              </button>
              <button onClick={handleSaveItem} className="btn-primary">
                {editingItem ? 'Salvar Alterações' : 'Criar Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenu;
