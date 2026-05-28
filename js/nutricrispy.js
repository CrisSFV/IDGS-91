let nutriologoActivo = null;
let pacientes = [];        
let historial = {};        
let pacienteSeleccionado = null;

// ============================================================
// CONTROL DE SESIÓN
// ============================================================
function iniciarSesion() {
  const nombre = document.getElementById('inp-nombre-login').value.trim();
  const clave  = document.getElementById('inp-clave-login').value.trim();
  const err    = document.getElementById('error-login');

  if (nombre.split(' ').filter(p => p).length < 2 || clave.length < 3) {
    err.style.display = 'flex';
    err.querySelector('.err-txt').textContent = 'Ingresa tu nombre completo (al menos dos palabras) y tu clave.';
    return;
  }
  err.style.display = 'none';
  nutriologoActivo = nombre;
  abrirPanelPrincipal();
}

function abrirPanelPrincipal() {
  document.getElementById('pantalla-login').style.display = 'none';
  document.getElementById('pantalla-principal').style.display = 'block';

  const partes = nutriologoActivo.split(' ').filter(p => p);
  const iniciales = (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
  document.getElementById('avatar-iniciales').textContent = iniciales;
  document.getElementById('label-nutriologo').textContent = nutriologoActivo;

  const guardado = sessionStorage.getItem('nutricrispy-data');
  if (guardado) {
    const data = JSON.parse(guardado);
    pacientes = data.pacientes || [];
    historial = data.historial || {};
    renderListaPacientes();
  }
}

function cerrarSesion() {
  if (!confirm('¿Cerrar sesión? Los datos quedarán guardados para la próxima.')) return;
  nutriologoActivo = null;
  pacienteSeleccionado = null;
  document.getElementById('pantalla-principal').style.display = 'none';
  document.getElementById('pantalla-login').style.display = 'flex';
  document.getElementById('inp-nombre-login').value = '';
  document.getElementById('inp-clave-login').value = '';
  mostrarVista('bienvenida');
}

// ============================================================
// PROTECCIÓN DE RUTA — si alguien recarga estando en el panel
// ============================================================
window.addEventListener('load', () => {
  if (!nutriologoActivo) {
    document.getElementById('pantalla-principal').style.display = 'none';
    document.getElementById('pantalla-login').style.display = 'flex';
  }
});

// ============================================================
// NAVEGACIÓN DE VISTAS
// ============================================================
function mostrarVista(id) {
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
  document.getElementById('vista-' + id).classList.add('activa');

  if (id === 'nueva-consulta') limpiarFormPaciente();

  if (id !== 'consulta') {
    pacienteSeleccionado = null;
    document.querySelectorAll('.chip-paciente').forEach(c => c.classList.remove('activo'));
  }
}

// ============================================================
// CÁLCULO DE IMC
// ============================================================
function calcularIMC() {
  const peso  = parseFloat(document.getElementById('nv-peso').value);
  const talla = parseFloat(document.getElementById('nv-talla').value);
  const div   = document.getElementById('imc-resultado');

  if (!peso || !talla || talla < 50) { div.style.display = 'none'; return; }

  const tallam = talla / 100;
  const imc    = peso / (tallam * tallam);
  const info   = diagnosticoIMC(imc);

  document.getElementById('imc-valor').textContent   = imc.toFixed(1);
  document.getElementById('imc-etiqueta').textContent = info.etiqueta;
  document.getElementById('imc-diag').textContent     = info.descripcion;
  div.style.display = 'block';
  div.style.borderColor = info.color;
  div.style.background  = info.fondo;
}

function diagnosticoIMC(imc) {
  if (imc < 18.5) return { etiqueta: 'Bajo peso',    descripcion: 'IMC por debajo del rango saludable',       clase: 'imc-bajo',     color: '#378ADD', fondo: '#E6F1FB' };
  if (imc < 25)   return { etiqueta: 'Peso normal',  descripcion: 'Rango de peso saludable',                  clase: 'imc-normal',   color: '#639922', fondo: '#EAF3DE' };
  if (imc < 30)   return { etiqueta: 'Sobrepeso',    descripcion: 'Moderadamente por encima del normal',      clase: 'imc-sobre',    color: '#BA7517', fondo: '#FAEEDA' };
  return               { etiqueta: 'Obesidad',      descripcion: 'IMC por encima de 30',                     clase: 'imc-obesidad', color: '#A32D2D', fondo: '#FCEBEB' };
}

// ============================================================
// GESTIÓN DE PACIENTES
// ============================================================
function limpiarFormPaciente() {
  ['nv-nombre','nv-edad','nv-peso','nv-talla'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('nv-sexo').value = '';
  document.getElementById('imc-resultado').style.display = 'none';
  document.getElementById('error-nuevo').style.display = 'none';
  document.getElementById('alerta-duplicado').style.display = 'none';
}

function limpiarAlerta() {
  document.getElementById('alerta-duplicado').style.display = 'none';
}

function guardarPaciente() {
  const nombre = document.getElementById('nv-nombre').value.trim();
  const edad   = document.getElementById('nv-edad').value.trim();
  const sexo   = document.getElementById('nv-sexo').value;
  const peso   = parseFloat(document.getElementById('nv-peso').value);
  const talla  = parseFloat(document.getElementById('nv-talla').value);
  const err    = document.getElementById('error-nuevo');
  const dup    = document.getElementById('alerta-duplicado');

  if (!nombre || !edad || !sexo || !peso || !talla) {
    err.style.display = 'flex';
    return;
  }
  err.style.display = 'none';

  const existe = pacientes.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    dup.style.display = 'flex';
    return;
  }

  const tallam = talla / 100;
  const imc    = +(peso / (tallam * tallam)).toFixed(1);
  const info   = diagnosticoIMC(imc);

  const nuevoPac = {
    id: Date.now().toString(),
    nombre, edad: parseInt(edad), sexo,
    peso, talla, imc,
    diagnostico: info.etiqueta,
    claseIMC: info.clase
  };

  pacientes.push(nuevoPac);
  historial[nuevoPac.id] = [];
  guardarEnStorage();
  renderListaPacientes();
  seleccionarPaciente(nuevoPac.id);
}

function renderListaPacientes() {
  const cont = document.getElementById('lista-pacientes');
  if (pacientes.length === 0) {
    cont.innerHTML = '<div style="font-size:13px;color:var(--gris-texto);padding:12px 0;text-align:center;">Aún no hay pacientes.<br>Registra el primero arriba.</div>';
    return;
  }
  cont.innerHTML = '';
  pacientes.forEach(p => {
    const div = document.createElement('div');
    div.className = 'chip-paciente' + (pacienteSeleccionado === p.id ? ' activo' : '');
    div.id = 'chip-' + p.id;
    div.onclick = () => seleccionarPaciente(p.id);
    const nhist = (historial[p.id] || []).length;
    div.innerHTML = `
      <div class="nombre-pac">
        ${p.nombre}
        <span class="badge-imc ${p.claseIMC}">${p.diagnostico}</span>
      </div>
      <div class="datos-pac">${p.edad} años · ${p.peso} kg · ${p.talla} cm · ${nhist} consulta${nhist !== 1 ? 's' : ''}</div>
    `;
    cont.appendChild(div);
  });
}

function seleccionarPaciente(id) {
  pacienteSeleccionado = id;
  const p = pacientes.find(x => x.id === id);
  if (!p) return;

  document.querySelectorAll('.chip-paciente').forEach(c => c.classList.remove('activo'));
  const chip = document.getElementById('chip-' + id);
  if (chip) chip.classList.add('activo');

  const iniciales = p.nombre.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  document.getElementById('pac-avatar').textContent         = iniciales;
  document.getElementById('pac-nombre-display').textContent = p.nombre;
  document.getElementById('pac-edad-display').textContent   = p.edad;
  document.getElementById('pac-sexo-display').textContent   = p.sexo;
  document.getElementById('pac-peso-display').textContent   = p.peso;
  document.getElementById('pac-talla-display').textContent  = p.talla;
  document.getElementById('pac-imc-display').textContent    = p.imc;

  const badge = document.getElementById('pac-badge-imc');
  badge.textContent = p.diagnostico;
  badge.className   = 'badge-imc ' + p.claseIMC;

  const ahora = new Date();
  document.getElementById('cons-fecha').value  = ahora.toISOString().slice(0,10);
  document.getElementById('cons-hora').value   = ahora.toTimeString().slice(0,5);
  document.getElementById('cons-evolucion').value = '';
  document.getElementById('cons-plan').value      = '';
  document.getElementById('flash-consulta').style.display = 'none';

  renderHistorial(id);
  mostrarVista('consulta');
}

// ============================================================
// CONSULTAS E HISTORIAL
// ============================================================
function guardarConsulta() {
  if (!pacienteSeleccionado) return;
  const fecha     = document.getElementById('cons-fecha').value;
  const hora      = document.getElementById('cons-hora').value;
  const evolucion = document.getElementById('cons-evolucion').value.trim();
  const plan      = document.getElementById('cons-plan').value.trim();

  if (!fecha || !hora || !evolucion || !plan) {
    const flash = document.getElementById('flash-consulta');
    flash.style.display = 'block';
    flash.innerHTML = `<div style="background:#FCEBEB;color:#A32D2D;padding:10px 14px;border-radius:8px;font-size:13px;margin-top:0.5rem;display:flex;align-items:center;gap:6px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Completa todos los campos de la consulta.</div>`;
    return;
  }

  const entrada = { ts: Date.now(), fecha, hora, nutriologo: nutriologoActivo, evolucion, plan };

  if (!historial[pacienteSeleccionado]) historial[pacienteSeleccionado] = [];
  historial[pacienteSeleccionado].unshift(entrada);

  guardarEnStorage();
  renderHistorial(pacienteSeleccionado);
  renderListaPacientes();

  document.getElementById('cons-evolucion').value = '';
  document.getElementById('cons-plan').value = '';

  const flash = document.getElementById('flash-consulta');
  flash.style.display = 'block';
  flash.innerHTML = `<div class="flash-exito">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    Consulta guardada y visible en el historial.</div>`;
  setTimeout(() => { flash.style.display = 'none'; }, 3500);
}

function renderHistorial(pacId) {
  const cont  = document.getElementById('lista-historial');
  const count = document.getElementById('contador-hist');
  const notas = historial[pacId] || [];

  count.textContent = notas.length;

  if (notas.length === 0) {
    cont.innerHTML = `<div class="historial-vacio">
      <div class="icono">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
      No hay notas aún. Registra la primera consulta.</div>`;
    return;
  }

  cont.innerHTML = '';
  notas.forEach((n, i) => {
    const div = document.createElement('div');
    div.className = 'entrada-historial';
    const fechaFmt = formatearFecha(n.fecha);
    div.innerHTML = `
      <div class="entrada-meta">
        ${fechaFmt} · ${n.hora}
        <span class="nutriologo">${n.nutriologo}</span>
        ${i === 0 ? '<span style="background:#EAF3DE;color:#3B6D11;padding:2px 7px;border-radius:4px;font-weight:600;font-size:10px;">MÁS RECIENTE</span>' : ''}
      </div>
      <div class="entrada-evolucion">${escaparHTML(n.evolucion)}</div>
      <div class="entrada-plan">
        <strong>Plan de alimentación</strong>
        ${escaparHTML(n.plan)}
      </div>
    `;
    cont.appendChild(div);
  });
}

// ============================================================
// UTILIDADES
// ============================================================
function formatearFecha(iso) {
  const [y,m,d] = iso.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}

function escaparHTML(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');
}

function guardarEnStorage() {
  sessionStorage.setItem('nutricrispy-data', JSON.stringify({ pacientes, historial }));
}