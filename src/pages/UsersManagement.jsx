import { useState, useEffect } from 'react';
import userService from '../services/userService';
import "../styles/UsersManagement.css";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
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
    // Validação
    if (!formData.name || !formData.email) {
      alert('Preencha nome e email');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('Preencha a senha para novos usuários');
      return;
    }

    try {
      // Monta o body - remove password se estiver vazio na edição
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
        <h2>Gerenciamento de Usuários</h2>
        <button className="btn-primary" onClick={handleCreate}>
          + Novo Usuário
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum usuário cadastrado ainda.</p>
          <button className="btn-primary" onClick={handleCreate}>
            Criar Primeiro Usuário
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
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user.id)}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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