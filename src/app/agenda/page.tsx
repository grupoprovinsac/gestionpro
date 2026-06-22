"use client";

import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import { supabase } from '@/lib/supabase';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Date state
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    patient_id: '',
    professional_name: 'Dra. Principal',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    duration_minutes: 30,
    procedure_name: '',
    status: 'Programada'
  });

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  async function fetchData() {
    setLoading(true);
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      
      // Fetch patients for dropdown
      const { data: pats } = await supabase.from('patients').select('id, first_name, last_name, dni').eq('org_id', orgId);
      if (pats) setPatients(pats);

      // Fetch appointments for current month/week
      // For simplicity, we fetch all and filter client side
      const { data: apps } = await supabase
        .from('appointments')
        .select(`*, patients (first_name, last_name, dni)`)
        .eq('org_id', orgId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
        
      if (apps) setAppointments(apps);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (!orgs || orgs.length === 0) return;

    const { error } = await supabase.from('appointments').insert([
      { 
        org_id: orgs[0].id,
        ...formData
      }
    ]);

    if (!error) {
      setShowForm(false);
      fetchData();
      
      // Enviar correo de confirmación
      const p = patients.find(pat => pat.id === formData.patient_id);
      if (p && p.email) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: p.email,
            subject: 'Confirmación de Cita - GestionPro Dental',
            html: `<h3>Hola ${p.first_name},</h3><p>Tu cita para <strong>${formData.procedure_name || 'Consulta'}</strong> ha sido agendada para el <strong>${formData.date}</strong> a las <strong>${formData.start_time}</strong>.</p><p>Te esperamos.</p>`
          })
        });
      }

      setFormData({...formData, procedure_name: ''});
    } else {
      alert("Error al agendar cita: " + error.message);
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Atendida': return 'var(--c-success)';
      case 'Cancelada': return 'var(--c-danger)';
      default: return 'var(--c-primary)';
    }
  }

  return (
    <>
      <Topbar title="Agenda Clínica" />
      <div className="content-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--c-surface)', padding: '6px', borderRadius: 'var(--radius)', display: 'flex', gap: '4px' }}>
              <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }} style={{ background: 'transparent', border: 'none', color: 'var(--c-text)', cursor: 'pointer', padding: '4px' }}><ChevronLeft size={20}/></button>
              <div style={{ padding: '4px 12px', fontWeight: 600 }}>{currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }} style={{ background: 'transparent', border: 'none', color: 'var(--c-text)', cursor: 'pointer', padding: '4px' }}><ChevronRight size={20}/></button>
            </div>
            <button onClick={() => setCurrentDate(new Date())} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Hoy</button>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Nueva Cita
          </button>
        </div>

        {showForm && (
          <div className="panel" style={{ marginBottom: '24px', borderColor: 'var(--c-primary)' }}>
            <div className="panel-header" style={{ background: 'var(--c-surface2)' }}>
              Agendar Nueva Cita
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Paciente</label>
                  <select required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="">-- Seleccionar Paciente --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.dni})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Fecha</label>
                  <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Hora de Inicio</label>
                  <input required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} type="time" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Tratamiento / Motivo</label>
                  <input value={formData.procedure_name} onChange={e => setFormData({...formData, procedure_name: e.target.value})} type="text" placeholder="Ej: Profilaxis, Curación..." style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Estado</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="Programada">Programada</option>
                    <option value="Atendida">Atendida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary">Guardar Cita</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text)', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            Citas del día ({currentDate.toLocaleDateString()})
          </div>
          <div className="panel-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--c-muted)' }}>Cargando agenda...</div>
            ) : appointments.filter(a => a.date === currentDate.toISOString().split('T')[0]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-muted)' }}>
                <CalendarIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>No hay citas programadas para esta fecha.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.filter(a => a.date === currentDate.toISOString().split('T')[0]).map(app => (
                  <div key={app.id} style={{ display: 'flex', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ width: '6px', background: getStatusColor(app.status) }}></div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '18px', fontWeight: 700 }}>{app.start_time.substring(0,5)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{app.duration_minutes} min</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={14} color="var(--c-muted)" /> 
                            {app.patients?.first_name} {app.patients?.last_name}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--c-text-2)', marginTop: '4px' }}>
                            {app.procedure_name || 'Consulta General'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: 600,
                          background: `${getStatusColor(app.status)}20`,
                          color: getStatusColor(app.status)
                        }}>
                          {app.status}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--c-muted)', marginTop: '6px' }}>
                          Doctor: {app.professional_name}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
