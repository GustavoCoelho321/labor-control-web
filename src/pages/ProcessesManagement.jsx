import { useState, useEffect } from 'react';
import processService from '../services/processService';
import productivityService from '../services/productivityService';
import "../styles/ProcessesManagement.css";

export default function ProcessesManagement() {
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [productivityData, setProductivityData] = useState({
    processId: 0,
    targetPerHour: 0,
    fatigueFactor: 0,
    displacementTimeMinutes: 0
  });

  // Buscar processos ao carregar
  useEffect(() => {
    fetchProcesses();
  }, []);

  // Filtrar processos quando o termo de busca muda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProcesses(processes);
    } else {
      const filtered = processes.filter(process => 
        process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProcesses(filtered);
    }
  }, [searchTerm, processes]);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const data = await processService.getAll();
      setProcesses(data);
      setFilteredProcesses(data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      alert('Erro ao carregar processos: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProcess(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (process) => {
    setEditingProcess(process);
    setFormData({ 
      name: process.name, 
      description: process.description || '' 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este processo?')) return;

    try {
      await processService.delete(id);
      alert('Processo excluído com sucesso!');
      fetchProcesses();
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      alert('Erro ao excluir processo: ' + error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Preencha o nome do processo');
      return;
    }

    try {
      if (editingProcess) {
        await processService.update(editingProcess.id, formData);
        alert('Processo atualizado com sucesso!');
      } else {
        await processService.create(formData);
        alert('Processo criado com sucesso!');
      }

      setShowModal(false);
      fetchProcesses();
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      alert('Erro ao salvar processo: ' + error);
    }
  };

  const handleManageProductivity = async (process) => {
    setSelectedProcess(process);
    
    try {
      const productivity = await productivityService.getByProcess(process.id);
      
      if (productivity) {
        setProductivityData({
          processId: process.id,
          targetPerHour: productivity.targetPerHour,
          fatigueFactor: productivity.fatigueFactor,
          displacementTimeMinutes: productivity.displacementTimeMinutes,
          id: productivity.id
        });
      } else {
        setProductivityData({
          processId: process.id,
          targetPerHour: 0,
          fatigueFactor: 0,
          displacementTimeMinutes: 0
        });
      }
      
      setShowProductivityModal(true);
    } catch (error) {
      console.error('Erro ao buscar produtividade:', error);
      alert('Erro ao carregar produtividade: ' + error);
    }
  };

  const handleProductivitySubmit = async () => {
    if (productivityData.targetPerHour <= 0) {
      alert('Meta por hora deve ser maior que zero');
      return;
    }

    try {
      if (productivityData.id) {
        await productivityService.update(productivityData.id, productivityData);
        alert('Produtividade atualizada com sucesso!');
      } else {
        await productivityService.create(productivityData);
        alert('Produtividade criada com sucesso!');
      }

      setShowProductivityModal(false);
      fetchProcesses();
    } catch (error) {
      console.error('Erro ao salvar produtividade:', error);
      alert('Erro ao salvar produtividade: ' + error);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="processes-management">
        <div className="loading">Carregando processos...</div>
      </div>
    );
  }

  return (
    <div className="processes-management">
      <div className="page-header">
        <div className="header-left">
          <h2>Gerenciamento de Processos</h2>
          <p className="subtitle">
            {filteredProcesses.length} {filteredProcesses.length === 1 ? 'processo encontrado' : 'processos encontrados'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="btn-icon">+</span>
          Novo Processo
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
            placeholder="Buscar processos..."
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
        {searchTerm && filteredProcesses.length === 0 && (
          <p className="no-results">
            Nenhum resultado encontrado para "<strong>{searchTerm}</strong>"
          </p>
        )}
      </div>

      {processes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛠️</div>
          <p>Nenhum processo cadastrado ainda.</p>
          <button className="btn-primary" onClick={handleCreate}>
            Criar Primeiro Processo
          </button>
        </div>
      ) : filteredProcesses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>Nenhum processo corresponde à sua busca</p>
          <button className="btn-secondary" onClick={clearSearch}>
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="processes-grid">
          {filteredProcesses.map((process, index) => (
            <div key={process.id} className="process-card" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="process-header">
                <div className="process-icon">🛠️</div>
                <div className="process-badge">ID: {process.id}</div>
              </div>
              <div className="process-body">
                <h3 className="process-name">{process.name}</h3>
                <p className="process-description">
                  {process.description || 'Sem descrição'}
                </p>
              </div>
              <div className="process-footer">
                <button 
                  className="btn-productivity"
                  onClick={() => handleManageProductivity(process)}
                  title="Gerenciar produtividade"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Produtividade
                </button>
                <button 
                  className="btn-edit-small"
                  onClick={() => handleEdit(process)}
                  title="Editar processo"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  className="btn-delete-small"
                  onClick={() => handleDelete(process.id)}
                  title="Excluir processo"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Processo */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProcess ? 'Editar Processo' : 'Novo Processo'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Processo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Montagem de peças"
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o processo..."
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button className="btn-submit" onClick={handleSubmit}>
                  {editingProcess ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Produtividade */}
      {showProductivityModal && (
        <div className="modal-overlay" onClick={() => setShowProductivityModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Produtividade: {selectedProcess?.name}</h3>
              <button className="modal-close" onClick={() => setShowProductivityModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Meta por Hora *</label>
                <input
                  type="number"
                  value={productivityData.targetPerHour}
                  onChange={e => setProductivityData({...productivityData, targetPerHour: parseFloat(e.target.value)})}
                  placeholder="Ex: 50"
                  min="0"
                  step="0.1"
                />
                <small>Quantidade esperada de itens por hora</small>
              </div>
              <div className="form-group">
                <label>Fator de Fadiga *</label>
                <input
                  type="number"
                  value={productivityData.fatigueFactor}
                  onChange={e => setProductivityData({...productivityData, fatigueFactor: parseFloat(e.target.value)})}
                  placeholder="Ex: 0.9"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <small>Valor entre 0 e 1 (ex: 0.9 = 90% de eficiência)</small>
              </div>
              <div className="form-group">
                <label>Tempo de Deslocamento (minutos) *</label>
                <input
                  type="number"
                  value={productivityData.displacementTimeMinutes}
                  onChange={e => setProductivityData({...productivityData, displacementTimeMinutes: parseInt(e.target.value)})}
                  placeholder="Ex: 5"
                  min="0"
                />
                <small>Tempo médio de movimentação em minutos</small>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowProductivityModal(false)}>
                  Cancelar
                </button>
                <button className="btn-submit" onClick={handleProductivitySubmit}>
                  {productivityData.id ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}