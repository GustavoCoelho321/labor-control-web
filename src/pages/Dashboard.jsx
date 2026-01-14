import { Routes, Route, Navigate } from 'react-router-dom';
import Header from "../Components/Header";
import Sidebar from "../Components/SideBar";
import UsersManagement from "./UsersManagement";
import "../styles/Dashboard.css";
import ProcessesManagement from "./ProcessesManagement";

// Componente da tela principal
function DashboardHome() {
  return (
    <div className="dashboard-container">
      <h1>Bem-vindo ao Labor Control</h1>
      <p>Utilize o menu lateral para gerenciar usuários e montagem de scheduling.</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Usuários Ativos</h3>
            <p className="stat-number">24</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Produtividade Média</h3>
            <p className="stat-number">87%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Tarefas Concluídas</h3>
            <p className="stat-number">156</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Processos
function ProcessosManagement() {
  return (
    <div className="dashboard-container">
      <h1>Gerenciamento de Processos</h1>
      <p>Em desenvolvimento...</p>
    </div>
  );
}

// Componente de Scheduling
function Labor() {
  return (
    <div className="dashboard-container">
      <h1>Labor</h1>
      <p>Em desenvolvimento...</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <Header />
      
      <div className="main-layout">
        <Sidebar />
        
        <main className="main-content">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="processos" element={<ProcessesManagement />} />
            <Route path="labor" element={<Labor />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}