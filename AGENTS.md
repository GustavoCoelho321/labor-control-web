# AGENTS.md - Contexto do Projeto "Labor Control System"

## 1. Visão Geral
Sistema Enterprise para gestão de produtividade e dimensionamento de mão de obra (Labor Planning).
- **Stack:** React 18 (Vite) + ASP.NET Core 8 Web API.
- **Design System:** DHL Brand (Amarelo `#FFCC00`, Vermelho `#D40511`, Navy `#0B1221`).
- **Layout:** Sidebar fixa à esquerda, Header fixo no topo, tem o arquivo theme.css com os temas e cores que deve usar, também o dashboard css, tenho os aquivos contendo a header e a sider bar que são os SideBar.jsx e Header.jsx
-

## 2. Contrato de API (Backend Atualizado)
O endpoint de cálculo (`POST /api/labor-planning/calculate`) foi evoluído.

### Request (O que o Front envia):
```json
{
  "inboundVolume": 15000,    // Volume específico de entrada
  "outboundVolume": 25000,   // Volume específico de saída
  "workingHoursPerShift": 8.48, // Decimal aceito
  "processShare": { "1": 1.0, "2": 1.0 }, // Enviar 1.0 para todos os processos listados
  "processVolumeFactors": { "1": 1.0 }    // Fator de redução opcional (0.0 a 1.0)
}

### Response (O que o Front recebe):
```JSON
  {
    "processName": "Picking",
    "volume": 25000,
    "requiredHeadcount": 105.28,  // HC Operacional Direto
    "supportHeadcount": 12.5      // HC de Apoio (Runners, Abastecedores) - NOVO!
  }
