import { useState } from 'react';
import processService from '../../../services/processService';
import { useToast } from '../../../context/ToastContext';

export function useProcessForm(fetchProcesses) {
  const [showModal, setShowModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const toast = useToast();

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

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Preencha o nome do processo');
      return;
    }
    try {
      if (editingProcess) {
        await processService.update(editingProcess.id, formData);
        toast.success('Processo atualizado!');
      } else {
        await processService.create(formData);
        toast.success('Processo criado!');
      }
      setShowModal(false);
      fetchProcesses();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar processo');
    }
  };

  return {
    showModal,
    setShowModal,
    editingProcess,
    formData,
    setFormData,
    handleCreate,
    handleEdit,
    handleSubmit
  };
}
