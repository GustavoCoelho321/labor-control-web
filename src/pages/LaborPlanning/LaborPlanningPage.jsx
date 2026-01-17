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
    inboundVolume: '',
    outboundVolume: '',
    workingHoursPerShift: ''
  });

  // Dynamic States: { "processId": percentage_value }
  // processShares removed as it is now fixed to 100% (1.0)
  const [processVolumeFactors, setProcessVolumeFactors] = useState({});

  useEffect(() => {
    fetchProcesses();
  }, []);

  const determineProcessType = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('recebimento') || lowerName.includes('putaway') || lowerName.includes('inbound')) {
      return 'INBOUND';
    }
    return 'OUTBOUND';
  };

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/processes');
      setProcesses(response.data);

      const initialFactors = {};
      response.data.forEach(p => {
        initialFactors[p.id] = 100; // Default 100%
      });
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

  const handleFactorChange = (processId, value) => {
    if (value && parseFloat(value) < 0) return;
    setProcessVolumeFactors(prev => ({
      ...prev,
      [processId]: value
    }));
  };

  const handleCalculate = async () => {
    if (!formData.inboundVolume || !formData.outboundVolume || !formData.workingHoursPerShift) {
      alert('Por favor, preencha todos os campos gerais (Volumes e Horas).');
      return;
    }

    setCalculating(true);
    setResults(null);

    try {
      const payload = {
        inboundVolume: parseInt(formData.inboundVolume),
        outboundVolume: parseInt(formData.outboundVolume),
        workingHoursPerShift: parseFloat(formData.workingHoursPerShift),
        processShare: {},
        processVolumeFactors: {}
      };

      // Fill processShare with 1.0 (100%) for all processes
      processes.forEach(p => {
        payload.processShare[p.id] = 1.0;
      });

      // Convert factors to decimals (0-1)
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

  // Calculate total volume for display
  const totalVolume = (parseInt(formData.inboundVolume) || 0) + (parseInt(formData.outboundVolume) || 0);

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

          <div className={styles.globalParamsGrid}>
            <div className={styles.formGroup}>
              <label>Volume Inbound</label>
              <input
                type="number"
                name="inboundVolume"
                className={styles.input}
                value={formData.inboundVolume}
                onChange={handleInputChange}
                placeholder="Ex: 15000"
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Volume Outbound</label>
              <input
                type="number"
                name="outboundVolume"
                className={styles.input}
                value={formData.outboundVolume}
                onChange={handleInputChange}
                placeholder="Ex: 25000"
                min="0"
              />
            </div>

             <div className={styles.volumeSummary}>
                <span className={styles.volumeSummaryLabel}>Total Geral</span>
                <span className={styles.volumeSummaryValue}>{totalVolume.toLocaleString()}</span>
            </div>
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
            {processes.map(process => {
               const type = determineProcessType(process.name);
               const badgeClass = type === 'INBOUND' ? styles.badgeInbound : styles.badgeOutbound;

               return (
                  <div key={process.id} className={styles.processItem}>
                    <div className={styles.processInfo}>
                        <span className={styles.processName}>{process.name}</span>
                        <span className={`${styles.badge} ${badgeClass}`}>{type}</span>
                    </div>

                    <div className={styles.processInputs}>
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
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.calculateButton}
          onClick={handleCalculate}
          disabled={calculating}
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
                  <th>Área</th>
                  <th>Volume Aplicado</th>
                  <th>HC Operacional</th>
                  <th className={styles.supportHeader}>HC Apoio</th>
                  <th>Total HC</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => {
                  const type = determineProcessType(item.processName);
                  const reqHc = item.requiredHeadcount || 0;
                  const supHc = item.supportHeadcount || 0;
                  const totalHc = reqHc + supHc;

                  return (
                    <tr key={item.processName || index}>
                      <td>{item.processName}</td>
                      <td>
                        <span className={`${styles.badge} ${type === 'INBOUND' ? styles.badgeInbound : styles.badgeOutbound}`}>
                            {type}
                        </span>
                      </td>
                      <td>{item.volume?.toLocaleString()}</td>
                      <td>{reqHc.toFixed(2)}</td>
                      <td className={styles.supportCell}>{supHc.toFixed(2)}</td>
                      <td><strong>{totalHc.toFixed(2)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
