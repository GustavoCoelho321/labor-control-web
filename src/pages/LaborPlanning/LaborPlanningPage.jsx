import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './LaborPlanningPage.module.css';

export default function LaborPlanningPage() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    totalVolume: '',
    workingHoursPerShift: '',
    workedHoursPercent: '',
    absPercent: ''
  });

  // Dynamic Shares State: { "processId": percentage_value }
  const [processShares, setProcessShares] = useState({});

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/processes');
      setProcesses(response.data);

      // Initialize shares with 0
      const initialShares = {};
      response.data.forEach(p => {
        initialShares[p.id] = 0;
      });
      setProcessShares(initialShares);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      alert('Erro ao carregar lista de processos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShareChange = (processId, value) => {
    setProcessShares(prev => ({
      ...prev,
      [processId]: parseFloat(value) || 0
    }));
  };

  const calculateTotalShare = () => {
    return Object.values(processShares).reduce((sum, val) => sum + (val || 0), 0);
  };

  const handleCalculate = async () => {
    // Validation
    const totalShare = calculateTotalShare();
    if (Math.abs(totalShare - 100) > 0.1) {
      alert(`A soma das distribuições deve ser 100%. Atual: ${totalShare.toFixed(1)}%`);
      return;
    }

    if (!formData.totalVolume || !formData.workingHoursPerShift || !formData.workedHoursPercent || !formData.absPercent) {
      alert('Por favor, preencha todos os campos gerais.');
      return;
    }

    setCalculating(true);
    setResults(null);

    try {
      // Prepare payload
      const payload = {
        totalVolume: parseFloat(formData.totalVolume),
        workingHoursPerShift: parseFloat(formData.workingHoursPerShift),
        workedHoursPercent: parseFloat(formData.workedHoursPercent) / 100, // Convert to 0-1
        absPercent: parseFloat(formData.absPercent) / 100, // Convert to 0-1
        processShare: {}
      };

      // Convert shares to 0-1 decimal
      Object.keys(processShares).forEach(key => {
        payload.processShare[key] = processShares[key] / 100;
      });

      const response = await api.post('/labor-planning/calculate', payload);
      setResults(response.data);
    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro ao calcular headcount. Verifique os dados e tente novamente.');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  const totalShare = calculateTotalShare();
  const isTotalValid = Math.abs(totalShare - 100) <= 0.1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Planejamento de Labor</h2>
        <p className={styles.subtitle}>Calcule o headcount necessário com base no volume e distribuição.</p>
      </div>

      <div className={styles.grid}>
        {/* General Parameters Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Parâmetros Gerais</h3>
          </div>

          <div className={styles.formGroup}>
            <label>Volume Total</label>
            <input
              type="number"
              name="totalVolume"
              className={styles.input}
              value={formData.totalVolume}
              onChange={handleInputChange}
              placeholder="Ex: 50000"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Horas por Turno</label>
            <input
              type="number"
              name="workingHoursPerShift"
              className={styles.input}
              value={formData.workingHoursPerShift}
              onChange={handleInputChange}
              placeholder="Ex: 8.48"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Eficiência Esperada (%)</label>
            <input
              type="number"
              name="workedHoursPercent"
              className={styles.input}
              value={formData.workedHoursPercent}
              onChange={handleInputChange}
              placeholder="Ex: 95"
              min="0"
              max="100"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Absenteísmo (%)</label>
            <input
              type="number"
              name="absPercent"
              className={styles.input}
              value={formData.absPercent}
              onChange={handleInputChange}
              placeholder="Ex: 3"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Process Distribution Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Distribuição de Volume (%)</h3>
          </div>

          {processes.map(process => (
            <div key={process.id} className={styles.inputRow}>
              <span className={styles.processName}>{process.name}</span>
              <div className={styles.percentInputGroup}>
                <input
                  type="number"
                  className={styles.input}
                  value={processShares[process.id]}
                  onChange={(e) => handleShareChange(process.id, e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className={styles.percentSymbol}>%</span>
              </div>
            </div>
          ))}

          <div className={styles.totalShare}>
            <span>Total Distribuído:</span>
            <span className={isTotalValid ? styles.validTotal : styles.invalidTotal}>
              {totalShare.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.calculateButton}
          onClick={handleCalculate}
          disabled={calculating || !isTotalValid}
        >
          {calculating ? 'Calculando...' : 'Calcular Headcount'}
        </button>
      </div>

      {results && (
        <div className={styles.resultsSection}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Processo</th>
                  <th>Volume Calculado</th>
                  <th>Headcount Necessário</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
                  <tr key={item.processId || index}>
                    <td>{item.processName}</td>
                    <td>{item.volume?.toLocaleString()}</td>
                    <td>{item.requiredHeadcount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
