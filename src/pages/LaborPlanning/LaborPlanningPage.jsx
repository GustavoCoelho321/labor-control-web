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
    workingHoursPerShift: ''
  });

  // Dynamic States: { "processId": percentage_value }
  const [processShares, setProcessShares] = useState({});
  const [processVolumeFactors, setProcessVolumeFactors] = useState({});

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/processes');
      setProcesses(response.data);

      const initialShares = {};
      const initialFactors = {};
      response.data.forEach(p => {
        initialShares[p.id] = 0;
        initialFactors[p.id] = 100; // Default 100%
      });
      setProcessShares(initialShares);
      setProcessVolumeFactors(initialFactors);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      alert('Erro ao carregar lista de processos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Basic validation to prevent negative typing if possible, though min attribute handles UI
    if (value && parseFloat(value) < 0) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShareChange = (processId, value) => {
    if (value && parseFloat(value) < 0) return;
    setProcessShares(prev => ({
      ...prev,
      [processId]: value
    }));
  };

  const handleFactorChange = (processId, value) => {
    if (value && parseFloat(value) < 0) return;
    setProcessVolumeFactors(prev => ({
      ...prev,
      [processId]: value
    }));
  };

  const calculateTotalShare = () => {
    return Object.values(processShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const handleCalculate = async () => {
    const totalShare = calculateTotalShare();
    if (Math.abs(totalShare - 100) > 0.1) {
      alert(`A soma das distribuições deve ser 100%. Atual: ${totalShare.toFixed(1)}%`);
      return;
    }

    if (!formData.totalVolume || !formData.workingHoursPerShift) {
      alert('Por favor, preencha todos os campos gerais.');
      return;
    }

    setCalculating(true);
    setResults(null);

    try {
      const payload = {
        totalVolume: parseInt(formData.totalVolume),
        workingHoursPerShift: parseFloat(formData.workingHoursPerShift),
        processShare: {},
        processVolumeFactors: {}
      };

      // Convert inputs to decimals (0-1)
      Object.keys(processShares).forEach(key => {
        payload.processShare[key] = (parseFloat(processShares[key]) || 0) / 100;
      });

      Object.keys(processVolumeFactors).forEach(key => {
        payload.processVolumeFactors[key] = (parseFloat(processVolumeFactors[key]) || 0) / 100;
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
    return <div className={styles.loading}>Carregando processos...</div>;
  }

  const totalShare = calculateTotalShare();
  const isTotalValid = Math.abs(totalShare - 100) <= 0.1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Planejamento de Labor</h2>
        <p className={styles.subtitle}>Calcule o headcount necessário considerando distribuição e fatores de volume.</p>
      </div>

      <div className={styles.grid}>
        {/* Global Parameters Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Parâmetros Globais</h3>
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
              min="0"
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
              min="0"
            />
          </div>
        </div>

        {/* Process List Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Distribuição e Fatores</h3>
          </div>

          <div className={styles.processList}>
            {processes.map(process => (
              <div key={process.id} className={styles.processItem}>
                <span className={styles.processName}>{process.name}</span>

                <div className={styles.processInputs}>
                  {/* Share Input */}
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>Share (%)</span>
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

                  {/* Consideration Factor Input */}
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>Fator Cons. (%)</span>
                    <div className={styles.percentInputGroup}>
                      <input
                        type="number"
                        className={styles.input}
                        value={processVolumeFactors[process.id]}
                        onChange={(e) => handleFactorChange(process.id, e.target.value)}
                        placeholder="100"
                        min="0"
                      />
                      <span className={styles.percentSymbol}>%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totalShare}>
            <span>Total Share:</span>
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
                  <th>Volume Ajustado</th>
                  <th>Headcount Sugerido</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
                  <tr key={item.processName || index}>
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
