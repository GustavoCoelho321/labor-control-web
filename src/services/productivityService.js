import api from './api';

// Service para gerenciar produtividade dos processos
const productivityService = {
  // Criar produtividade para um processo
  create: async (productivityData) => {
    try {
      const response = await api.post('/productivity', productivityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao criar produtividade';
    }
  },

  // Atualizar produtividade
  update: async (id, productivityData) => {
    try {
      const response = await api.put(`/productivity/${id}`, productivityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Erro ao atualizar produtividade';
    }
  },

  // Buscar produtividade de um processo específico
  getByProcess: async (processId) => {
    try {
      const response = await api.get(`/productivity/process/${processId}`);
      return response.data;
    } catch (error) {
      // Se não encontrar, retorna null ao invés de erro
      if (error.response?.status === 404) {
        return null;
      }
      throw error.response?.data || 'Erro ao buscar produtividade';
    }
  }
};

export default productivityService;