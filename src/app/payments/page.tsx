"use client";

import Topbar from '@/components/Topbar';
import { CreditCard, DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <>
      <Topbar title="Gestión de Pagos" />
      <div className="content-area">
        
        <div className="grid-cards">
          <div className="stat-card" style={{borderTop: '3px solid var(--c-success)'}}>
            <div className="stat-header">
              <span className="stat-title">Ingresos Mensuales</span>
              <DollarSign size={16} color="var(--c-success)" />
            </div>
            <div className="stat-value" style={{color: 'var(--c-success)'}}>S/. 0.00</div>
          </div>
          <div className="stat-card" style={{borderTop: '3px solid var(--c-danger)'}}>
            <div className="stat-header">
              <span className="stat-title">Deuda Total</span>
              <CreditCard size={16} color="var(--c-danger)" />
            </div>
            <div className="stat-value" style={{color: 'var(--c-danger)'}}>S/. 0.00</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            Cuentas por Cobrar
          </div>
          <div className="panel-body" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--c-muted)' }}>
            <CreditCard size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--c-text)', marginBottom: '8px' }}>El módulo de Pagos está en construcción</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto' }}>Aquí podrás registrar los abonos de los pacientes, ver sus saldos pendientes y enviar recordatorios de pago.</p>
          </div>
        </div>

      </div>
    </>
  );
}
