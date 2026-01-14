import { useState, useEffect } from 'react';
import processService from '../services/processService';
import productivityService from '../services/productivityService';
import subProcessService from '../services/subProcessService'; // Novo import necessário
import "../styles/ProcessesManagement.css";

export default function ProcessesManagement() {
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [showSubProcessesModal, setShowSubProcessesModal] = useState(false);
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
    displacementTimeMinutes: 0,
    id: null
  });

  // Estados para Subprocessos
  const [subProcesses, setSubProcesses] = useState([]);
  const [subFormData, setSubFormData] = useState({
    name: '',
    description: '',
    standardTimeMinutes: 0
  });
  const [editingSubProcess, setEditingSubProcess] = useState(null);

  // Carregar processos
  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProcesses(processes);
    } else {
      const filtered = processes.filter(process =>
        process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (process.description && process.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
      alert('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  // Funções de Processo (criar/editar/excluir) - mantidas iguais
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
    if (!window.confirm('Tem certeza que deseja excluir este processo?')) return;
    try {
      await processService.delete(id);
      alert('Processo excluído com sucesso!');
      fetchProcesses();
    } catch (error) {
      alert('Erro ao excluir processo');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Preencha o nome do processo');
      return;
    }
    try {
      if (editingProcess) {
        await processService.update(editingProcess.id, formData);
        alert('Processo atualizado!');
      } else {
        await processService.create(formData);
        alert('Processo criado!');
      }
      setShowModal(false);
      fetchProcesses();
    } catch (error) {
      alert('Erro ao salvar processo');
    }
  };

  // Produtividade - mantida igual e funcionando
  const handleManageProductivity = async (process) => {
    setSelectedProcess(process);
    try {
      const productivity = await productivityService.getByProcess(process.id);
      setProductivityData({
        id: productivity?.id || null,
        processId: process.id,
        targetPerHour: productivity?.targetPerHour || 0,
        fatigueFactor: productivity?.fatigueFactor || 0,
        displacementTimeMinutes: productivity?.displacementTimeMinutes || 0
      });
      setShowProductivityModal(true);
    } catch (error) {
      alert('Erro ao carregar produtividade');
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
        alert('Produtividade atualizada!');
      } else {
        await productivityService.create(productivityData);
        alert('Produtividade criada!');
      }
      setShowProductivityModal(false);
    } catch (error) {
      alert('Erro ao salvar produtividade');
    }
  };

  // NOVO: Subprocessos
  const handleManageSubProcesses = async (process) => {
    setSelectedProcess(process);
    try {
      const subs = await subProcessService.getByProcess(process.id);
      setSubProcesses(subs || []);
      setShowSubProcessesModal(true);
    } catch (error) {
      alert('Erro ao carregar subprocessos');
    }
  };

  const handleSubCreate = () => {
    setEditingSubProcess(null);
    setSubFormData({ name: '', description: '', standardTimeMinutes: 0 });
  };

  const handleSubEdit = (sub) => {
    setEditingSubProcess(sub);
    setSubFormData({
      name: sub.name,
      description: sub.description || '',
      standardTimeMinutes: sub.standardTimeMinutes
    });
  };

  const handleSubDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este subprocesso?')) return;
    try {
      await subProcessService.delete(id);
      const updated = await subProcessService.getByProcess(selectedProcess.id);
      setSubProcesses(updated);
      alert('Subprocesso excluído!');
    } catch (error) {
      alert('Erro ao excluir subprocesso');
    }
  };

  const handleSubSubmit = async () => {
    if (!subFormData.name.trim() || subFormData.standardTimeMinutes <= 0) {
      alert('Preencha nome e tempo padrão (maior que 0)');
      return;
    }
    try {
      const payload = {
        ...subFormData,
        processId: selectedProcess.id
      };
      if (editingSubProcess) {
        await subProcessService.update(editingSubProcess.id, payload);
        alert('Subprocesso atualizado!');
      } else {
        await subProcessService.create(payload);
        alert('Subprocesso criado!');
      }
      const updated = await subProcessService.getByProcess(selectedProcess.id);
      setSubProcesses(updated);
      handleSubCreate();
    } catch (error) {
      alert('Erro ao salvar subprocesso');
    }
  };

  const clearSearch = () => setSearchTerm('');

  if (loading) {
    return <div className="processes-management"><div className="loading">Carregando processos...</div></div>;
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
          <span className="btn-icon">+</span> Novo Processo
        </button>
      </div>

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
          <p className="no-results">Nenhum resultado encontrado para "<strong>{searchTerm}</strong>"</p>
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
            <div key={process.id} className="process-card" style={{ animationDelay: `${index * 0.1}s` }}>
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
                  className="btn-subprocesses"
                  onClick={() => handleManageSubProcesses(process)}
                  title="Gerenciar subprocessos"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9zM5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
                  </svg>
                  Subprocessos
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
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
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
              <button className="modal-close" onClick={() => setShowProductivityModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Meta por Hora *</label>
                <input
                  type="number"
                  value={productivityData.targetPerHour}
                  onChange={e => setProductivityData({...productivityData, targetPerHour: parseFloat(e.target.value) || 0})}
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
                  onChange={e => setProductivityData({...productivityData, fatigueFactor: parseFloat(e.target.value) || 0})}
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
                  onChange={e => setProductivityData({...productivityData, displacementTimeMinutes: parseInt(e.target.value) || 0})}
                  placeholder="Ex: 5"
                  min="0"
                />
                <small>Tempo médio de movimentação em minutos</small>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowProductivityModal(false)}>Cancelar</button>
                <button className="btn-submit" onClick={handleProductivitySubmit}>
                  {productivityData.id ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subprocessos */}
      {showSubProcessesModal && (
        <div className="modal-overlay" onClick={() => setShowSubProcessesModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subprocessos: {selectedProcess?.name}</h3>
              <button className="modal-close" onClick={() => setShowSubProcessesModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {subProcesses.length > 0 ? (
                <div className="sub-list">
                  {subProcesses.map(sub => (
                    <div key={sub.id} className="sub-item">
                      <div className="sub-info">
                        <strong>{sub.name}</strong>
                        <span>{sub.standardTimeMinutes} min</span>
                        <p>{sub.description || 'Sem descrição'}</p>
                      </div>
                      <div className="sub-actions">
                        <button className="btn-edit-small" onClick={() => handleSubEdit(sub)}>Editar</button>
                        <button className="btn-delete-small" onClick={() => handleSubDelete(sub.id)}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-subs">Nenhum subprocesso cadastrado para este processo.</p>
              )}

              <div className="sub-form">
                <h4>{editingSubProcess ? 'Editar Subprocesso' : 'Novo Subprocesso'}</h4>
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={subFormData.name}
                    onChange={e => setSubFormData({...subFormData, name: e.target.value})}
                    placeholder="Ex: Verificação final"
                  />
                </div>
                <div className="form-group">
                  <label>Tempo Padrão (minutos) *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={subFormData.standardTimeMinutes}
                    onChange={e => setSubFormData({...subFormData, standardTimeMinutes: parseFloat(e.target.value) || 0})}
                    placeholder="Ex: 2.5"
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    value={subFormData.description}
                    onChange={e => setSubFormData({...subFormData, description: e.target.value})}
                    placeholder="Detalhes do subprocesso..."
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={handleSubCreate}>
                    {editingSubProcess ? 'Cancelar Edição' : 'Limpar'}
                  </button>
                  <button className="btn-submit" onClick={handleSubSubmit}>
                    {editingSubProcess ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}