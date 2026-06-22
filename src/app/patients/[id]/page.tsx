"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import { ChevronLeft, User, Phone, Mail, Calendar, FileText, Activity, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Clinical Notes State
  const [showNoteForm, setShowNoteForm] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (id) fetchPatientData();
  }, [id]);

  async function fetchPatientData() {
    setLoading(true);
    
    // Fetch patient info
    const { data: pData } = await supabase.from('patients').select('*').eq('id', id).single();
    if (pData) setPatient(pData);

    // Fetch patient appointments/history
    const { data: aData } = await supabase.from('appointments').select('*').eq('patient_id', id).order('date', { ascending: false });
    if (aData) setAppointments(aData);

    // Fetch documents
    const { data: dData } = await supabase.from('documents').select('*').eq('patient_id', id).order('created_at', { ascending: false });
    if (dData) setDocuments(dData);

    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);

    if (uploadError) {
      alert("Error al subir archivo (Asegúrate de haber creado el bucket 'documents' en Supabase): " + uploadError.message);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);

    // Save record in database
    await supabase.from('documents').insert([
      { patient_id: id, name: file.name, url: publicUrlData.publicUrl }
    ]);

    fetchPatientData();
    setUploading(false);
  }

  async function saveNote(appointmentId: string) {
    if (!noteContent.trim()) return;
    
    // Aquí actualizaríamos el registro de la cita con las notas de evolución
    const { error } = await supabase
      .from('appointments')
      .update({ notes: noteContent })
      .eq('id', appointmentId);
      
    if (!error) {
      setShowNoteForm(null);
      setNoteContent('');
      fetchPatientData(); // Recargar datos
    } else {
      alert("Error al guardar nota: " + error.message);
    }
  }

  if (loading) return <div style={{padding: '40px', color: 'var(--c-text-2)'}}>Cargando paciente...</div>;
  if (!patient) return <div style={{padding: '40px', color: 'var(--c-danger)'}}>Paciente no encontrado</div>;

  return (
    <>
      <Topbar title={`Historia Clínica: ${patient.first_name}`} />
      <div className="content-area">
        
        <Link href="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--c-text-2)', textDecoration: 'none', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
          <ChevronLeft size={16} /> Volver a Pacientes
        </Link>

        <div className="dashboard-grid">
          
          {/* Columna Izquierda: Datos del Paciente */}
          <div>
            <div className="panel" style={{ marginBottom: '20px' }}>
              <div className="panel-header">
                Datos Personales
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--c-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-muted)' }}>
                    <User size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{patient.first_name} {patient.last_name}</h2>
                    <div style={{ color: 'var(--c-text-2)', fontSize: '14px', marginTop: '4px' }}>DNI: {patient.dni}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--c-text)' }}>
                    <Phone size={16} color="var(--c-muted)" /> {patient.phone || 'No registrado'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--c-text)' }}>
                    <Mail size={16} color="var(--c-muted)" /> {patient.email || 'No registrado'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--c-text)' }}>
                    <Calendar size={16} color="var(--c-muted)" /> Registrado: {new Date(patient.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                Archivos y Documentos
              </div>
              <div className="panel-body">
                {documents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <FileText size={32} style={{ margin: '0 auto 12px', color: 'var(--c-muted)' }} />
                    <div style={{ fontSize: '13px', color: 'var(--c-text-2)', marginBottom: '16px' }}>No hay archivos adjuntos.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {documents.map(doc => (
                      <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--c-surface2)', borderRadius: '6px', color: 'var(--c-text)', textDecoration: 'none', fontSize: '13px', border: '1px solid var(--c-border)' }}>
                        <FileText size={16} color="var(--c-primary)" />
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
                      </a>
                    ))}
                  </div>
                )}
                
                <div style={{ textAlign: 'center' }}>
                  <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                  <label htmlFor="file-upload" className="btn-primary" style={{ background: 'var(--c-surface2)', color: 'var(--c-text)', cursor: uploading ? 'not-allowed' : 'pointer', display: 'inline-block', width: '100%' }}>
                    {uploading ? 'Subiendo...' : 'Subir Nuevo Archivo'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Historial y Evolución */}
          <div>
            <div className="panel">
              <div className="panel-header">
                Historial de Atenciones
              </div>
              <div className="panel-body">
                {appointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--c-muted)' }}>
                    <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p>No hay atenciones registradas para este paciente.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {appointments.map(app => (
                      <div key={app.id} style={{ borderLeft: `2px solid var(--c-primary)`, paddingLeft: '16px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--c-primary)' }}></div>
                        
                        <div style={{ fontSize: '12px', color: 'var(--c-text-2)', fontWeight: 600, marginBottom: '4px' }}>
                          {new Date(app.date).toLocaleDateString()} • {app.start_time.substring(0,5)}
                        </div>
                        
                        <div style={{ background: 'var(--c-surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--c-border)' }}>
                          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            {app.procedure_name || 'Consulta General'}
                            <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>{app.status}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--c-text-2)', lineHeight: 1.5 }}>
                            <strong>Doctor:</strong> {app.professional_name}
                          </div>
                          
                          {/* Notas de evolución */}
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--c-border)', fontSize: '13px', color: 'var(--c-text)' }}>
                            {app.notes ? (
                              <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                <strong>Evolución Médica:</strong><br/>
                                {app.notes}
                              </div>
                            ) : (
                              <em style={{ color: 'var(--c-text-2)' }}>No hay notas clínicas registradas para esta cita.</em>
                            )}
                          </div>
                          
                          {showNoteForm === app.id ? (
                            <div style={{ marginTop: '12px' }}>
                              <textarea 
                                value={noteContent}
                                onChange={e => setNoteContent(e.target.value)}
                                placeholder="Escribe la evaluación, tratamiento, recetas..."
                                style={{ width: '100%', height: '80px', padding: '8px', background: 'var(--c-bg)', border: '1px solid var(--c-primary)', borderRadius: '4px', color: '#fff', marginBottom: '8px' }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => saveNote(app.id)} style={{ background: 'var(--c-primary)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Guardar</button>
                                <button onClick={() => { setShowNoteForm(null); setNoteContent(''); }} style={{ background: 'transparent', color: 'var(--c-text)', border: '1px solid var(--c-border)', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setShowNoteForm(app.id); setNoteContent(app.notes || ''); }} style={{ marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--c-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                              {app.notes ? 'Editar Nota' : '+ Agregar Nota Clínica'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
