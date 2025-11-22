import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRestaurantMenu,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability
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
    if (user?.restaurante_id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuData, categoriesData] = await Promise.all([
        getRestaurantMenu(user.restaurante_id),
        getCategorias(user.restaurante_id)
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
      setCategoryForm({ nome: category.nome, descricao: category.descricao || '' });
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

    try {
      if (editingCategory) {
        await updateCategoria(editingCategory.id, categoryForm);
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await createCategoria(categoryForm);
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
        categoria_id: item.categoria_id
      });
    } else {
      setEditingItem(null);
      setItemForm({
        nome: '',
        descricao: '',
        preco: '',
        categoria_id: categories[0]?.id || ''
      });
    }
    setShowItemModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveItem = async () => {
    if (!itemForm.nome.trim()) {
      setError('Nome do item é obrigatório');
      return;
    }
    if (!itemForm.preco || itemForm.preco <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }
    if (!itemForm.categoria_id) {
      setError('Selecione uma categoria');
      return;
    }

    try {
      const dataToSend = {
        ...itemForm,
        preco: parseFloat(itemForm.preco)
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, dataToSend);
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

  const handleToggleAvailability = async (id) => {
    try {
      await toggleMenuItemAvailability(id);
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
          <button onClick={() => handleOpenItemModal()}>
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
            <div key={category.id} className="category-card">
              <div className="category-info">
                <h3>{category.nome}</h3>
                {category.descricao && <p>{category.descricao}</p>}
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
                  onClick={() => handleDeleteCategory(category.id)}
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
                  <div key={item.id} className="menu-item-card">
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
                        onClick={() => handleToggleAvailability(item.id)}
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
                        onClick={() => handleDeleteItem(item.id)}
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
            <h2>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={categoryForm.nome}
                onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })}
                placeholder="Ex: Pizzas, Bebidas, Sobremesas"
              />
            </div>
            <div className="form-group">
              <label>Descrição (opcional)</label>
              <textarea
                value={categoryForm.descricao}
                onChange={(e) => setCategoryForm({ ...categoryForm, descricao: e.target.value })}
                placeholder="Descrição da categoria..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveCategory}>
                {editingCategory ? 'Atualizar' : 'Criar'}
              </button>
              <button onClick={() => setShowCategoryModal(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Editar Item' : 'Novo Item'}</h2>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={itemForm.nome}
                onChange={(e) => setItemForm({ ...itemForm, nome: e.target.value })}
                placeholder="Nome do item"
              />
            </div>
            <div className="form-group">
              <label>Descrição (opcional)</label>
              <textarea
                value={itemForm.descricao}
                onChange={(e) => setItemForm({ ...itemForm, descricao: e.target.value })}
                placeholder="Descrição do item..."
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Preço (R$)</label>
              <input
                type="number"
                value={itemForm.preco}
                onChange={(e) => setItemForm({ ...itemForm, preco: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                value={itemForm.categoria_id}
                onChange={(e) => setItemForm({ ...itemForm, categoria_id: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveItem}>
                {editingItem ? 'Atualizar' : 'Criar'}
              </button>
              <button onClick={() => setShowItemModal(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenu;
