import api from './api';

const subProcessService = {
  // Buscar subprocessos por processo
  getByProcess: async (processId) => {
    try {
      console.log('🔍 Buscando subprocessos para processo:', processId);
      const response = await api.get(`/subProcesses/process/${processId}`);
      console.log('✅ Subprocessos carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar subprocessos:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  // Criar subprocesso
  create: async (data) => {
    try {
      console.log('➕ Criando subprocesso:', data);
      const response = await api.post('/subProcesses', data);
      console.log('✅ Subprocesso criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar subprocesso:', error);
      throw error;
    }
  },

  // Atualizar subprocesso
  update: async (id, data) => {
    try {
      console.log('📝 Atualizando subprocesso:', id, data);
      const response = await api.put(`/subProcesses/${id}`, data);
      console.log('✅ Subprocesso atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar subprocesso:', error);
      throw error;
    }
  },

  // Deletar subprocesso
  delete: async (id) => {
    try {
      console.log('🗑️ Deletando subprocesso:', id);
      const response = await api.delete(`/subProcesses/${id}`);
      console.log('✅ Subprocesso deletado');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao deletar subprocesso:', error);
      throw error;
    }
  }
};

export default subProcessService;