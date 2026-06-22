"use client";

import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import { supabase } from '@/lib/supabase';
import { CreditCard, DollarSign, Search, Check, AlertCircle } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    concept: 'Abono de Tratamiento',
    method: 'Efectivo',
    status: 'Pagado'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      
      const { data: pats } = await supabase.from('patients').select('id, first_name, last_name, dni').eq('org_id', orgId);
      if (pats) setPatients(pats);

      const { data: pays } = await supabase
        .from('payments')
        .select(`*, patients (first_name, last_name)`)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
        
      if (pays) setPayments(pays);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1);
    
    if (orgError || !orgs || orgs.length === 0) {
      alert("Error de conexión");
      return;
    }

    const { error } = await supabase.from('payments').insert([
      { 
        org_id: orgs[0].id,
        patient_id: formData.patient_id,
        amount: parseFloat(formData.amount),
        concept: formData.concept,
        method: formData.method,
        status: formData.status
      }
    ]);

    if (!error) {
      setShowForm(false);
      setFormData({ ...formData, amount: '' });
      fetchData();
    } else {
      alert("Error al registrar pago: " + error.message);
    }
  }

  const totalIngresos = payments.filter(p => p.status === 'Pagado').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDeuda = payments.filter(p => p.status === 'Pendiente').reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <>
      <Topbar title="Gestión de Pagos" />
      <div className="content-area">
        
        <div className="grid-cards">
          <div className="stat-card" style={{borderTop: '3px solid var(--c-success)'}}>
            <div className="stat-header">
              <span className="stat-title">Ingresos Registrados</span>
              <DollarSign size={16} color="var(--c-success)" />
            </div>
            <div className="stat-value" style={{color: 'var(--c-success)'}}>S/. {totalIngresos.toFixed(2)}</div>
          </div>
          <div className="stat-card" style={{borderTop: '3px solid var(--c-danger)'}}>
            <div className="stat-header">
              <span className="stat-title">Cuentas Pendientes</span>
              <AlertCircle size={16} color="var(--c-danger)" />
            </div>
            <div className="stat-value" style={{color: 'var(--c-danger)'}}>S/. {totalDeuda.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Registrar Pago / Deuda</button>
        </div>

        {showForm && (
          <div className="panel" style={{ marginBottom: '24px', borderColor: 'var(--c-primary)' }}>
            <div className="panel-header" style={{ background: 'var(--c-surface2)' }}>
              Registrar Transacción
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Paciente</label>
                  <select required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="">-- Seleccionar Paciente --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Monto (S/.)</label>
                  <input required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} type="number" step="0.01" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Concepto</label>
                  <input required value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} type="text" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Método de Pago</label>
                  <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia / Yape</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="Pagado">Pagado (Ingreso)</option>
                    <option value="Pendiente">Pendiente (Deuda)</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary">Guardar Transacción</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text)', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            Historial de Transacciones
          </div>
          <div style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface2)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Fecha</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Paciente</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Concepto</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Estado</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-muted)' }}>Cargando datos...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-muted)' }}>No hay transacciones registradas.</td></tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--c-text-2)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 500 }}>{p.patients?.first_name} {p.patients?.last_name}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>{p.concept}<br/><span style={{fontSize:'12px', color:'var(--c-muted)'}}>{p.method}</span></td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          background: p.status === 'Pagado' ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                          color: p.status === 'Pagado' ? 'var(--c-success)' : 'var(--c-danger)'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: p.status === 'Pagado' ? 'var(--c-success)' : 'var(--c-danger)' }}>
                        S/. {Number(p.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
