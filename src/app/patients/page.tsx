"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Search, Mail, Phone, Calendar } from 'lucide-react';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    dni: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    // Asumimos que el org_id de "Grupo Provin SAC" es el único por ahora
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (orgs && orgs.length > 0) {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('org_id', orgs[0].id)
        .order('created_at', { ascending: false });
      
      if (data) setPatients(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1);
    
    if (orgError) {
      alert("Error de conexión con la base de datos: " + orgError.message);
      return;
    }
    
    if (!orgs || orgs.length === 0) {
      alert("Error crítico: No se encontró la organización en la base de datos. Verifica la conexión.");
      return;
    }

    const { error } = await supabase.from('patients').insert([
      { 
        org_id: orgs[0].id,
        ...formData
      }
    ]);

    if (!error) {
      setShowForm(false);
      setFormData({ dni: '', first_name: '', last_name: '', phone: '', email: '' });
      fetchPatients();
    } else {
      alert("Error al guardar paciente: " + error.message);
    }
  }

  return (
    <>
      <Topbar title="Pacientes" />
      <div className="content-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--c-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por DNI o Nombre..." 
              style={{
                width: '100%',
                padding: '8px 16px 8px 36px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius)',
                color: 'var(--c-text)',
                outline: 'none'
              }}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Nuevo Paciente
          </button>
        </div>

        {showForm && (
          <div className="panel" style={{ marginBottom: '24px', borderColor: 'var(--c-primary)' }}>
            <div className="panel-header" style={{ background: 'var(--c-surface2)' }}>
              Registrar Nuevo Paciente
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>DNI</label>
                  <input required value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} type="text" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}></div> {/* Spacer */}
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Nombres</label>
                  <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} type="text" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Apellidos</label>
                  <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} type="text" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Teléfono</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="text" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Correo (Opcional)</label>
                  <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary">Guardar Paciente</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text)', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            Directorio de Pacientes
          </div>
          <div style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface2)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>DNI</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Paciente</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Contacto</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Registro</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-muted)' }}>Cargando datos...</td></tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--c-muted)' }}>
                      <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>Aún no hay pacientes registrados.</p>
                    </td>
                  </tr>
                ) : (
                  patients.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => router.push(`/patients/${p.id}`)}
                      style={{ borderBottom: '1px solid var(--c-border)', transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--c-surface2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontFamily: 'monospace' }}>{p.dni}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 500 }}>{p.first_name} {p.last_name}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--c-text-2)' }}>
                        {p.phone && <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Phone size={12}/> {p.phone}</div>}
                        {p.email && <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'4px'}}><Mail size={12}/> {p.email}</div>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--c-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString()}
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
