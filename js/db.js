/* ============================================================
   db.js — Base de datos unificada
   Cada paciente carga sus consultas adentro como un array.
   Estructura: { id, nombre, raza, ..., consultas: [...] }
   ============================================================ */

const DB_KEY = 'cp_pacientes_v3';

const DB = {

  /* ── Leer todos los pacientes (con consultas adentro) ── */
  getAll() {
    try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
    catch { return []; }
  },

  /* ── Guardar lista completa ── */
  _save(list) {
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  },

  /* ── Obtener un paciente por id ── */
  getPatient(id) {
    return this.getAll().find(p => p.id === id) || null;
  },

  /* ── Agregar paciente nuevo (sin consultas aún) ── */
  addPatient(data) {
    const list = this.getAll();
    const p = { ...data, id: Date.now().toString(), consultas: [], creadoEn: new Date().toISOString() };
    list.unshift(p);
    this._save(list);
    return p;
  },

  /* ── Actualizar datos del paciente (no toca sus consultas) ── */
  updatePatient(id, data) {
    const list = this.getAll();
    const i = list.findIndex(p => p.id === id);
    if (i < 0) return null;
    // Preservar consultas y metadatos
    list[i] = { ...list[i], ...data, id, consultas: list[i].consultas || [], actualizadoEn: new Date().toISOString() };
    this._save(list);
    return list[i];
  },

  /* ── Eliminar paciente (y sus consultas, porque van adentro) ── */
  deletePatient(id) {
    this._save(this.getAll().filter(p => p.id !== id));
  },

  /* ── Agregar consulta A UN paciente ── */
  addConsulta(pacienteId, consulta) {
    const list = this.getAll();
    const i = list.findIndex(p => p.id === pacienteId);
    if (i < 0) return null;
    const c = { ...consulta, id: Date.now().toString(), creadoEn: new Date().toISOString() };
    list[i].consultas = list[i].consultas || [];
    list[i].consultas.unshift(c);
    this._save(list);
    return c;
  },

  /* ── Crear paciente y su primera consulta de una sola vez ── */
  addPatientWithConsulta(patientData, consultaData) {
    const list = this.getAll();
    const p = { ...patientData, id: Date.now().toString(), consultas: [], creadoEn: new Date().toISOString() };
    const tieneConsulta = consultaData && Object.values(consultaData).some(v => v && v.toString().trim() !== '');
    if (tieneConsulta) {
      const c = { ...consultaData, id: (Date.now() + 1).toString(), creadoEn: new Date().toISOString() };
      p.consultas.push(c);
    }
    list.unshift(p);
    this._save(list);
    return p;
  },

  /* ── Eliminar una consulta de un paciente ── */
  deleteConsulta(pacienteId, consultaId) {
    const list = this.getAll();
    const i = list.findIndex(p => p.id === pacienteId);
    if (i < 0) return;
    list[i].consultas = (list[i].consultas || []).filter(c => c.id !== consultaId);
    this._save(list);
  },

  /* ── Stats globales ── */
  getStats() {
    const all = this.getAll();
    return {
      total:    all.length,
      can:      all.filter(p => p.tipo === 'CAN').length,
      fel:      all.filter(p => p.tipo === 'FEL').length,
      consultas: all.reduce((sum, p) => sum + (p.consultas?.length || 0), 0),
    };
  },

  /* ── Todas las consultas aplanadas (para la vista de consultas) ── */
  getAllConsultas() {
    return this.getAll().flatMap(p =>
      (p.consultas || []).map(c => ({ ...c, paciente: p }))
    ).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  },

  /* ── Recordatorios ── */
  getRecordatorios() {
    const hoy = todayISO();
    return this.getAll()
      .filter(p => p.recordFecha)
      .map(p => ({
        pacienteId: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        fecha: p.recordFecha,
        motivo: p.recordTipo || 'Recordatorio',
        nota: p.recordNota || '',
        vencido: p.recordFecha < hoy,
        esHoy: p.recordFecha === hoy,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  /* ── Export / Import ── */
  exportJSON() {
    const data = { pacientes: this.getAll(), exportadoEn: new Date().toISOString(), version: 3 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cuatropatas_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('%c✓ Backup exportado correctamente', 'color: #1D9E75; font-weight: bold; font-size: 13px');
  },
  importJSON(text) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data.pacientes)) { this._save(data.pacientes); return true; }
      if (Array.isArray(data)) { this._save(data); return true; }
      return false;
    } catch { return false; }
  },
};

/* ── Helpers globales ── */
function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show' + (type === 'error' ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 2600);
}
function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
function todayISO() { return new Date().toISOString().split('T')[0]; }
function nowTime()  { return new Date().toTimeString().slice(0, 5); }
function petEmoji(tipo) { return tipo === 'CAN' ? '🐶' : tipo === 'FEL' ? '🐱' : '🐾'; }

console.log('%c🐾 Cuatro Patas', 'color:#1D9E75;font-size:16px;font-weight:bold');
console.log('%cPara exportar un backup de tus datos, escribe: DB.exportJSON()', 'color:#5F5E5A');
