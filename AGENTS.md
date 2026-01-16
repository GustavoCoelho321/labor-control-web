# AGENTS.md - Contexto do Projeto "Labor Control System"

## 1. Visão Geral
Sistema Enterprise para gestão de produtividade e dimensionamento de mão de obra (Labor Planning).
- **Stack:** React 18 (Vite) + ASP.NET Core 8 Web API.
- **Design:** Premium/Clean, utilizando variáveis globais CSS (DHL Brand).

## 2. Regras de Arquitetura & Código
### Frontend (React)
- **Estilização:**
  - OBRIGATÓRIO: Use CSS Modules (`nome.module.css`) para layout.
  - OBRIGATÓRIO: Use variáveis globais do `src/styles/theme.css` (ex: `var(--primary-color)`, `var(--bg-card)`) para cores e fontes. Não hardcode cores HEX.
- **Estado:** Use `useState` para formulários locais e `useEffect` para cargas iniciais.
- **API:** Use `src/services/api.js` (Axios instance). Trate erros 401/403/500 com Toasts visuais.

### Backend (.NET)
- **Pattern:** Controller -> Service -> Repository/DbSet.
- **Regra de Ouro:** Controllers não devem ter lógica de negócio. A lógica fica no Service.
- **DTOs:** Request/Response devem ser tipados. Use `decimal` para horas e moeda.

## 3. Lógica de Negócio (Labor Planning) - CRÍTICO
O cálculo de headcount foi simplificado.
- **Fórmula:** `Headcount = Volume Ajustado / (MetaHora * HorasTurno)`
- **Volume Ajustado:** O usuário pode definir um "Fator de Volume" por processo.
  - Ex: Se o fator for 50% (0.5), consideramos apenas metade do volume total para aquele processo.
  - Padrão: 100% (1.0).

## 4. Contrato de Dados (DTOs)
**Request (Frontend -> Backend):**
```json
{
  "totalVolume": 10000,
  "workingHoursPerShift": 8.48, // Decimal
  "processShare": { "1": 0.5, "2": 0.5 }, // ID: % Share
  "processVolumeFactors": { "1": 1.0, "2": 0.5 } // ID: % Fator (Novo!)
}
