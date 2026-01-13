import api from './api';

// Service para gerenciar usuários
const userService = {
  // Buscar todos os usuários
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao buscar usuários';
    }
  },

  // Criar novo usuário
  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao criar usuário';
    }
  },

  // Atualizar usuário
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao atualizar usuário';
    }
  },

  // Deletar usuário
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao excluir usuário';
    }
  }
};

export default userService;