import Topbar from '@/components/Topbar';
import { Users, Calendar, FileText, CreditCard, Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
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
    </>
  );
}
