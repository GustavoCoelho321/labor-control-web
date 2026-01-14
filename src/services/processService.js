import api from './api';

// Service para gerenciar processos
const processService = {
  // Buscar todos os processos
  getAll: async () => {
    try {
      const response = await api.get('/processes');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao buscar processos';
    }
  },

  // Criar novo processo
  create: async (processData) => {
    try {
      const response = await api.post('/processes', processData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao criar processo';
    }
  },

  // Atualizar processo
  update: async (id, processData) => {
    try {
      const response = await api.put(`/processes/${id}`, processData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao atualizar processo';
    }
  },

  // Deletar processo (soft delete - apenas inativa)
  delete: async (id) => {
    try {
      const response = await api.delete(`/processes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao excluir processo';
    }
  }
};

export default processService;