import { useState, useEffect } from 'react';
import userService from '../services/userService';
import "../styles/UsersManagement.css";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });

  // Buscar usuários ao carregar
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuários quando o termo de busca muda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao carregar usuários: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'User' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await userService.delete(id);
      alert('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário: ' + error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Preencha nome e email');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('Preencha a senha para novos usuários');
      return;
    }

    try {
      const body = { ...formData };
      if (editingUser && !formData.password) {
        delete body.password;
      }

      if (editingUser) {
        await userService.update(editingUser.id, body);
        alert('Usuário atualizado com sucesso!');
      } else {
        await userService.create(body);
        alert('Usuário criado com sucesso!');
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário: ' + error);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="users-management">
        <div className="loading">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="page-header">
        <div className="header-left">
          <h2>Gerenciamento de Usuários</h2>
          <p className="subtitle">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="btn-icon">+</span>
          Novo Usuário
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="search-container">
        <div className="search-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome, email ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && filteredUsers.length === 0 && (
          <p className="no-results">
            Nenhum resultado encontrado para "<strong>{searchTerm}</strong>"
          </p>
        )}
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>Nenhum usuário cadastrado ainda.</p>
          <button className="btn-primary" onClick={handleCreate}>
            Criar Primeiro Usuário
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>Nenhum usuário corresponde à sua busca</p>
          <button className="btn-secondary" onClick={clearSearch}>
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <span className="user-id">#{user.id}</span>
                  </td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role === 'Admin' ? '👑' : '👤'} {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Editar usuário"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user.id)}
                        title="Excluir usuário"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal permanece igual... */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Digite o nome"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="Digite o email"
                />
              </div>
              <div className="form-group">
                <label>
                  Senha {editingUser && <span style={{color: 'var(--gray-600)', fontSize: '13px'}}>(deixe em branco para não alterar)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? "Opcional" : "Digite a senha"}
                />
              </div>
              <div className="form-group">
                <label>Função</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="User">Usuário</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button className="btn-submit" onClick={handleSubmit}>
                  {editingUser ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}