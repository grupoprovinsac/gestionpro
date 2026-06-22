"use client";

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  PieChart, 
  Settings,
  Plus,
  Menu,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity className="sidebar-logo" color="var(--c-primary)" />
          <div className="sidebar-title">
            GestionPro
            <span>CRM Dental</span>
          </div>
        </div>

        <div className="org-selector">
          <div className="org-icon"><Activity size={18} /></div>
          <div className="org-name">Grupo Provin SAC<br/><span style={{fontSize:'11px', color:'var(--c-text-2)', fontWeight:400}}>Clínica Principal</span></div>
        </div>

        <nav className="nav-menu">
          <div className="nav-group">Principal</div>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard /> Dashboard
          </div>

          <div className="nav-group">Clínico</div>
          <div className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <Users /> Pacientes
          </div>
          <div className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => setActiveTab('agenda')}>
            <Calendar /> Agenda
          </div>
          <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <FileText /> Historia Clínica
          </div>

          <div className="nav-group">Finanzas</div>
          <div className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <CreditCard /> Pagos
          </div>

          <div className="nav-group">Reportes</div>
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <PieChart /> Estadísticas
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <Menu size={20} color="var(--c-text-2)" />
            Dashboard
          </div>
          <button className="btn-primary">
            <Plus size={16} /> Nueva Cita
          </button>
        </header>

        <div className="content-area">
          {/* KPI Cards */}
          <div className="grid-cards">
            <div className="stat-card" style={{borderTop: '3px solid var(--c-primary)'}}>
              <div className="stat-header">
                <span className="stat-title">Pacientes Nuevos</span>
                <Users size={16} color="var(--c-muted)" />
              </div>
              <div className="stat-value">0</div>
              <div className="stat-sub">Este mes</div>
            </div>
            
            <div className="stat-card" style={{borderTop: '3px solid var(--c-success)'}}>
              <div className="stat-header">
                <span className="stat-title">Citas Hoy</span>
                <Calendar size={16} color="var(--c-muted)" />
              </div>
              <div className="stat-value">0</div>
              <div className="stat-sub">Programadas</div>
            </div>

            <div className="stat-card" style={{borderTop: '3px solid var(--c-warning)'}}>
              <div className="stat-header">
                <span className="stat-title">Ingresos del Mes</span>
                <CreditCard size={16} color="var(--c-muted)" />
              </div>
              <div className="stat-value" style={{color: 'var(--c-warning)'}}>S/. 0.00</div>
              <div className="stat-sub">Hoy: S/. 0.00</div>
            </div>

            <div className="stat-card" style={{borderTop: '3px solid var(--c-danger)'}}>
              <div className="stat-header">
                <span className="stat-title">Cobranza Pendiente</span>
                <FileText size={16} color="var(--c-muted)" />
              </div>
              <div className="stat-value" style={{color: 'var(--c-danger)'}}>S/. 0.00</div>
              <div className="stat-sub">Deudas activas</div>
            </div>
          </div>

          {/* Main Dashboard Panels */}
          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                Agenda de Hoy
              </div>
              <div className="panel-body" style={{textAlign: 'center', padding: '60px 20px', color: 'var(--c-muted)'}}>
                <Calendar size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                <p>No hay citas programadas para hoy</p>
                <button className="btn-primary" style={{marginTop: '16px'}}>
                  <Plus size={16} /> Agendar Cita
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                Próximos Pagos
              </div>
              <div className="panel-body" style={{textAlign: 'center', padding: '60px 20px', color: 'var(--c-muted)'}}>
                <CreditCard size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                <p>No hay deudas pendientes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
