# AGENTS.md - Contexto do Projeto "Sistema de Gestão Industrial"

## 1. Visão Geral
Sistema fullstack para gestão de produtividade industrial.
- **Frontend:** React 18 (Vite), Axios, CSS Modules.
- **Backend:** ASP.NET Core Web API, SQL Server, EF Core.

## 2. Regras de Arquitetura (Enterprise)
### Backend (.NET)
- **Pattern:** Clean Architecture simplificada (Controllers -> Services -> Repositories -> Context).
- **Dados:** NUNCA retorne a Entidade (Model) no Controller. Use DTOs e AutoMapper.
- **Segurança:** Implementar JWT (Stateless). Senhas com hash.
- **Validação:** Use FluentValidation para validar DTOs de entrada.
- **Erros:** Use um Middleware Global de Tratamento de Erros (não use try/catch em todo lugar).

### Frontend (React)
- **Estrutura:** Feature-based (ex: `/pages/Process/components`, `/pages/Process/hooks`).
- **API:** Use uma instância única do Axios (`api.js`) com Interceptors para injetar o Token JWT.
- **Estilo:** CSS Modules obrigatório (`styles.module.css`). Nada de CSS global ou inline.
- **Estado:** Prefira React Query ou Context API para dados globais de usuário.

## 3. Entidades Chave (Referência Cruzada)
- **Process:** Pai de SubProcess e ProcessProductivity.
- **Employee:** Gera WorkHour.
- **WorkHour:** Liga Employee a Process.

## 4. Tarefa Atual
Refatoração para padrão Enterprise, focando em segurança (JWT), desacoplamento (Services/Repository) e limpeza de código (Clean Code).
