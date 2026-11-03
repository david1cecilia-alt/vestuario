import '@fontsource/figtree/400';
import '@fontsource/figtree/600';
import '@fontsource/figtree/800';
import '@fontsource/big-shoulders-display/700';
import '@fontsource/big-shoulders-display/900';
import { store, sb, uid, madridDay, setErrorHandler, setReloadHandler } from './data.js';

/* ===== Dibujos ===== */
let ballSeq=0;
/* Cada copia del balón de balonmano lleva su propio id de recorte: si todas compartieran uno,
   al estar la primera en una pantalla oculta el navegador dejaría de recortar los paneles. */
const BALL={
  basket:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#E8702A" stroke="#4A1F07" stroke-width="3"/><g fill="none" stroke="#4A1F07" stroke-width="3" stroke-linecap="round"><path d="M4 50h92M50 4v92M17 17c22 18 22 48 0 66M83 17c-22 18-22 48 0 66"/></g><ellipse cx="34" cy="28" rx="14" ry="7" fill="#fff" opacity=".25" transform="rotate(-30 34 28)"/></svg>`,
  get hand(){const id='hc'+(++ballSeq);return `<svg viewBox="0 0 100 100"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="46"/></clipPath></defs><circle cx="50" cy="50" r="46" fill="#F4F7FB"/><g clip-path="url(#${id})"><polygon points="50,33 66,45 60,64 40,64 34,45" fill="#1F6FD1"/><g fill="#F2C230"><polygon points="50,33 66,45 80,14 50,0 20,14 34,45"/><polygon points="40,64 60,64 72,100 28,100"/></g><g fill="#1F6FD1"><polygon points="66,45 60,64 72,100 100,72 100,36 80,14"/><polygon points="34,45 40,64 28,100 0,72 0,36 20,14"/></g><g fill="none" stroke="#0F2A4D" stroke-width="2.2"><polygon points="50,33 66,45 60,64 40,64 34,45"/><path d="M50 33L50 0M66 45L100 36M60 64L72 100M40 64L28 100M34 45L0 36"/></g></g><circle cx="50" cy="50" r="46" fill="none" stroke="#0F2A4D" stroke-width="3"/><ellipse cx="34" cy="28" rx="14" ry="7" fill="#fff" opacity=".35" transform="rotate(-30 34 28)"/></svg>`}
};
const COURT={
  basket:{vb:'0 0 940 500',svg:`<g fill="none" stroke="currentColor" stroke-width="5"><rect x="20" y="20" width="900" height="460"/><path d="M470 20v460"/><circle cx="470" cy="250" r="60"/><rect x="20" y="170" width="190" height="160"/><rect x="730" y="170" width="190" height="160"/><path d="M210 190a60 60 0 0 1 0 120M730 190a60 60 0 0 0 0 120"/><path d="M20 50h90a210 210 0 0 1 0 400h-90M920 50h-90a210 210 0 0 0 0 400h90"/></g>`},
  hand:{vb:'0 0 800 400',svg:`<g fill="none" stroke="currentColor" stroke-width="5"><rect x="20" y="20" width="760" height="360"/><path d="M400 20v360"/><path d="M20 80a120 120 0 0 1 120 120v0a120 120 0 0 1-120 120M780 80a120 120 0 0 0-120 120a120 120 0 0 0 120 120"/><path d="M20 30a170 170 0 0 1 170 170a170 170 0 0 1-170 170M780 30a170 170 0 0 0-170 170a170 170 0 0 0 170 170" stroke-dasharray="18 14"/><path d="M20 180h-12v40h12M780 180h12v40h-12"/></g>`}
};
const INJ=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
function paintCourt(svg,sport){svg.setAttribute('viewBox',COURT[sport].vb);svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.innerHTML=COURT[sport].svg}
document.querySelectorAll('[data-ball]').forEach(e=>e.innerHTML=BALL[e.dataset.ball]);
document.querySelectorAll('[data-court]').forEach(e=>paintCourt(e,e.dataset.court));

/* ===== Estado UI ===== */
const SPORT_NAME={basket:'Baloncesto',hand:'Balonmano'};
const POS={basket:['Base','Escolta','Alero','Ala-pívot','Pívot'],hand:['Portero/a','Central','Lateral','Extremo','Pivote']};
const CATS=['Benjamín','Alevín','Infantil','Cadete','Juvenil','Senior'];
const ui={sport:null,teamId:null,editTeams:false,editPlayers:false};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

function show(id){['login','home','sport','team','coach','qedit','review','stats','strength'].forEach(v=>$('#'+v).hidden=v!==id)}

/* ===== Inicio → deporte con expansión ===== */
document.querySelectorAll('.half').forEach(h=>h.addEventListener('click',()=>enterSport(h.dataset.sport,h)));
function enterSport(sport,el){
  ui.sport=sport; ui.editTeams=false;
  if(reduce||!el.animate){renderSport();show('sport');return}
  const r=el.getBoundingClientRect();
  const c=el.cloneNode(true); c.classList.add('zoom-clone');
  Object.assign(c.style,{top:r.top+'px',left:r.left+'px',width:r.width+'px',height:r.height+'px'});
  document.body.appendChild(c);
  const a=c.animate([
    {top:r.top+'px',left:r.left+'px',width:r.width+'px',height:r.height+'px',borderRadius:'34px'},
    {top:'0px',left:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}
  ],{duration:520,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});
  c.querySelector('.half-inner').animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.4)'}],{duration:520,easing:'ease-in',fill:'forwards'});
  a.onfinish=()=>{renderSport();show('sport');c.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'}).onfinish=()=>c.remove()};
}
$('#backHome').onclick=()=>{ui.unlocked=false;show('home')};

/* ===== Vista deporte ===== */
function renderSport(){
  const v=$('#sport'); v.classList.remove('basket','hand'); v.classList.add(ui.sport);
  paintCourt($('#sportCourt'),ui.sport);
  $('#sportTitle').innerHTML=`${SPORT_NAME[ui.sport]}<small>Tus equipos</small>`;
  const eb=$('#editTeams'); eb.classList.toggle('on',ui.editTeams); eb.setAttribute('aria-pressed',ui.editTeams); eb.querySelector('span').textContent=ui.editTeams?'Listo':'Editar';
  const teams=store.teams(ui.sport);
  let html='';
  if(store.hasExamples()) html+=`<div class="banner"><span>Estos equipos son de ejemplo para que veas cómo queda. Bórralos cuando crees los tuyos.</span><button id="clearEx">Borrar ejemplos</button></div>`;
  if(!teams.length){
    html+=`<div class="empty"><h2>Aún no hay equipos de ${SPORT_NAME[ui.sport].toLowerCase()}</h2><p>Crea el primero con un nombre y una categoría.</p><button class="pill-btn" style="margin:0 auto" data-add-team>+ Crear equipo</button></div>`;
  }else{
    html+=`<div class="team-grid">`+teams.map((t,i)=>`
      <div class="team-card" role="button" tabindex="0" data-team="${t.id}" style="--i:${i}" aria-label="${esc(t.name)}, ${esc(t.category)}">
        <div class="face"><span class="deco">${BALL[ui.sport]}</span></div>
        <span class="count">${t.players.length} ${t.players.length===1?'jugador':'jugadores'}</span>
        ${t.example?'<span class="tag-example">EJEMPLO</span>':''}
        <div class="txt"><div class="name">${esc(t.name)}</div><div class="cat">${esc(t.category)}</div></div>
        ${ui.editTeams?`<button class="del-x" data-del-team="${t.id}" aria-label="Eliminar ${esc(t.name)}">×</button>`
          :`<button class="card-stats" data-stats="${t.id}" aria-label="Gráficas de ${esc(t.name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></button>`}
      </div>`).join('')+
      `<button class="add-card" data-add-team><span class="plus">+</span>Añadir equipo</button></div>`;
  }
  $('#sportScroll').innerHTML=html;
  bindTilt();
}
$('#editTeams').onclick=()=>{if(ui.editTeams){ui.editTeams=false;renderSport();return}requirePin(()=>{ui.editTeams=true;renderSport()})};
$('#sportScroll').addEventListener('click',e=>{
  const del=e.target.closest('[data-del-team]');
  if(del){e.stopPropagation();
    const t=store.team(del.dataset.delTeam),n=store.data.responses.filter(r=>r.teamId===t.id).length;
    if(!n){armDelete(del,()=>{store.removeTeam(t.id);renderSport()});return}
    modal(`<h2>¿Borrar ${esc(t.name)}?</h2><p class="muted-note" style="margin:-6px 0 14px">Se borrarán también sus <b>${n} ${n===1?'reseña':'reseñas'}</b>, sus jugadores y sus cuestionarios. No se puede deshacer.</p>
      <div class="field"><label for="fDelConfirm">Escribe el nombre del equipo para confirmar</label><input id="fDelConfirm" autocomplete="off" placeholder="${esc(t.name)}"></div>`,
    f=>{if(f.querySelector('#fDelConfirm').value.trim().toLowerCase()!==t.name.toLowerCase())return'El nombre no coincide.';
      store.removeTeam(t.id);renderSport();toast(`Equipo ${t.name} borrado`);return null},'Borrar todo');
    return}
  if(e.target.closest('#clearEx')){store.clearExamples();renderSport();return}
  if(e.target.closest('[data-add-team]')){openTeamForm();return}
  const sb=e.target.closest('[data-stats]');if(sb){e.stopPropagation();requirePin(()=>openStats(sb.dataset.stats));return}
  const card=e.target.closest('[data-team]');
  if(card&&!ui.editTeams) openTeam(card.dataset.team,card);
});
$('#sportScroll').addEventListener('keydown',e=>{const c=e.target.closest('[data-team]');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();c.click()}});

function bindTilt(){
  document.querySelectorAll('.team-card').forEach(card=>{
    const move=e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      card.style.transition='transform .08s';
      card.style.transform=`rotateY(${(x-.5)*22}deg) rotateX(${(.5-y)*18}deg) translateZ(14px)`;
      card.style.setProperty('--gx',x*100+'%');card.style.setProperty('--gy',y*100+'%');
    };
    const reset=()=>{card.style.transition='';card.style.transform=''};
    card.addEventListener('pointermove',move);
    card.addEventListener('pointerleave',reset);
    card.addEventListener('pointerup',reset);
    card.addEventListener('pointercancel',reset);
  });
}

/* ===== Vista equipo ===== */
function openTeam(id,card){
  ui.teamId=id; ui.editPlayers=false;
  const go=()=>{renderTeam();show('team');$('#teamScroll').scrollTop=0};
  if(reduce||!card||!card.animate){go();return}
  card.style.transition='';
  card.animate([{transform:'scale(1)'},{transform:'scale(1.08) translateZ(60px)'},{transform:'scale(.2)',opacity:0}],{duration:380,easing:'ease-in'}).onfinish=go;
}
function renderTeam(){
  const t=store.team(ui.teamId); if(!t){show('sport');renderSport();return}
  const v=$('#team'); v.classList.remove('basket','hand'); v.classList.add(t.sport);
  paintCourt($('#teamCourt'),t.sport);
  $('#teamTitle').innerHTML=`${esc(t.name)}<small>${esc(t.category)} · ${SPORT_NAME[t.sport]}</small>`;
  const eb=$('#editPlayers'); eb.classList.toggle('on',ui.editPlayers); eb.setAttribute('aria-pressed',ui.editPlayers); eb.querySelector('span').textContent=ui.editPlayers?'Listo':'Editar';
  $('#teamScroll').innerHTML=`<div class="player-grid">`+t.players.map((p,i)=>`
    <button class="player ${p.injured?'injured':''} ${ui.editPlayers?'editing':''}" data-player="${p.id}" style="--i:${i}">
      ${p.injuryMode?`<span class="inj-badge mode">${INJ}Modo lesión</span>`:p.injured?`<span class="inj-badge">${INJ}Lesionado</span>`:''}
      ${store.respondedToday(p.id)&&!ui.editPlayers?`<span class="done-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>Hecho hoy</span>`:''}
      <span class="pname">${esc(p.name)}</span>
      <span class="ppos">${esc(p.position||'')}</span>
      ${ui.editPlayers?`<span class="del-x" role="button" data-del-player="${p.id}" aria-label="Eliminar ${esc(p.name)}">×</span>
        <span class="tile-inj ${p.injuryMode?'on':''}" role="button" data-tile-inj="${p.id}">${INJ}${p.injuryMode?'Dar de alta':'Activar modo lesión'}</span>`:''}
    </button>`).join('')+
    `<button class="add-player" data-add-player><span class="plus">+</span>Añadir jugador</button></div>`;
}
$('#backSport').onclick=()=>{renderSport();show('sport')};
$('#editPlayers').onclick=()=>{if(ui.editPlayers){ui.editPlayers=false;renderTeam();return}requirePin(()=>{ui.editPlayers=true;renderTeam()})};
$('#teamScroll').addEventListener('click',e=>{
  const del=e.target.closest('[data-del-player]');
  if(del){e.stopPropagation();armDelete(del,()=>{store.removePlayer(ui.teamId,del.dataset.delPlayer);renderTeam()});return}
  if(e.target.closest('[data-add-player]')){openPlayerForm();return}
  const ti=e.target.closest('[data-tile-inj]');
  if(ti){e.stopPropagation();const pl=store.team(ui.teamId).players.find(x=>x.id===ti.dataset.tileInj);const on=!pl.injuryMode;
    store.setInjuryMode(ui.teamId,pl.id,on);renderTeam();toast(on?`${pl.name} pasa a modo lesión`:`${pl.name} dado de alta`);return}
  const p=e.target.closest('[data-player]');
  if(p&&!ui.editPlayers){
    if(store.respondedToday(p.dataset.player)){toast('Ya has enviado tu reseña de hoy. ¡Hasta la próxima sesión!');return}
    openReview(p.dataset.player);
  }
});
$('#coachBtn').onclick=()=>openCoach();

/* ===== PIN del entrenador ===== */
async function hashPin(pin){
  const s='vestuario:'+pin;
  try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return'f'+h}
}
function pinPad(title,sub,onDone,opts={}){
  const back=document.createElement('div');back.className='modal-back';
  back.innerHTML=`<div class="pin-box" role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2><p id="pinSub">${esc(sub)}</p>
    <div class="dots" id="pinDots"><i></i><i></i><i></i><i></i></div>
    <div class="keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-k="${n}">${n}</button>`).join('')}<button class="k-small" data-k="x">Cancelar</button><button data-k="0">0</button><button class="k-small" data-k="b" aria-label="Borrar">⌫</button></div>${opts.forgot?'<button class="pin-forgot" data-k="f">¿Olvidaste el PIN?</button>':''}</div>`;
  $('#layer').appendChild(back);
  let pin='',busy=false;
  const dots=back.querySelectorAll('.dots i'),subEl=back.querySelector('#pinSub');
  const paint=()=>dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length));
  const press=async k=>{
    if(busy)return;
    if(k==='x'){back.remove();return}
    if(k==='f'){back.remove();forgotPin();return}
    if(k==='b'){pin=pin.slice(0,-1);paint();return}
    if(pin.length>=4)return;
    pin+=k;paint();
    if(pin.length===4){
      busy=true;const r=await onDone(pin);
      if(r===true){back.remove();return}
      subEl.textContent=r;subEl.classList.add('bad');
      const d=back.querySelector('#pinDots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');
      setTimeout(()=>{pin='';paint();busy=false},420);
    }
  };
  back.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)press(b.dataset.k)});
  const onKey=e=>{if(!back.isConnected){removeEventListener('keydown',onKey);return}
    if(/^\d$/.test(e.key))press(e.key);else if(e.key==='Backspace')press('b');else if(e.key==='Escape')press('x')};
  addEventListener('keydown',onKey);
}
function createPin(then){
  pinPad('Crea tu PIN','4 números. Solo tú podrás entrar aquí.',pin=>{
    setTimeout(()=>pinPad('Repite el PIN','Escríbelo otra vez para confirmar.',async p2=>{
      if(p2!==pin)return'No coincide. Vuelve a intentarlo.';
      try{await store.setPin(await hashPin(pin))}catch(e){return'No se pudo guardar el PIN. Revisa la conexión.'}then();return true;
    }),80);
    return true;
  });
}
/* El PIN se pide una vez; queda desbloqueado hasta que un jugador abre su reseña o se vuelve al inicio */
function requirePin(then){
  const ok=()=>then();
  if(!store.data.coach.pinHash){createPin(ok);return}
  pinPad('Entrenador','Introduce tu PIN',async pin=>{
    if(await hashPin(pin)!==store.data.coach.pinHash)return'PIN incorrecto';
    ok();return true;
  },{forgot:true});
}
function openCoach(){requirePin(enterCoach)}
async function forgotPin(){
  modal(`<h2>Recuperar PIN</h2><p class="muted-note" style="margin:-8px 0 16px">Escribe la contraseña de la cuenta ${esc(store.data.coach.email)} para crear un PIN nuevo.</p>
    <div class="field"><label for="fPass">Contraseña</label><input id="fPass" type="password" autocomplete="current-password"></div>`,
  f=>{const pw=f.querySelector('#fPass').value;if(!pw)return'Escribe la contraseña.';
    const btn=f.querySelector('.btn-main');btn.disabled=true;btn.textContent='Comprobando…';
    store.verifyPassword(pw).then(ok=>{
      if(!ok){btn.disabled=false;btn.textContent='Guardar';f.querySelector('#formErr').textContent='Contraseña incorrecta.';return}
      f.closest('.modal-back').remove();createPin(()=>{toast('PIN nuevo guardado');enterCoach()});
    });
    return'__keep';
  });
}
$('#logoutBtn').onclick=async()=>{await store.signOut();ui.unlocked=false;showLogin()};
$('#changePin').onclick=()=>pinPad('PIN actual','Para cambiarlo, primero el actual',async pin=>{
  if(await hashPin(pin)!==store.data.coach.pinHash)return'PIN incorrecto';
  setTimeout(()=>createPin(()=>toast('PIN cambiado')),80);return true;
});

/* ===== Zona del entrenador ===== */
const STYLES={
  emoji:{name:'Botones con emoji',hint:'Elige una',mini:'<i></i><i></i><i></i>'},
  color:{name:'Círculos de color',hint:'Elige una',mini:'<i class="c" style="background:var(--o-red)"></i><i class="c" style="background:var(--o-yellow)"></i><i class="c" style="background:var(--o-green)"></i>'},
  multi:{name:'Casillas',hint:'Varias a la vez',mini:'<i style="border:2px solid var(--ink);background:none"></i><i style="background:var(--ink)"></i><i style="border:2px solid var(--ink);background:none"></i>'},
  scale:{name:'Línea deslizante',hint:'De poco a mucho',mini:'<span class="bar"></span>'}
};
const TAB_INFO={
  normal:{name:'Jugadores',sub:'Para todos los que entrenan'},
  injured:{name:'Lesionados',sub:'Solo para lesionados'},
  custom:{name:'Personalizados',sub:'Para un jugador concreto'}
};
const COLORS=['red','orange','yellow','green','blue','purple'];
const EMOJIS=['😫','😕','😐','🙂','😄','🤩','😴','🥵','💪','🔥','⚡','🎯','👍','👎','❤️','✅','❌','🤕','🦵','🦶','🏃','🧠','⭐','🙌'];
const CHECK=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`;
ui.coachTab='normal';

function enterCoach(){renderCoach();show('coach');$('#coachScroll').scrollTop=0}
$('#coachExit').onclick=()=>{renderTeam();show('team')};

function quizzesFor(t,tab){
  if(tab==='custom')return t.quizzes.filter(q=>q.targetPlayerIds.length);
  return t.quizzes.filter(q=>!q.targetPlayerIds.length&&q.type===tab);
}
function renderCoach(){
  const t=store.team(ui.teamId);
  $('#coachTitle').innerHTML=`Zona del entrenador<small>${esc(t.name)} · ${esc(t.category)}</small>`;
  const tab=ui.coachTab, list=quizzesFor(t,tab);
  let h=`<div class="coach-wrap"><div class="tabs" role="tablist">`+Object.entries(TAB_INFO).map(([k,v])=>
    `<button class="tab ${k===tab?'on':''}" role="tab" aria-selected="${k===tab}" data-tab="${k}">${v.name} · ${quizzesFor(t,k).length}<small>${v.sub}</small></button>`).join('')+`</div>`;
  if(!list.length){
    const txt={normal:'Crea un cuestionario y actívalo para la sesión: lo verán todos los jugadores al pulsar su nombre, debajo de la barra.',
      injured:'Se muestran a los jugadores en modo lesión, debajo del checklist obligatorio (dolor, calentamiento y estiramientos).',
      custom:'Elige a un jugador y hazle preguntas solo a él. La app detecta si está en modo lesión.'}[tab];
    h+=`<div class="coach-empty"><h3>No hay cuestionarios ${tab==='custom'?'personalizados':'de '+TAB_INFO[tab].name.toLowerCase()}</h3><p>${txt}</p></div>`;
  }else{
    h+=`<div class="quiz-list">`+list.map(q=>{
      const who=t.players.filter(p=>q.targetPlayerIds.includes(p.id)).map(p=>p.name);
      return`<div class="quiz-row">
        <div class="qinfo"><h3>${esc(q.title)}</h3>
          <div class="meta"><span>${q.questions.length} ${q.questions.length===1?'pregunta':'preguntas'}</span>
          ${who.length?`<span class="tagp">Para ${esc(who.join(', '))}</span>`:''}${q.type==='injured'?'<span class="tagp inj">Lesionado</span>':''}</div></div>
        <button class="switch" role="switch" aria-checked="${q.active}" data-toggle="${q.id}"><span class="tr"></span>${q.active?'Activo hoy':'Inactivo'}</button>
        <div class="row-btns"><button class="sq-btn" data-edit="${q.id}" aria-label="Editar ${esc(q.title)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg></button>
        <button class="sq-btn" data-del-quiz="${q.id}" aria-label="Eliminar ${esc(q.title)}">×</button></div>
      </div>`}).join('')+`</div>`;
  }
  h+=`<button class="big-add" data-new-quiz>+ Nuevo cuestionario ${tab==='custom'?'personalizado':'para '+TAB_INFO[tab].name.toLowerCase()}</button>`;
  if(tab==='injured'){
    const order=p=>p.injuryMode?0:p.injured?1:2;
    const list=t.players.slice().sort((x,y)=>order(x)-order(y));
    h+=`<h2 class="section-h">Modo lesión por jugador</h2><p class="muted-note" style="margin:-4px 0 12px">En modo lesión, el jugador responde la barra, el checklist (dolor, calentamiento y estiramientos) y los cuestionarios de lesionados, y sus reseñas van a las gráficas de lesionados. Al darle de alta vuelve a la encuesta general.</p>`;
    h+=list.length?`<div class="inj-roster">`+list.map(p=>{
      const state=p.injuryMode?`<span class="tagp inj">Modo lesión</span><small>${p.injury?esc(p.injury):'Indicará su lesión en la próxima reseña'}${p.injurySince?' · desde '+fmtDay(p.injurySince):''}</small>`
        :p.injured?`<span class="tagp flag">Se marcó lesionado</span><small>Sigue con la encuesta general</small>`:`<span class="tagp">General</span>`;
      return`<div class="inj-row ${p.injuryMode?'mode':p.injured?'flag':''}"><div class="who"><b>${esc(p.name)}</b><div class="st">${state}</div></div>
        <div class="acts">${p.injuryMode?`<button data-heal="${p.id}">Dar de alta</button>`
          :`<button class="on" data-injmode="${p.id}">Activar modo lesión</button>${p.injured?`<button data-heal="${p.id}">Quitar marca</button>`:''}`}</div></div>`}).join('')+`</div>`
      :`<p class="muted-note">Este equipo aún no tiene jugadores.</p>`;
  }
  h+=`</div>`;
  $('#coachScroll').innerHTML=h;
}
$('#coachScroll').addEventListener('click',e=>{
  const t=store.team(ui.teamId);
  const tb=e.target.closest('[data-tab]'); if(tb){ui.coachTab=tb.dataset.tab;renderCoach();return}
  const tg=e.target.closest('[data-toggle]'); if(tg){const q=t.quizzes.find(x=>x.id===tg.dataset.toggle);q.active=!q.active;store.saveQuiz(t.id,q);renderCoach();return}
  const ed=e.target.closest('[data-edit]'); if(ed){openEditor(t.quizzes.find(x=>x.id===ed.dataset.edit));return}
  const dl=e.target.closest('[data-del-quiz]'); if(dl){armDelete(dl,()=>{store.removeQuiz(t.id,dl.dataset.delQuiz);renderCoach()});return}
  const hl=e.target.closest('[data-heal]'); if(hl){store.setInjuryMode(t.id,hl.dataset.heal,false);renderCoach();toast('Dado de alta');return}
  const im=e.target.closest('[data-injmode]'); if(im){const p=t.players.find(x=>x.id===im.dataset.injmode);store.setInjuryMode(t.id,p.id,true);renderCoach();toast(`${p.name} pasa a modo lesión`);return}
  if(e.target.closest('[data-new-quiz]'))openEditor(null);
});

/* ===== Editor ===== */
function defaultQuestion(style){
  const o=(emoji,label,color)=>({id:uid(),emoji,label,color});
  const q={id:uid(),text:'',style,options:[],scale:{steps:5,minLabel:'Nada',maxLabel:'Mucho'}};
  if(style==='emoji')q.options=[o('😫','Cansado','red'),o('😐','Normal','yellow'),o('🤩','Muy útil','green')];
  if(style==='color')q.options=[o('','Mal','red'),o('','Regular','yellow'),o('','Bien','green')];
  if(style==='multi')q.options=[o('💪','Fuerza','blue'),o('⚡','Velocidad','orange'),o('🎯','Técnica','purple')];
  return q;
}
let draft=null;
function openEditor(q){
  const tab=ui.coachTab;
  draft=q?JSON.parse(JSON.stringify(q)):{id:uid(),title:'',type:tab==='injured'?'injured':'normal',targetPlayerIds:[],active:true,questions:[defaultQuestion('emoji')],createdAt:Date.now(),_new:true};
  draft._custom=q?q.targetPlayerIds.length>0:tab==='custom';
  renderEditor();show('qedit');$('#edScroll').scrollTop=0;
}
function renderEditor(){
  const t=store.team(ui.teamId), d=draft;
  const kind=d._custom?'personalizado':(d.type==='injured'?'para lesionados':'para jugadores');
  $('#edTitle').innerHTML=`${d._new?'Nuevo':'Editar'} cuestionario<small>${kind} · ${esc(t.name)}</small>`;
  let h=`<div class="coach-wrap"><div class="ed-card">
    <div class="field"><label for="edQTitle">Título del cuestionario</label><input id="edQTitle" maxlength="48" placeholder="Ej. Sesión de saltos" value="${esc(d.title)}" autocomplete="off"></div>`;
  if(d._custom){
    const chosen=t.players.filter(p=>d.targetPlayerIds.includes(p.id));
    const group=chosen.length?!!chosen[0].injuryMode:null;
    h+=`<div class="field"><label>¿Para quién? <em>(puedes elegir varios)</em></label><div class="player-pick">`+t.players.map(p=>{
      const on=d.targetPlayerIds.includes(p.id), off=group!==null&&!on&&!!p.injuryMode!==group;
      return`<button type="button" class="${on?'on':''} ${off?'off':''}" data-pick="${p.id}" aria-pressed="${on}" ${off?'aria-disabled="true"':''}>${p.injuryMode?'<span class="dot" aria-hidden="true"></span>':''}${esc(p.name)}</button>`}).join('')+`</div>`;
    if(chosen.length){
      const names=esc(chosen.map(p=>p.name).join(', '));
      h+=group?`<div class="detect inj">${names}: en modo lesión. Se guarda como cuestionario de lesionado.</div>`
        :`<div class="detect ok">${names}: modo general. Se guarda como cuestionario normal.</div>`;
      h+=`<p class="muted-note pick-note">Solo se pueden juntar jugadores del mismo grupo (${group?'en modo lesión':'en modo general'}). Quita a todos para cambiar de grupo.</p>`;
    }
    h+=`</div>`;
  }
  h+=`</div>`;
  d.questions.forEach((q,i)=>{h+=`<div class="ed-card" data-q="${q.id}">${questionEditor(q,i)}</div>`});
  h+=`<button class="big-add" data-add-q>+ Añadir pregunta</button></div>`;
  $('#edScroll').innerHTML=h;
}
function questionEditor(q,i){
  let h=`<div class="ed-qhead"><b>Pregunta ${i+1}</b>${draft.questions.length>1?`<button class="sq-btn" data-del-q="${q.id}" aria-label="Quitar pregunta ${i+1}">×</button>`:''}</div>
    <div class="field"><label for="qt-${q.id}">Pregunta</label><input id="qt-${q.id}" data-qtext="${q.id}" maxlength="80" placeholder="Ej. ¿Qué tal el nuevo ejercicio de salto?" value="${esc(q.text)}" autocomplete="off"></div>
    <div class="field"><label>Estilo de respuesta</label><div class="styles">`+Object.entries(STYLES).map(([k,s])=>
      `<button type="button" class="style-opt ${q.style===k?'on':''}" data-style="${k}" aria-pressed="${q.style===k}"><span class="mini">${s.mini}</span>${s.name}<small class="muted-note" style="font-size:.72rem">${s.hint}</small></button>`).join('')+`</div></div>`;
  if(q.style==='scale'){
    h+=`<div class="field"><label>Número de posiciones</label><div class="steps-pick">${[5,10].map(n=>`<button type="button" class="${q.scale.steps===n?'on':''}" data-steps="${n}">${n}</button>`).join('')}</div></div>
      <div class="scale-cfg"><div class="field"><label for="smin-${q.id}">Texto a la izquierda</label><input id="smin-${q.id}" data-smin="${q.id}" maxlength="18" value="${esc(q.scale.minLabel)}"></div>
      <div class="field"><label for="smax-${q.id}">Texto a la derecha</label><input id="smax-${q.id}" data-smax="${q.id}" maxlength="18" value="${esc(q.scale.maxLabel)}"></div></div>`;
  }else{
    h+=`<div class="field"><label>Opciones</label>`+q.options.map(o=>`<div class="opt-row">
        ${q.style!=='color'?`<button type="button" class="emo" data-emo="${o.id}" aria-label="Cambiar emoji">${o.emoji||'＋'}</button>`:''}
        <input id="ol-${o.id}" data-olabel="${o.id}" maxlength="24" value="${esc(o.label)}" placeholder="Texto de la opción" aria-label="Texto de la opción">
        <span class="swatches">${COLORS.map(c=>`<button type="button" class="sw ${o.color===c?'on':''}" style="--c:var(--o-${c})" data-color="${c}" data-oid="${o.id}" aria-label="Color ${c}"></button>`).join('')}</span>
        ${q.options.length>2?`<button type="button" class="sq-btn" data-del-o="${o.id}" aria-label="Quitar opción">×</button>`:''}
      </div>`).join('')+(q.options.length<6?`<button type="button" class="add-opt" data-add-o>+ Añadir opción</button>`:'')+`</div>`;
  }
  h+=`<div class="preview"><div class="plabel">Así lo verá el jugador</div><div data-preview="${q.id}">${renderAnswer(q)}</div></div>`;
  return h;
}
function qById(id){return draft.questions.find(q=>q.id===id)}
function rerenderQ(qid){
  const i=draft.questions.findIndex(q=>q.id===qid), el=document.querySelector(`[data-q="${qid}"]`);
  if(el)el.innerHTML=questionEditor(draft.questions[i],i);
}
function refreshPreview(qid){const p=document.querySelector(`[data-preview="${qid}"]`);if(p)p.innerHTML=renderAnswer(qById(qid))}

$('#edScroll').addEventListener('input',e=>{
  const el=e.target;
  if(el.id==='edQTitle'){draft.title=el.value;return}
  if(el.dataset.qtext){qById(el.dataset.qtext).text=el.value;refreshPreview(el.dataset.qtext);return}
  if(el.dataset.smin){qById(el.dataset.smin).scale.minLabel=el.value;refreshPreview(el.dataset.smin);return}
  if(el.dataset.smax){qById(el.dataset.smax).scale.maxLabel=el.value;refreshPreview(el.dataset.smax);return}
  if(el.dataset.olabel){const qid=el.closest('[data-q]').dataset.q;qById(qid).options.find(o=>o.id===el.dataset.olabel).label=el.value;refreshPreview(qid);return}
});
$('#edScroll').addEventListener('click',e=>{
  const pk=e.target.closest('[data-pick]');
  if(pk){
    const t=store.team(ui.teamId),id=pk.dataset.pick,p=t.players.find(x=>x.id===id);
    if(pk.getAttribute('aria-disabled')==='true'){toast(p.injuryMode?'Ese jugador está en modo lesión: no se puede mezclar con jugadores en modo general.':'Ese jugador está en modo general: no se puede mezclar con jugadores en modo lesión.');return}
    const ids=draft.targetPlayerIds;
    draft.targetPlayerIds=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];
    const first=t.players.find(x=>x.id===draft.targetPlayerIds[0]);
    if(first)draft.type=first.injuryMode?'injured':'normal';
    const y=$('#edScroll').scrollTop;renderEditor();$('#edScroll').scrollTop=y;return}
  if(e.target.closest('[data-add-q]')){draft.questions.push(defaultQuestion('emoji'));renderEditor();
    const last=draft.questions[draft.questions.length-1];setTimeout(()=>{document.querySelector(`[data-q="${last.id}"]`)?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});document.getElementById('qt-'+last.id)?.focus({preventScroll:true})},50);return}
  const card=e.target.closest('[data-q]'); if(!card)return;
  const q=qById(card.dataset.q);
  const dq=e.target.closest('[data-del-q]'); if(dq){armDelete(dq,()=>{draft.questions=draft.questions.filter(x=>x.id!==q.id);renderEditor()});return}
  const st=e.target.closest('[data-style]');
  if(st){const ns=st.dataset.style;if(ns===q.style)return;
    const keep=q.text;const fresh=defaultQuestion(ns);
    if(ns!=='scale'&&q.style!=='scale'){fresh.options=q.options.map(o=>({...o,emoji:ns==='color'?o.emoji:(o.emoji||'🙂')}))}
    Object.assign(q,{style:ns,options:fresh.options,scale:q.scale||fresh.scale,text:keep});rerenderQ(q.id);return}
  const sp=e.target.closest('[data-steps]'); if(sp){q.scale.steps=+sp.dataset.steps;rerenderQ(q.id);return}
  const sw=e.target.closest('[data-color]'); if(sw){q.options.find(o=>o.id===sw.dataset.oid).color=sw.dataset.color;rerenderQ(q.id);return}
  const dO=e.target.closest('[data-del-o]'); if(dO){q.options=q.options.filter(o=>o.id!==dO.dataset.delO);rerenderQ(q.id);return}
  if(e.target.closest('[data-add-o]')){const c=COLORS[q.options.length%COLORS.length];const o={id:uid(),emoji:q.style==='color'?'':'🙂',label:'',color:c};q.options.push(o);rerenderQ(q.id);setTimeout(()=>document.getElementById('ol-'+o.id)?.focus(),30);return}
  const em=e.target.closest('[data-emo]'); if(em){pickEmoji(e2=>{q.options.find(o=>o.id===em.dataset.emo).emoji=e2;rerenderQ(q.id)});return}
  const pv=e.target.closest('[data-preview]'); if(pv){previewTap(e,q,pv)}
});
function pickEmoji(cb){
  const back=document.createElement('div');back.className='modal-back';
  back.innerHTML=`<div class="modal"><h2>Elige un emoji</h2><div class="emoji-grid">${EMOJIS.map(x=>`<button type="button" data-e="${x}">${x}</button>`).join('')}</div></div>`;
  $('#layer').appendChild(back);
  back.addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(b){cb(b.dataset.e);back.remove()}else if(e.target===back)back.remove()});
}
$('#edCancel').onclick=()=>{draft=null;renderCoach();show('coach')};
$('#edSave').onclick=()=>{
  const d=draft;
  const fail=m=>{toast(m);return};
  if(!d.title.trim())return fail('Ponle un título al cuestionario.');
  if(d._custom&&!d.targetPlayerIds.length)return fail('Elige al menos un jugador.');
  for(const [i,q] of d.questions.entries()){
    if(!q.text.trim())return fail(`Escribe el texto de la pregunta ${i+1}.`);
    if(q.style!=='scale'&&q.options.filter(o=>o.label.trim()).length<2)return fail(`La pregunta ${i+1} necesita al menos 2 opciones con texto.`);
  }
  const clean={...d,title:d.title.trim(),questions:d.questions.map(q=>({...q,text:q.text.trim(),options:q.style==='scale'?[]:q.options.filter(o=>o.label.trim()).map(o=>({...o,label:o.label.trim()}))}))};
  delete clean._new;delete clean._custom;
  if(!d._custom)clean.targetPlayerIds=[];
  store.saveQuiz(ui.teamId,clean);
  ui.coachTab=d._custom?'custom':clean.type;
  draft=null;renderCoach();show('coach');toast('Cuestionario guardado');
};

/* ===== Respuestas: lo que ve el jugador (se reutiliza en la fase 3) ===== */
const previewState={};
/* Color continuo rojo → naranja → amarillo → verde para r entre 0 y 1 */
function mixColor(r){
  r=Math.max(0,Math.min(1,r));const st=['red','orange','yellow','green'];
  const seg=Math.min(2,Math.floor(r*3)),t=Math.round((r*3-seg)*100);
  return`color-mix(in srgb, var(--o-${st[seg+1]}) ${t}%, var(--o-${st[seg]}))`;
}
/* Línea deslizante fluida: empieza neutra (gris) y se colorea al moverla */
function scaleVars(v,steps){const r=(v-1)/(steps-1);return`--sc:${mixColor(r)};--p:${(r*100).toFixed(1)}%`}
function applyScale(wrap,v,steps){
  wrap.classList.remove('untouched');
  const r=(v-1)/(steps-1);
  wrap.style.setProperty('--sc',mixColor(r));wrap.style.setProperty('--p',(r*100).toFixed(1)+'%');
  wrap.querySelector('.num').textContent=Math.round(v);
}
function renderAnswer(q,state){
  state=state||previewState[q.id]||{};
  const title=`<p class="ans-q">${esc(q.text)||'<span class="muted-note">Escribe la pregunta…</span>'}</p>`;
  if(q.style==='scale'){
    const steps=q.scale.steps,touched=state.value!=null,v=touched?state.value:(1+steps)/2;
    return title+`<div class="ans-scale ${touched?'':'untouched'}" style="${touched?scaleVars(v,steps):''}"><div class="num">${touched?Math.round(v):'–'}</div>
      <input type="range" min="1" max="${steps}" step="0.01" value="${v}" data-range aria-label="${esc(q.text||'Valor')}">
      <div class="ends"><span>${esc(q.scale.minLabel)}</span><span>${esc(q.scale.maxLabel)}</span></div></div>`;
  }
  const sel=state.sel||[];
  const opts=q.options.filter(o=>o.label.trim()||o.emoji);
  if(q.style==='emoji')return title+`<div class="ans-row">`+opts.map(o=>`<button type="button" class="ans-emoji ${sel.includes(o.id)?'sel':''}" style="--c:var(--o-${o.color})" data-ans="${o.id}"><span class="e">${o.emoji||'🙂'}</span>${esc(o.label)}</button>`).join('')+`</div>`;
  if(q.style==='color')return title+`<div class="ans-row ${sel.length?'has-sel':''}">`+opts.map(o=>`<button type="button" class="ans-color ${sel.includes(o.id)?'sel':''}" style="--c:var(--o-${o.color})" data-ans="${o.id}"><span class="disc">${CHECK}</span>${esc(o.label)}</button>`).join('')+`</div>`;
  return title+`<div class="ans-row">`+opts.map(o=>`<button type="button" class="ans-multi ${sel.includes(o.id)?'sel':''}" style="--c:var(--o-${o.color})" data-ans="${o.id}" aria-pressed="${sel.includes(o.id)}">${o.emoji?`<span class="e">${o.emoji}</span>`:''}${esc(o.label)}<span class="box">${CHECK}</span></button>`).join('')+`</div>`;
}
function previewTap(e,q,pv){
  const b=e.target.closest('[data-ans]');if(!b)return;
  const st=previewState[q.id]=previewState[q.id]||{sel:[]};st.sel=st.sel||[];
  const id=b.dataset.ans;
  if(q.style==='multi')st.sel=st.sel.includes(id)?st.sel.filter(x=>x!==id):[...st.sel,id];
  else st.sel=st.sel[0]===id?[]:[id];
  pv.innerHTML=renderAnswer(q);
}
$('#edScroll').addEventListener('input',e=>{
  if(!e.target.matches('[data-range]'))return;
  const card=e.target.closest('[data-q]'),q=qById(card.dataset.q),v=+e.target.value;
  previewState[q.id]={value:v};
  applyScale(e.target.closest('.ans-scale'),v,q.scale.steps);
});

/* ===== Fase 3: reseña del jugador ===== */
const FACES=['😫','😣','😕','😐','🙂','😊','😄','😁','🤩','🔥'];
const rv={playerId:null,mood:null,answers:{},ck:{},comment:'',injury:''};
const CHECKS=[['pain','¿He tenido dolor?'],['warmup','¿He calentado?'],['stretch','¿He estirado?']];
const INJ_CHIPS=['Tobillo','Rodilla','Muslo','Gemelo','Espalda','Hombro','Muñeca / mano','Cabeza'];
/* Modo lesión (lo activa el entrenador) -> cuestionarios de lesionados. "Estoy lesionado" sin modo -> encuesta general. */
function quizzesForPlayer(t,p){
  return t.quizzes.filter(q=>q.active&&(q.targetPlayerIds.length?q.targetPlayerIds.includes(p.id):q.type===(p.injuryMode?'injured':'normal')));
}
function curPlayer(){return store.team(ui.teamId).players.find(x=>x.id===rv.playerId)}
function openReview(pid){
  rv.playerId=pid;rv.mood=null;rv.answers={};rv.ck={};rv.comment='';rv.injury='';ui.unlocked=false;
  setMood(null);
  renderReview();show('review');$('#qCol').scrollTop=0;
}
function renderReview(){
  const t=store.team(ui.teamId),p=curPlayer();
  $('#rvName').innerHTML=`${esc(p.name)}<small>${p.injuryMode?'Modo lesión'+(p.injury?' · '+esc(p.injury):''):'¿Qué tal el entrenamiento?'}</small>`;
  $('#review').classList.toggle('injury-mode',!!p.injuryMode);
  const ib=$('#rvInj');ib.hidden=!!p.injuryMode;ib.classList.toggle('on',p.injured);ib.setAttribute('aria-pressed',p.injured);
  $('#rvInjTxt').textContent=p.injured?'Ya estoy bien':'Estoy lesionado';
  const qs=quizzesForPlayer(t,p);
  // descarta respuestas de cuestionarios que ya no tocan (al cambiar el estado de lesión)
  Object.keys(rv.answers).forEach(k=>{if(!qs.some(q=>k.startsWith(q.id+':')))delete rv.answers[k]});
  const injBlock=p.injuryMode?`<div class="rv-quiz rv-injury" data-injblock>
      <div class="qlabel"><span class="tagp inj">Modo lesión</span>Obligatorio</div>
      ${p.injury?'':`<div class="qitem"><p class="ans-q">¿Qué lesión tienes?</p>
        <input id="rvInjury" class="rv-input" maxlength="60" placeholder="Ej. esguince de tobillo" value="${esc(rv.injury)}" autocomplete="off">
        <div class="chips">${INJ_CHIPS.map(c=>`<button type="button" class="chip" data-injchip="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>`}
      <div class="qitem"><p class="ans-q">Checklist de hoy</p><div class="ck-list">${CHECKS.map(([k,l])=>{const v=rv.ck[k];
        return`<div class="ck-row"><span>${l}</span><div class="yn" role="group" aria-label="${l}">
          <button type="button" class="yn-b ${v===true?'sel':''} ${k==='pain'?'bad':'good'}" data-ck="${k}" data-v="1" aria-pressed="${v===true}">Sí</button>
          <button type="button" class="yn-b ${v===false?'sel':''} ${k==='pain'?'good':'meh'}" data-ck="${k}" data-v="0" aria-pressed="${v===false}">No</button></div></div>`}).join('')}</div></div>
      <div class="qitem"><p class="ans-q">Comentarios <span class="muted-note" style="font-family:var(--body);text-transform:none;font-size:.9rem">(opcional)</span></p>
        <textarea id="rvComment" class="rv-input" maxlength="500" rows="3" placeholder="¿Qué has notado hoy? ¿Dónde te ha dolido?">${esc(rv.comment)}</textarea></div>
    </div>`:'';
  $('#qCol').innerHTML=injBlock+(qs.length?qs.map(q=>`<div class="rv-quiz" data-rvquiz="${q.id}">
      <div class="qlabel">${esc(q.title)}${q.type==='injured'?'<span class="tagp inj">Lesionado</span>':''}${q.targetPlayerIds.length?'<span class="tagp">Solo para ti</span>':''}</div>
      ${q.questions.map(qq=>`<div class="qitem" data-rvq="${q.id}:${qq.id}">${renderAnswer(qq,rv.answers[q.id+':'+qq.id]||{})}</div>`).join('')}
    </div>`).join('')
    :(p.injuryMode?'':`<div class="rv-none">Hoy solo la barra. Tu entrenador no ha activado cuestionarios para esta sesión.</div>`));
  updateStatus();
}
function findQ(key){const[qid,qqid]=key.split(':');const q=store.team(ui.teamId).quizzes.find(x=>x.id===qid);return{quiz:q,q:q?.questions.find(x=>x.id===qqid)}}
function pendingCount(){
  const t=store.team(ui.teamId),p=curPlayer();let n=0;
  quizzesForPlayer(t,p).forEach(q=>q.questions.forEach(qq=>{const a=rv.answers[q.id+':'+qq.id];
    if(!a||(qq.style==='scale'?a.value==null:!(a.sel&&a.sel.length)))n++}));
  if(p.injuryMode){if(!p.injury&&!rv.injury.trim())n++;CHECKS.forEach(([k])=>{if(rv.ck[k]==null)n++})}
  return n;
}
function updateStatus(){
  const left=pendingCount(),ok=rv.mood!=null&&left===0;
  $('#rvSend').setAttribute('aria-disabled',!ok);
  const p=curPlayer(),needInj=p.injuryMode&&!p.injury&&!rv.injury.trim(),needCk=p.injuryMode&&CHECKS.some(([k])=>rv.ck[k]==null);
  $('#rvStatus').textContent=rv.mood==null?'Primero, arrastra la barra':needInj?'Escribe cuál es tu lesión':needCk?'Completa el checklist':left?`Te ${left===1?'falta 1 pregunta':'faltan '+left+' preguntas'}`:'¡Listo para enviar!';
  const ib=document.querySelector('[data-injblock]');if(ib)ib.classList.toggle('done-q',!needInj&&!needCk);
  document.querySelectorAll('[data-rvquiz]').forEach(el=>{
    const q=store.team(ui.teamId).quizzes.find(x=>x.id===el.dataset.rvquiz);
    const done=q.questions.every(qq=>{const a=rv.answers[q.id+':'+qq.id];return a&&(qq.style==='scale'?a.value!=null:a.sel?.length)});
    el.classList.toggle('done-q',done);
  });
}
$('#qCol').addEventListener('click',e=>{
  const ck=e.target.closest('[data-ck]');
  if(ck){rv.ck[ck.dataset.ck]=ck.dataset.v==='1';
    ck.parentElement.querySelectorAll('.yn-b').forEach(x=>{const on=x===ck;x.classList.toggle('sel',on);x.setAttribute('aria-pressed',on)});updateStatus();return}
  const chip=e.target.closest('[data-injchip]');
  if(chip){const i=$('#rvInjury');i.value=chip.dataset.injchip;rv.injury=i.value;i.focus();updateStatus();return}
  const b=e.target.closest('[data-ans]');if(!b)return;
  const item=b.closest('[data-rvq]'),key=item.dataset.rvq,{q}=findQ(key);
  const st=rv.answers[key]=rv.answers[key]||{sel:[]};st.sel=st.sel||[];
  const id=b.dataset.ans;
  if(q.style==='multi')st.sel=st.sel.includes(id)?st.sel.filter(x=>x!==id):[...st.sel,id];
  else st.sel=st.sel[0]===id?[]:[id];
  item.innerHTML=renderAnswer(q,st);updateStatus();
});
$('#qCol').addEventListener('input',e=>{
  if(e.target.id==='rvInjury'){rv.injury=e.target.value;updateStatus();return}
  if(e.target.id==='rvComment'){rv.comment=e.target.value;return}
  if(!e.target.matches('[data-range]'))return;
  const item=e.target.closest('[data-rvq]'),key=item.dataset.rvq,{q}=findQ(key),v=+e.target.value;
  rv.answers[key]={value:v};applyScale(e.target.closest('.ans-scale'),v,q.scale.steps);updateStatus();
});

/* Barra principal vertical: arrastre fluido, imán suave a 10 posiciones al soltar */
const track=$('#moodTrack');let dragging=false;
function setMood(v,{snap=false}={}){
  const col=$('#barCol'),vig=$('#vignette'),view=$('#review');
  if(v==null){col.classList.add('untouched');track.style.setProperty('--h','0%');view.style.setProperty('--mc','var(--muted)');
    $('#moodNum').textContent='–';$('#moodFace').textContent='🙂';$('#moodHint').hidden=false;vig.style.setProperty('--vo','0');return}
  rv.mood=v;col.classList.remove('untouched');$('#moodHint').hidden=true;
  const r=(v-1)/9;
  track.classList.toggle('snapping',snap);
  track.style.setProperty('--h',(r*100).toFixed(2)+'%');
  view.style.setProperty('--mc',mixColor(r));
  $('#moodNum').textContent=Math.round(v);
  $('#moodFace').textContent=FACES[Math.round(v)-1];
  track.setAttribute('aria-valuenow',Math.round(v));
  vig.style.setProperty('--vo',dragging?'.9':'.45');
}
function moodFromY(y){const r=track.getBoundingClientRect();return 1+9*Math.max(0,Math.min(1,1-(y-r.top)/r.height))}
track.addEventListener('pointerdown',e=>{dragging=true;track.setPointerCapture(e.pointerId);setMood(moodFromY(e.clientY))});
track.addEventListener('pointermove',e=>{if(dragging)setMood(moodFromY(e.clientY))});
const endDrag=()=>{if(!dragging)return;dragging=false;setMood(Math.round(rv.mood),{snap:true});onBarRelease(rv.mood)};
track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);
track.addEventListener('keydown',e=>{
  if(!['ArrowUp','ArrowDown','ArrowRight','ArrowLeft'].includes(e.key))return;e.preventDefault();
  const cur=rv.mood==null?0:Math.round(rv.mood),d=(e.key==='ArrowUp'||e.key==='ArrowRight')?1:-1;
  setMood(Math.max(1,Math.min(10,(cur||1)+(rv.mood==null?0:d))),{snap:true});updateStatus();
});
/* Enganche para decidir más adelante qué pasa al soltar la barra */
function onBarRelease(value){
  track.classList.remove('released');void track.offsetWidth;track.classList.add('released');
  try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}
  updateStatus();
}

$('#rvInj').onclick=()=>{
  const p=curPlayer();store.setInjured(ui.teamId,p.id,!p.injured);
  renderReview();
  toast(p.injured?'Marcado como lesionado. Se guarda para las próximas sesiones.':'Ya no apareces como lesionado.');
};
$('#rvBack').onclick=()=>{renderTeam();show('team')};
let sending=false;
$('#rvSend').onclick=async()=>{
  if(sending)return;
  if($('#rvSend').getAttribute('aria-disabled')==='true'){
    toast(rv.mood==null?'Arrastra la barra para decir cómo ha ido.':$('#rvStatus').textContent);return}
  const t=store.team(ui.teamId),p=curPlayer();
  const answers=[];
  quizzesForPlayer(t,p).forEach(q=>q.questions.forEach(qq=>{
    const a=rv.answers[q.id+':'+qq.id];
    answers.push({quizId:q.id,quizTitle:q.title,questionId:qq.id,question:qq.text,style:qq.style,
      value:qq.style==='scale'?Math.round(a.value*10)/10:null,steps:qq.style==='scale'?qq.scale.steps:null,
      options:qq.style==='scale'?[]:qq.options.filter(o=>a.sel.includes(o.id)).map(o=>o.label),
      colors:qq.style==='scale'?[]:qq.options.filter(o=>a.sel.includes(o.id)).map(o=>o.color)});
  }));
  const extra={mode:'general'};
  if(p.injuryMode){
    if(!p.injury)store.setPlayerInjury(t.id,p.id,rv.injury.trim().slice(0,60));
    Object.assign(extra,{mode:'injury',injury:p.injury,checklist:{pain:rv.ck.pain,warmup:rv.ck.warmup,stretch:rv.ck.stretch},comment:rv.comment.trim().slice(0,500)});
  }
  sending=true;$('#rvSend').setAttribute('aria-busy','true');$('#rvSend').textContent='Enviando…';
  try{await store.addResponse({id:uid(),teamId:t.id,playerId:p.id,playerName:p.name,mood:Math.round(rv.mood),injured:p.injured||!!p.injuryMode,answers,...extra})}
  catch(err){toast(err.message);if(err.code==='duplicate'){renderTeam();show('team')}return}
  finally{sending=false;$('#rvSend').removeAttribute('aria-busy');$('#rvSend').textContent='Enviar'}
  const d=document.createElement('div');d.className='done-screen';d.style.setProperty('--mc',$('#review').style.getPropertyValue('--mc'));
  d.innerHTML=`<div><div class="ok">${CHECK}</div><h2>¡Gracias, ${esc(p.name)}!</h2><p>Tu reseña está guardada</p></div>`;
  document.body.appendChild(d);
  setTimeout(()=>{renderTeam();show('team');d.animate([{opacity:1},{opacity:0}],{duration:250,fill:'forwards'}).onfinish=()=>d.remove()},1400);
};

/* ===== Borrado en dos toques (sin confirm()) ===== */
function armDelete(btn,fn){
  if(btn.classList.contains('armed')){fn();return}
  btn.classList.add('armed');btn.textContent='¿Borrar?';
  setTimeout(()=>{if(btn.isConnected){btn.classList.remove('armed');btn.textContent='×'}},2500);
}

/* ===== Formularios ===== */
function modal(html,onSubmit,submitLabel='Guardar'){
  const back=document.createElement('div');back.className='modal-back';
  back.innerHTML=`<form class="modal" novalidate>${html}<p class="err" id="formErr"></p><div class="modal-actions"><button type="button" class="btn-ghost" data-cancel>Cancelar</button><button type="submit" class="btn-main">${esc(submitLabel)}</button></div></form>`;
  $('#layer').appendChild(back);
  const form=back.querySelector('form');
  const close=()=>back.remove();
  back.addEventListener('click',e=>{if(e.target===back||e.target.closest('[data-cancel]'))close()});
  back.querySelectorAll('[data-fill]').forEach(ch=>ch.onclick=()=>{const i=form.querySelector('#'+ch.dataset.fill);i.value=ch.textContent;i.focus()});
  form.addEventListener('submit',e=>{e.preventDefault();const err=onSubmit(form);if(err==='__keep')return;if(err){form.querySelector('#formErr').textContent=err}else close()});
  setTimeout(()=>form.querySelector('input')?.focus(),60);
}
function openTeamForm(){
  modal(`<h2>Nuevo equipo</h2>
    <div class="field"><label for="fTeamName">Nombre del equipo</label><input id="fTeamName" maxlength="28" placeholder="Ej. Cadete A" autocomplete="off"></div>
    <div class="field"><label for="fTeamCat">Categoría</label><input id="fTeamCat" maxlength="32" placeholder="Ej. Infantil femenino" autocomplete="off">
      <div class="chips">${CATS.map(c=>`<button type="button" class="chip" data-fill="fTeamCat">${c}</button>`).join('')}</div></div>`,
  f=>{
    const n=f.querySelector('#fTeamName').value.trim(),c=f.querySelector('#fTeamCat').value.trim();
    if(!n)return'Ponle un nombre al equipo.'; if(!c)return'Indica la categoría.';
    store.addTeam(ui.sport,n,c); ui.editTeams=false; renderSport(); toast(`Equipo ${n} creado`); return null;
  });
}
function openPlayerForm(){
  const t=store.team(ui.teamId);
  modal(`<h2>Nuevo jugador</h2>
    <div class="field"><label for="fPName">Nombre</label><input id="fPName" maxlength="20" placeholder="Ej. Lucía" autocomplete="off"></div>
    <div class="field"><label for="fPPos">Posición <em>(opcional)</em></label><input id="fPPos" maxlength="20" placeholder="Ej. Base" autocomplete="off">
      <div class="chips">${POS[t.sport].map(c=>`<button type="button" class="chip" data-fill="fPPos">${c}</button>`).join('')}</div></div>`,
  f=>{
    const n=f.querySelector('#fPName').value.trim(),p=f.querySelector('#fPPos').value.trim();
    if(!n)return'Escribe el nombre del jugador.';
    if(t.players.some(x=>x.name.toLowerCase()===n.toLowerCase()))return'Ya hay un jugador con ese nombre en el equipo.';
    store.addPlayer(t.id,n,p); renderTeam(); return null;
  });
}

let toastT;
function toast(msg){
  document.querySelector('.toast')?.remove(); clearTimeout(toastT);
  const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=msg;document.body.appendChild(d);
  toastT=setTimeout(()=>d.remove(),2800);
}

/* ===== Fase 4: gráficas ===== */
const LINE_COLORS=['blue','purple','orange','green','red','yellow'];
const HEX={red:'#E5484D',orange:'#F2811D',yellow:'#C99A00',green:'#2FA864',blue:'#2F7FE0',purple:'#8B5CF6'};
const st={teamId:null,sel:[],range:'all',split:false,q:'',mode:'general'};
const rDay=r=>r.day||dayKey(r.ts);
const dayKey=ts=>{const d=new Date(ts);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const DOW=['dom','lun','mar','mié','jue','vie','sáb'],MON=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fmtDay=k=>{const[y,m,d]=k.split('-').map(Number);const dt=new Date(y,m-1,d);return`${DOW[dt.getDay()]} ${d} ${MON[m-1]}`};
const fmtShort=k=>{const[,m,d]=k.split('-').map(Number);return`${d}/${m}`};
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const f1=v=>v==null?'–':(Math.round(v*10)/10).toLocaleString('es-ES');

function openStats(teamId){
  st.teamId=teamId;st.sel=[];st.split=false;st.q='';
  renderStats();show('stats');$('#statsScroll').scrollTop=0;
}
$('#statsBack').onclick=()=>{renderSport();show('sport')};

function computeStats(){
  const t=store.team(st.teamId),inj=st.mode==='injury';
  // Un jugador borrado deja de contar en las estadísticas
  const alive=new Set(t.players.map(p=>p.id));
  const all=store.data.responses.filter(r=>r.teamId===t.id&&alive.has(r.playerId)&&((r.mode||'general')==='injury')===inj);
  let days=[...new Set(all.map(rDay))].sort();
  if(st.range!=='all')days=days.slice(-(+st.range));
  const byDay={};days.forEach(k=>byDay[k]=[]);
  all.forEach(r=>{const k=rDay(r);if(byDay[k])byDay[k].push(r)});
  const focus=st.sel.length?st.sel:null;
  const inc=r=>!focus||focus.includes(r.playerId);
  const respPids=new Set(days.flatMap(k=>byDay[k].map(r=>r.playerId)));
  const roster=inj?t.players.filter(p=>(!focus||focus.includes(p.id))&&respPids.has(p.id)):(focus?t.players.filter(p=>focus.includes(p.id)):t.players);
  const existed=(p,k)=>!p.createdAt||dayKey(p.createdAt)<=k;
  const nameOf=id=>t.players.find(p=>p.id===id)?.name||'?';
  // Serie principal (media) con marcas: lesionado (general) o dolor (lesión)
  const single=focus&&focus.length===1?focus[0]:null;
  const main=days.map(k=>{const rs=byDay[k].filter(inc);if(!rs.length)return null;
    const r1=single?rs[0]:null;
    return{k,v:avg(rs.map(r=>r.mood)),n:rs.length,
      flag:inj?rs.some(r=>r.checklist?.pain):(single?!!r1.injured:false),
      pain:rs.filter(r=>r.checklist?.pain).length,injury:r1?.injury||''}});
  const indiv=st.split&&focus&&focus.length>1?focus.map((id,i)=>({id,name:nameOf(id),color:LINE_COLORS[i%LINE_COLORS.length],
    pts:days.map(k=>{const r=byDay[k].find(x=>x.playerId===id);return r?{k,v:r.mood,flag:inj?!!r.checklist?.pain:!!r.injured,injury:r.injury||''}:null})})):[];
  // Franjas de lesión (modo general, jugador concreto): rachas seguidas de reseñas marcadas como lesionado
  const bands=[];
  if(!inj&&(single||indiv.length)){
    const series=single?[{color:'red',pts:main}]:indiv;
    series.forEach(sr=>{let cur=null;sr.pts.forEach(pt=>{if(!pt)return;
      if(pt.flag){if(!cur)cur={from:pt.k,to:pt.k};else cur.to=pt.k}else if(cur){bands.push(cur);cur=null}});if(cur)bands.push(cur)});
  }
  const moods=days.flatMap(k=>byDay[k].filter(inc).map(r=>r.mood));
  const att=inj?[]:days.map(k=>{const el=roster.filter(p=>existed(p,k));return el.length?byDay[k].filter(r=>el.some(p=>p.id===r.playerId)).length/el.length:null}).filter(x=>x!=null);
  const lastPt=main.filter(Boolean).pop();
  const rows=days.slice().reverse().map(k=>({k,cells:roster.map(p=>{
    if(!inj&&!existed(p,k))return{na:true};const r=byDay[k].find(x=>x.playerId===p.id);
    return r?{mood:r.mood,injured:r.injured,ck:r.checklist,comment:r.comment}:(inj?{none:true}:{abs:true})}),
    avg:avg(byDay[k].filter(inc).map(r=>r.mood))}));
  // Registro de lesión: una fila por reseña, consultable y exportable
  const log=inj?days.slice().reverse().flatMap(k=>byDay[k].filter(inc).map(r=>({k,name:nameOf(r.playerId),injury:r.injury,mood:r.mood,ck:r.checklist||{},comment:r.comment||''}))):[];
  const ckSum=inj?CHECKS.map(([key,label])=>{const rs=days.flatMap(k=>byDay[k].filter(inc));const yes=rs.filter(r=>r.checklist?.[key]).length;return{key,label,yes,n:rs.length}}):[];
  // Resumen de cuestionarios (solo los del modo actual)
  const qmap=new Map();
  const optColor=(qz,qq,lb)=>t.quizzes.find(x=>x.id===qz)?.questions.find(x=>x.id===qq)?.options.find(o=>o.label===lb)?.color;
  days.forEach(k=>byDay[k].filter(inc).forEach(r=>(r.answers||[]).forEach(a=>{
    const key=a.quizId+'|'+a.questionId;
    if(!qmap.has(key))qmap.set(key,{quiz:a.quizTitle,question:a.question,style:a.style,steps:a.steps,counts:{},colors:{},values:[],n:0});
    const e=qmap.get(key);e.n++;
    if(a.style==='scale'){if(a.value!=null)e.values.push(a.value)}else a.options.forEach((o,i)=>{e.counts[o]=(e.counts[o]||0)+1;if(!e.colors[o])e.colors[o]=a.colors?.[i]||optColor(a.quizId,a.questionId,o)});
  })));
  return{t,inj,days,byDay,main,indiv,bands,roster,rows,log,ckSum,single,qsum:[...qmap.values()],
    kpi:{avg:avg(moods),last:lastPt?.v??null,lastDay:lastPt?.k||null,sessions:days.length,att:avg(att),n:moods.length,
      pain:inj&&moods.length?ckSum[0].yes/ckSum[0].n:null}};
}

/* Gráfica con eje temporal real: la distancia entre puntos es el tiempo que pasó */
const dms=k=>{const[y,m,d]=k.split('-').map(Number);return Date.UTC(y,m-1,d)};
const DAY=864e5;
function chartSVG(S,w,{exp=false}={}){
  const h=Math.max(260,Math.min(360,w*.45)),m={l:34,r:22,t:22,b:40};
  const iw=w-m.l-m.r,ih=h-m.t-m.b;
  let t0=dms(S.days[0]),t1=dms(S.days[S.days.length-1]);
  const pad=Math.max(DAY,(t1-t0)*.03);if(t1-t0<7*DAY){const c=(t0+t1)/2;t0=c-3.5*DAY;t1=c+3.5*DAY}else{t0-=pad;t1+=pad}
  const x=k=>m.l+(dms(k)-t0)/(t1-t0)*iw,y=v=>m.t+ih-(v-1)/9*ih;
  const col=c=>exp?HEX[c]:`var(--o-${c})`;
  const ink=exp?'#16202B':'var(--ink)',muted=exp?'#5B6878':'var(--muted)',grid=exp?'#E3E8EE':'var(--board-line)',surf=exp?'#fff':'var(--surface)';
  const font=exp?'font-family="Helvetica,Arial,sans-serif"':'';
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${font} role="img" aria-label="Evolución de la barra por fecha">`;
  if(exp)s+=`<rect width="${w}" height="${h}" fill="#fff"/>`;
  // Eje Y: del 1 al 10, número a número
  for(let v=1;v<=10;v++)s+=`<line x1="${m.l}" x2="${m.l+iw}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}" stroke-width="${v===1||v===5||v===10?1.4:.8}" class="grid"/><text x="${m.l-8}" y="${y(v)+4}" text-anchor="end" fill="${muted}" font-size="11" font-weight="600" class="ax">${v}</text>`;
  // Eje X: meses (o semanas si el periodo es corto)
  const span=(t1-t0)/DAY,ticks=[];
  if(span>62){const d=new Date(t0);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+1);
    while(d.getTime()<=t1){ticks.push({ms:d.getTime(),lb:MON[d.getUTCMonth()]+(d.getUTCMonth()===0?' '+String(d.getUTCFullYear()).slice(2):''),major:true});d.setUTCMonth(d.getUTCMonth()+1)}}
  else{const d=new Date(t0);const dow=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-dow+7);
    const stepW=span>28?14:7;
    while(d.getTime()<=t1){const ms=d.getTime();ticks.push({ms,lb:`${d.getUTCDate()} ${MON[d.getUTCMonth()]}`,major:d.getUTCDate()<=stepW});d.setUTCDate(d.getUTCDate()+stepW)}}
  ticks.forEach(tk=>{const xx=m.l+(tk.ms-t0)/(t1-t0)*iw;if(xx<m.l||xx>m.l+iw)return;
    s+=`<line x1="${xx}" x2="${xx}" y1="${m.t}" y2="${m.t+ih}" stroke="${grid}" stroke-width=".8" stroke-dasharray="${tk.major?'':'3 4'}"/><text x="${xx}" y="${h-14}" text-anchor="middle" fill="${muted}" font-size="11" font-weight="700" class="ax">${tk.lb}</text>`});
  // Franjas de lesión
  S.bands.forEach(b=>{const x0=x(b.from)-6,x1=x(b.to)+6;
    s+=`<rect x="${x0}" y="${m.t}" width="${Math.max(12,x1-x0)}" height="${ih}" fill="${col('red')}" fill-opacity=".12" rx="4"/><text x="${x0+4}" y="${m.t+12}" fill="${col('red')}" font-size="10" font-weight="800">LESIÓN</text>`});
  // Línea: tramo rojo si ambos extremos están marcados; discontinua si hubo sesiones sin reseña entre medias
  const line=(pts,baseColor,width)=>{let out='',prev=null,gap=false;
    pts.forEach(pt=>{if(!pt){if(prev)gap=true;return}
      if(prev){const red=!S.inj&&prev.flag&&pt.flag;
        out+=`<line x1="${x(prev.k).toFixed(1)}" y1="${y(prev.v).toFixed(1)}" x2="${x(pt.k).toFixed(1)}" y2="${y(pt.v).toFixed(1)}" stroke="${red?col('red'):baseColor}" stroke-width="${width}" stroke-linecap="round"${gap?' stroke-dasharray="6 6"':''}/>`}
      prev=pt;gap=false});return out};
  const dot=(pt,baseColor,r,label)=>{const fl=pt.flag;
    const fill=fl?col('red'):(S.inj?surf:baseColor===ink?surf:baseColor);
    const tip=`${label?label+' · ':''}${fmtDay(pt.k)}: ${f1(pt.v)}${pt.n>1?` (media de ${pt.n})`:''}${S.inj&&pt.injury?' · '+pt.injury:''}${S.inj?(pt.pain?(S.single||pt.n===1?' · con dolor':` · ${pt.pain} de ${pt.n} con dolor`):''):(fl?' · lesionado':'')}`;
    return`<circle cx="${x(pt.k)}" cy="${y(pt.v)}" r="${r}" fill="${fill}" stroke="${fl?col('red'):baseColor}" stroke-width="2.6"><title>${esc(tip)}</title></circle>`};
  S.indiv.forEach(l=>{s+=line(l.pts,col(l.color),2.6);l.pts.forEach(pt=>{if(pt)s+=dot(pt,col(l.color),4,l.name)})});
  if(!S.indiv.length){
    s+=line(S.main,ink,3.4);
    S.main.forEach(pt=>{if(pt)s+=dot(pt,ink,4.6)});
    const last=S.main.filter(Boolean).pop();
    if(last)s+=`<text x="${x(last.k)-10}" y="${y(last.v)+(last.v>8?18:-10)}" text-anchor="end" fill="${ink}" font-size="13" font-weight="800" class="val">${f1(last.v)}</text>`;
  }
  return s+'</svg>';
}

function renderStats(){
  const S=computeStats(),t=S.t;
  $('#statsTitle').innerHTML=`Gráficas<small>${esc(t.name)} · ${esc(t.category)}</small>`;
  const others=store.teams(t.sport);
  const selNames=st.sel.map((id,i)=>({id,name:t.players.find(p=>p.id===id)?.name||'?',color:LINE_COLORS[i%LINE_COLORS.length]}));
  const mainLabel=st.sel.length?(st.sel.length===1?`Media de ${selNames[0].name}`:`Media combinada (${st.sel.length})`):(S.inj?'Media de los lesionados':'Media del equipo');
  let h=`<div class="stats-wrap">`;
  if(others.length>1)h+=`<div class="player-pick" role="group" aria-label="Equipo">${others.map(o=>`<button type="button" class="${o.id===t.id?'on':''}" data-st-team="${o.id}">${esc(o.name)}</button>`).join('')}</div>`;
  h+=`<div class="panel filters">
    <div><div class="flabel">Filtrar por jugador</div>
      <div class="search"><svg class="lupa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        <input id="stSearch" placeholder="Escribe un nombre…" autocomplete="off" value="${esc(st.q)}" aria-label="Buscar jugador"><div class="sugg" id="stSugg" hidden></div></div>
      <div class="fchips">${selNames.length?selNames.map(s=>`<span class="fchip">${st.split?`<i style="--c:var(--o-${s.color})"></i>`:''}${esc(s.name)}<button type="button" data-unsel="${s.id}" aria-label="Quitar ${esc(s.name)}">×</button></span>`).join('')
        +(st.sel.length>1?`<button type="button" class="pill-btn ${st.split?'on':''}" style="height:42px;box-shadow:none;border:2px solid var(--line)" data-split>${st.split?'Ver solo la media':'Ver por separado'}</button>`:'')
        +`<button type="button" class="muted-note" style="padding:8px" data-clear-sel>Quitar filtros</button>`
        :`<span class="muted-note">Sin filtro: se muestra ${S.inj?'a todos los que han estado en modo lesión':'todo el equipo'}.</span>`}</div></div>
    <div><div class="flabel">Periodo</div><div class="seg">${[['all','Todo'],['12','Últimas 12'],['4','Últimas 4']].map(([v,l])=>`<button type="button" class="${st.range===v?'on':''}" data-range-sel="${v}">${l}</button>`).join('')}</div></div>
  </div>`;
  h+=`<div class="mode-switch" role="tablist" aria-label="Tipo de datos">
    <button type="button" role="tab" aria-selected="${!S.inj}" class="${S.inj?'':'on'}" data-mode="general"><b>General</b><small>Encuesta de todos</small></button>
    <button type="button" role="tab" aria-selected="${S.inj}" class="inj ${S.inj?'on':''}" data-mode="injury"><b>Lesionados</b><small>Sesiones en modo lesión</small></button></div>`;
  if(!S.days.length){
    const who=st.sel.length?selNames.map(s=>s.name).join(', '):'';
    h+=`<div class="panel stats-empty"><h2>${S.inj?(who?`${esc(who)}: sin sesiones en modo lesión`:'Aún no hay sesiones en modo lesión'):'Todavía no hay reseñas'}</h2><p>${S.inj?'Cuando actives el modo lesión a un jugador desde la zona del entrenador, sus reseñas aparecerán aquí, con su checklist y sus comentarios.':'Cuando los jugadores envíen su reseña tras el entrenamiento, aquí verás la evolución por fecha.'}</p></div></div>`;
    $('#statsScroll').innerHTML=h;return;
  }
  h+=`<div class="kpis">
    <div class="kpi"><div class="v">${f1(S.kpi.avg)}<small> /10</small></div><div class="l">${esc(mainLabel)} del periodo</div></div>
    <div class="kpi"><div class="v">${f1(S.kpi.last)}<small> /10</small></div><div class="l">Última sesión${S.kpi.lastDay?' · '+fmtDay(S.kpi.lastDay):''}</div></div>
    <div class="kpi"><div class="v">${S.kpi.sessions}</div><div class="l">${S.kpi.sessions===1?'Sesión':'Sesiones'} · ${S.kpi.n} ${S.kpi.n===1?'reseña':'reseñas'}</div></div>
    ${S.inj?`<div class="kpi"><div class="v" style="color:${S.kpi.pain>0?'var(--o-red)':'var(--ink)'}">${Math.round((S.kpi.pain||0)*100)}<small>%</small></div><div class="l">Reseñas con dolor</div></div>`
      :`<div class="kpi"><div class="v">${S.kpi.att==null?'–':Math.round(S.kpi.att*100)}<small>%</small></div><div class="l">Asistencia media</div></div>`}
  </div>`;
  const marks=S.inj?`<span><i class="dot" style="--c:var(--o-red)"></i>${S.single?'Con dolor':'Alguien con dolor'}</span><span><i class="dot ring"></i>Sin dolor</span>`
    :(S.single||S.indiv.length?`<span><i class="dot" style="--c:var(--o-red)"></i>Lesionado (encuesta general)</span><span><i class="band"></i>Periodo de lesión</span>`:'');
  h+=`<div class="panel"><h2>Evolución ${S.inj?'en modo lesión':'por fecha'}</h2><p class="sub">Barra de 1 a 10 por fecha real. ${S.inj?'Solo sesiones respondidas en modo lesión.':'Los ausentes no cuentan en la media.'} La línea discontinua indica sesiones sin reseña entre medias.</p>
    <div class="chart-box" id="chartBox"></div>
    <div class="legend">${S.indiv.length?S.indiv.map(l=>`<span><i style="--c:var(--o-${l.color})"></i>${esc(l.name)}</span>`).join(''):`<span><i class="thick" style="--c:var(--ink)"></i>${esc(mainLabel)}</span>`}${marks}</div></div>`;
  // Tabla de sesiones
  h+=`<div class="panel"><h2>Tabla de sesiones${S.inj?' · modo lesión':''}</h2><div class="tbl-wrap"><table class="st"><thead><tr><th>Sesión</th>${S.roster.map(p=>`<th>${esc(p.name)}</th>`).join('')}<th>Media</th></tr></thead><tbody>`+
    S.rows.map(r=>`<tr><td>${fmtDay(r.k)}</td>${r.cells.map(c=>c.na||c.none?'<td class="na">—</td>':c.abs?'<td class="abs">Ausente</td>':
      `<td><span class="cell"><i style="--c:${mixColor((c.mood-1)/9)}"></i>${c.mood}${S.inj?(c.ck?.pain?'<em title="Con dolor">D</em>':''):(c.injured?'<em title="Lesionado">L</em>':'')}</span></td>`).join('')}<td class="avg">${f1(r.avg)}</td></tr>`).join('')+
    `</tbody></table></div><p class="muted-note" style="margin:10px 0 0;font-size:.85rem">${S.inj?'D = tuvo dolor · — = no respondió en modo lesión ese día':'L = se marcó como lesionado · — = aún no estaba en el equipo'}</p></div>`;
  // Registro de lesión
  if(S.inj){
    const yn=(v,bad)=>v==null?'<td class="na">—</td>':`<td><span class="ynv ${v===bad?'bad':'ok'}">${v?'Sí':'No'}</span></td>`;
    h+=`<div class="panel"><h2>Registro de lesión</h2><p class="sub">Una fila por reseña, con el checklist y los comentarios del jugador.</p>
      <div class="kpis" style="margin-bottom:14px">${S.ckSum.map(c=>`<div class="kpi"><div class="v" style="color:${c.key==='pain'?(c.yes?'var(--o-red)':'var(--ink)'):(c.yes<c.n?'var(--o-orange)':'var(--o-green)')}">${c.n?Math.round(c.yes/c.n*100):0}<small>%</small></div><div class="l">${c.label.replace('¿He ','').replace('?','')}: sí · ${c.yes} de ${c.n}</div></div>`).join('')}</div>
      <div class="tbl-wrap"><table class="st log"><thead><tr><th>Fecha</th><th>Jugador</th><th>Lesión</th><th>Barra</th><th>Dolor</th><th>Calentó</th><th>Estiró</th><th class="cm">Comentario</th></tr></thead><tbody>`+
      S.log.map(l=>`<tr><td>${fmtDay(l.k)}</td><td><b>${esc(l.name)}</b></td><td>${esc(l.injury||'—')}</td><td><span class="cell"><i style="--c:${mixColor((l.mood-1)/9)}"></i>${l.mood}</span></td>${yn(l.ck.pain,true)}${yn(l.ck.warmup,false)}${yn(l.ck.stretch,false)}<td class="cm">${l.comment?esc(l.comment):'<span class="muted-note">—</span>'}</td></tr>`).join('')+
      `</tbody></table></div></div>`;
  }
  h+=`<div class="panel"><h2>Cuestionarios ${S.inj?'de lesionados':'generales'}</h2>`+(S.qsum.length?`<div class="qsum">`+S.qsum.map(q=>{
      if(q.style==='scale'){const a=avg(q.values);return`<div class="qcard"><div class="t">${esc(q.quiz)}</div><h3>${esc(q.question)}</h3>
        <div class="kpi" style="border:0;padding:0"><div class="v" style="color:${a==null?'var(--muted)':mixColor((a-1)/((q.steps||5)-1))}">${f1(a)}<small> /${q.steps||5}</small></div><div class="l">Media de ${q.n} ${q.n===1?'respuesta':'respuestas'}</div></div></div>`}
      const tot=q.n||1,ents=Object.entries(q.counts).sort((a,b)=>b[1]-a[1]);
      return`<div class="qcard"><div class="t">${esc(q.quiz)}</div><h3>${esc(q.question)}</h3>${ents.map(([lb,c],i)=>`<div class="brow"><span class="lb" title="${esc(lb)}">${esc(lb)}</span><span class="tr"><b style="width:${(c/tot*100).toFixed(1)}%;--c:var(--o-${q.colors[lb]||LINE_COLORS[i%LINE_COLORS.length]})"></b></span><span class="n">${c} · ${Math.round(c/tot*100)}%</span></div>`).join('')}
        <p class="muted-note" style="margin:8px 0 0;font-size:.8rem">${q.n} ${q.n===1?'respuesta':'respuestas'}${q.style==='multi'?' · se podían marcar varias':''}</p></div>`}).join('')+`</div>`
    :`<p class="muted-note">Aún no hay respuestas a cuestionarios ${S.inj?'de lesionados':'generales'} en este periodo.</p>`)+`</div>`;
  h+=`<div class="panel"><h2>Compartir</h2><p class="sub">Exporta lo que ves ahora: modo ${S.inj?'lesionados':'general'}, con los filtros aplicados.</p><div class="export-row">
    <button type="button" data-export="xlsx"><b>XLS</b>Excel</button>
    <button type="button" data-export="csv"><b>CSV</b>${S.inj?'Registro CSV':'Tabla CSV'}</button>
    <button type="button" data-export="pdf"><b>PDF</b>Informe PDF</button>
    <button type="button" data-export="copy"><b>⧉</b>Copiar tabla</button></div></div>`;
  h+=`</div>`;
  $('#statsScroll').innerHTML=h;
  drawChart(S);
}
function drawChart(S){const box=$('#chartBox');if(!box)return;box.innerHTML=chartSVG(S||computeStats(),Math.max(300,box.clientWidth))}
let rsT;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{if(!$('#stats').hidden)drawChart()},150)});

function suggest(){
  const t=store.team(st.teamId),q=st.q.trim().toLowerCase(),box=$('#stSugg');
  if(!q){box.hidden=true;return}
  const m=t.players.filter(p=>!st.sel.includes(p.id)&&p.name.toLowerCase().includes(q));
  box.innerHTML=m.length?m.slice(0,6).map((p,i)=>`<button type="button" class="${i===0?'hl':''}" data-sel="${p.id}">${esc(p.name)}${p.position?`<span class="muted-note" style="font-weight:600">· ${esc(p.position)}</span>`:''}</button>`).join(''):`<div class="none">Nadie con ese nombre en el equipo</div>`;
  box.hidden=false;
}
function addSel(id){st.sel.push(id);st.q='';renderStats();setTimeout(()=>$('#stSearch')?.focus(),0)}
$('#statsScroll').addEventListener('input',e=>{if(e.target.id==='stSearch'){st.q=e.target.value;suggest()}});
$('#statsScroll').addEventListener('keydown',e=>{
  if(e.target.id!=='stSearch')return;
  if(e.key==='Enter'){e.preventDefault();const f=$('#stSugg [data-sel]');if(f)addSel(f.dataset.sel)}
  if(e.key==='Escape'){$('#stSugg').hidden=true}
});
$('#statsScroll').addEventListener('click',e=>{
  const s=e.target.closest('[data-sel]');if(s){addSel(s.dataset.sel);return}
  const u=e.target.closest('[data-unsel]');if(u){st.sel=st.sel.filter(x=>x!==u.dataset.unsel);if(st.sel.length<2)st.split=false;renderStats();return}
  if(e.target.closest('[data-clear-sel]')){st.sel=[];st.split=false;renderStats();return}
  if(e.target.closest('[data-split]')){st.split=!st.split;renderStats();return}
  const md=e.target.closest('[data-mode]');if(md){st.mode=md.dataset.mode;renderStats();return}
  const r=e.target.closest('[data-range-sel]');if(r){st.range=r.dataset.rangeSel;renderStats();return}
  const tm=e.target.closest('[data-st-team]');if(tm){openStats(tm.dataset.stTeam);return}
  const ex=e.target.closest('[data-export]');if(ex){doExport(ex.dataset.export,ex);return}
  if(!e.target.closest('.search'))$('#stSugg')&&($('#stSugg').hidden=true);
});

/* ===== Registro de fuerza ===== */
const EXERCISES=['Press banca','Sentadilla','Peso muerto','Hip thrust'];
const SF=[['weight','Peso','kg'],['velocity','Velocidad','m/s'],['rom','ROM','cm'],['percent','Porcentaje','%']];
const sr={teamId:null,sess:null,status:''};
let srTimer=null;
const emptyRow=p=>({id:uid(),playerId:p.id,playerName:p.name,exercise:'',weight:'',velocity:'',rom:'',percent:''});
const rowHasData=r=>r.exercise||SF.some(([k])=>r[k]);
function openStrength(teamId){
  const t=store.team(teamId)||store.teams(ui.sport)[0];
  if(!t){toast('Crea primero un equipo');return}
  sr.teamId=t.id;loadStrengthSession(store.strengthToday(t.id));
  renderStrength();show('strength');$('#strengthScroll').scrollTop=0;
}
/* Sesión de hoy: se completa con los jugadores actuales que aún no tengan fila */
function loadStrengthSession(existing){
  const t=store.team(sr.teamId),today=madridDay();
  if(existing){
    sr.sess=JSON.parse(JSON.stringify(existing));
    if(existing.day===today)t.players.forEach(p=>{if(!sr.sess.rows.some(r=>r.playerId===p.id))sr.sess.rows.push(emptyRow(p))});
  }else sr.sess={id:uid(),teamId:t.id,day:today,rows:t.players.map(emptyRow),_unsaved:true};
  sr.status='';
}
function renderStrength(){
  const t=store.team(sr.teamId),S=sr.sess,isToday=S.day===madridDay();
  $('#strengthTitle').innerHTML=`Registro de fuerza<small>${esc(t.name)} · ${esc(t.category)}</small>`;
  const teams=store.teams(t.sport),past=store.strengthFor(t.id).filter(x=>x.id!==S.id);
  const filled=S.rows.filter(rowHasData).length;
  let h=`<div class="stats-wrap">`;
  if(teams.length>1)h+=`<div class="player-pick" role="group" aria-label="Equipo">${teams.map(o=>`<button type="button" class="${o.id===t.id?'on':''}" data-sr-team="${o.id}">${esc(o.name)}</button>`).join('')}</div>`;
  h+=`<div class="panel">
    <div class="sr-head"><div><h2>Sesión del ${fmtDay(S.day)}${isToday?' <span class="tagp">Hoy</span>':''}</h2>
      <p class="sub">${isToday?'La fecha se pone sola. Se guarda automáticamente mientras escribes.':'Sesión anterior: puedes corregir valores; la fecha no cambia.'}</p></div>
      <span class="sr-status" id="srStatus" aria-live="polite">${esc(sr.status)}</span></div>
    ${S.rows.length?`<div class="tbl-wrap"><table class="st sr-table"><thead><tr><th>Nombres</th><th>Ejercicios</th>${SF.map(([,l,u])=>`<th>${l} <small>${u}</small></th>`).join('')}<th class="sr-act"><span class="sr-only">Filas</span></th></tr></thead><tbody>`+
      S.rows.map((r,i)=>{const prev=S.rows[i-1],cont=prev&&prev.playerId===r.playerId,multi=S.rows.filter(x=>x.playerId===r.playerId).length>1;
        return`<tr data-row="${r.id}" class="${cont?'cont':''}"><td>${cont?'<span class="muted-note">↳</span>':`<b>${esc(r.playerName)}</b>`}</td>
        <td><select class="sr-in" data-f="exercise" aria-label="Ejercicio de ${esc(r.playerName)}"><option value="">—</option>${EXERCISES.map(x=>`<option ${r.exercise===x?'selected':''}>${x}</option>`).join('')}</select></td>
        ${SF.map(([k,l,u])=>`<td><input class="sr-in num" data-f="${k}" inputmode="decimal" maxlength="7" value="${esc(r[k]||'')}" aria-label="${l} (${u}) de ${esc(r.playerName)}"></td>`).join('')}
        <td class="sr-act"><button type="button" class="sq-btn sm" data-sr-add="${r.id}" aria-label="Añadir otro ejercicio a ${esc(r.playerName)}">+</button>${multi||!isToday?`<button type="button" class="sq-btn sm" data-sr-del="${r.id}" aria-label="Quitar fila">×</button>`:''}</td></tr>`}).join('')+
      `</tbody></table></div>`:`<p class="muted-note">Este equipo no tiene jugadores todavía.</p>`}
    <p class="muted-note" style="margin:10px 0 0;font-size:.85rem">Con <b>+</b> añades otra fila al mismo jugador si hace más de un ejercicio. Filas con datos: ${filled} de ${S.rows.length}.</p>
  </div>`;
  h+=`<div class="panel"><h2>Exportar esta sesión</h2><div class="export-row">
    <button type="button" data-sr-export="pdf"><b>PDF</b>Tabla en PDF</button>
    <button type="button" data-sr-export="xlsx"><b>XLS</b>Excel</button></div></div>`;
  h+=`<div class="panel"><h2>Sesiones anteriores</h2>`+(past.length||!isToday?`<div class="sr-list">${!isToday?`<button type="button" class="sr-item on" data-sr-today><b>Volver a hoy</b><small>${fmtDay(madridDay())}</small></button>`:''}${past.map(x=>{const n=x.rows.filter(rowHasData).length;
      return`<div class="sr-item-wrap"><button type="button" class="sr-item" data-sr-open="${x.id}"><b>${fmtDay(x.day)}</b><small>${n} ${n===1?'fila':'filas'} con datos</small></button><button type="button" class="sq-btn sm" data-sr-rm="${x.id}" aria-label="Borrar sesión del ${fmtDay(x.day)}">×</button></div>`}).join('')}</div>`
    :`<p class="muted-note">Aún no hay sesiones anteriores de este equipo.</p>`)+`</div>`;
  h+=`</div>`;
  $('#strengthScroll').innerHTML=h;
}
function setSrStatus(txt){sr.status=txt;const el=$('#srStatus');if(el)el.textContent=txt}
function scheduleStrengthSave(){
  clearTimeout(srTimer);setSrStatus('Guardando…');
  srTimer=setTimeout(async()=>{
    const S=sr.sess;
    if(S._unsaved&&!S.rows.some(rowHasData)){setSrStatus('');return}
    delete S._unsaved;
    const copy={id:S.id,teamId:S.teamId,day:S.day,rows:S.rows.map(r=>({...r}))};
    const existing=(store.data.strength||[]).find(x=>x.id===S.id);
    if(existing)existing.rows=copy.rows;
    try{await store.saveStrength(existing||copy);const d=new Date();setSrStatus(`Guardado ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`)}
    catch(e){setSrStatus('Sin guardar');if(!$('#strength').hidden){loadStrengthSession(store.strengthToday(sr.teamId));renderStrength()}}
  },700);
}
$('#strengthBtn').onclick=()=>requirePin(()=>openStrength(store.teams(ui.sport)[0]?.id));
$('#strengthBack').onclick=()=>{clearTimeout(srTimer);if(sr.status==='Guardando…')scheduleStrengthSave();renderSport();show('sport')};
$('#strengthScroll').addEventListener('input',e=>{
  const el=e.target.closest('.sr-in');if(!el)return;
  if(el.classList.contains('num')){const v=el.value.replace(/[^\d.,]/g,'');if(v!==el.value)el.value=v}
  const row=sr.sess.rows.find(r=>r.id===el.closest('[data-row]').dataset.row);row[el.dataset.f]=el.value.trim();
  scheduleStrengthSave();
});
$('#strengthScroll').addEventListener('change',e=>{if(e.target.matches('select.sr-in'))e.target.dispatchEvent(new Event('input',{bubbles:true}))});
$('#strengthScroll').addEventListener('click',e=>{
  const tm=e.target.closest('[data-sr-team]');if(tm){clearTimeout(srTimer);sr.teamId=tm.dataset.srTeam;loadStrengthSession(store.strengthToday(sr.teamId));renderStrength();return}
  const ad=e.target.closest('[data-sr-add]');if(ad){const i=sr.sess.rows.findIndex(r=>r.id===ad.dataset.srAdd),base=sr.sess.rows[i];
    let j=i;while(sr.sess.rows[j+1]&&sr.sess.rows[j+1].playerId===base.playerId)j++;
    const nr={...emptyRow({id:base.playerId,name:base.playerName})};sr.sess.rows.splice(j+1,0,nr);renderStrength();
    setTimeout(()=>document.querySelector(`[data-row="${nr.id}"] select`)?.focus(),20);if(!sr.sess._unsaved)scheduleStrengthSave();return}
  const dl=e.target.closest('[data-sr-del]');if(dl){sr.sess.rows=sr.sess.rows.filter(r=>r.id!==dl.dataset.srDel);renderStrength();scheduleStrengthSave();return}
  const op=e.target.closest('[data-sr-open]');if(op){clearTimeout(srTimer);loadStrengthSession(store.strengthFor(sr.teamId).find(x=>x.id===op.dataset.srOpen));renderStrength();$('#strengthScroll').scrollTop=0;return}
  if(e.target.closest('[data-sr-today]')){loadStrengthSession(store.strengthToday(sr.teamId));renderStrength();return}
  const rm=e.target.closest('[data-sr-rm]');if(rm){armDelete(rm,()=>{store.removeStrength(rm.dataset.srRm);renderStrength();toast('Sesión borrada')});return}
  const ex=e.target.closest('[data-sr-export]');if(ex){exportStrength(ex.dataset.srExport,ex)}
});
function strengthAOA(){return[['Nombres','Ejercicios','Peso (kg)','Velocidad (m/s)','ROM (cm)','Porcentaje (%)'],
  ...sr.sess.rows.map((r,i)=>[sr.sess.rows[i-1]?.playerId===r.playerId?'':r.playerName,r.exercise,r.weight,r.velocity,r.rom,r.percent])]}
async function exportStrength(kind,btn){
  const t=store.team(sr.teamId),S=sr.sess,base=`${t.name}-fuerza-${S.day}`.replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]/g,'').replace(/\s+/g,'_');
  btn.setAttribute('aria-busy','true');
  try{
    const aoa=strengthAOA();
    if(kind==='xlsx'){const XLSX=await import('xlsx');const wb=XLSX.utils.book_new();
      const ws=XLSX.utils.aoa_to_sheet([[`Registro de fuerza · ${t.name} · ${t.category}`],[`Sesión: ${fmtDay(S.day)}`],[],...aoa]);
      ws['!cols']=[{wch:16},{wch:14},{wch:10},{wch:15},{wch:10},{wch:14}];XLSX.utils.book_append_sheet(wb,ws,'Fuerza');
      await saveFile(base+'.xlsx',new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})]))}
    if(kind==='pdf'){const {jsPDF}=await import('jspdf');const atMod=await import('jspdf-autotable');const autoTable=typeof atMod.default==='function'?atMod.default:(atMod.autoTable||atMod.default.default||atMod.default.autoTable);
      const doc=new jsPDF({orientation:'portrait',unit:'pt',format:'a4',compress:true});
      doc.setFont('helvetica','bold');doc.setFontSize(20);doc.text('Registro de fuerza',40,52);
      doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(90);doc.text(`${t.name} · ${t.category} · Sesión del ${fmtDay(S.day)}`,40,72);
      autoTable(doc,{head:[aoa[0]],body:aoa.slice(1),startY:92,theme:'grid',styles:{fontSize:10,cellPadding:6,halign:'center',lineColor:[210,216,224]},
        columnStyles:{0:{halign:'left',fontStyle:'bold'},1:{halign:'left'}},headStyles:{fillColor:[22,32,43],textColor:255}});
      await saveFile(base+'.pdf',doc.output('blob'))}
  }catch(err){console.error(err);toast('No se pudo generar el archivo. Inténtalo otra vez.')}
  finally{btn.removeAttribute('aria-busy')}
}

/* ===== Exportación ===== */
function tableAOA(S){
  return[['Sesión',...S.roster.map(p=>p.name),'Media'],
    ...S.rows.map(r=>[fmtDay(r.k),...r.cells.map(c=>c.na||c.none?'':c.abs?'Ausente':(S.inj?(c.ck?.pain?c.mood+' (D)':c.mood):(c.injured?c.mood+' (L)':c.mood))),r.avg==null?'':Math.round(r.avg*10)/10])];
}
const siNo=v=>v==null?'':v?'Sí':'No';
function logAOA(S){
  return[['Fecha','Jugador','Lesión','Barra (1-10)','Dolor','Calentó','Estiró','Comentario'],
    ...S.log.map(l=>[l.k,l.name,l.injury,l.mood,siNo(l.ck.pain),siNo(l.ck.warmup),siNo(l.ck.stretch),l.comment])];
}
function detailAOA(S){
  const out=[['Fecha','Jugador',S.inj?'Lesión':'Lesionado','Barra (1-10)','Cuestionario','Pregunta','Respuesta']];
  const inc=r=>!st.sel.length||st.sel.includes(r.playerId);
  S.days.forEach(k=>S.byDay[k].filter(inc).forEach(r=>{
    const name=S.t.players.find(p=>p.id===r.playerId)?.name||r.playerName;
    const tag=S.inj?(r.injury||''):(r.injured?'Sí':'No');
    if(!r.answers?.length)out.push([k,name,tag,r.mood,'','','']);
    else r.answers.forEach(a=>out.push([k,name,tag,r.mood,a.quizTitle,a.question,a.style==='scale'?`${a.value} / ${a.steps}`:a.options.join(', ')]));
  }));
  return out;
}
const csvOf=aoa=>'﻿'+aoa.map(r=>r.map(v=>{v=String(v??'');return/[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(';')).join('\r\n');
const loaded={};
function loadScript(src){return loaded[src]||(loaded[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>{delete loaded[src];rej(new Error('No se pudo cargar '+src))};document.head.appendChild(s)}))}
async function saveFile(filename,data){
  let dl=null;try{dl=window.claude?.use?await window.claude.use('downloads'):null}catch(e){}
  if(dl){
    try{await dl.save({filename,data});toast('Archivo guardado');}
    catch(err){toast(err?.code==='declined'?'Descarga cancelada':err?.code==='rate_limited'?'Ya hay una descarga pendiente de confirmar':'No se pudo guardar el archivo aquí')}
    return;
  }
  if(window.claude){toast('Este visor no permite descargas');return}
  const blob=data instanceof Blob?data:new Blob([data]);
  const ext=filename.split('.').pop(),mime={csv:'text/csv',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pdf:'application/pdf'}[ext]||'application/octet-stream';
  const file=new File([blob],filename,{type:mime});
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:filename});return}catch(e){if(e.name==='AbortError')return}
  }
  const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
}
function svgToPng(svg,w,h){return new Promise((res,rej)=>{const img=new Image();const c=document.createElement('canvas');c.width=w*2;c.height=h*2;
  img.onload=()=>{const g=c.getContext('2d');g.scale(2,2);g.drawImage(img,0,0,w,h);res(c.toDataURL('image/png'))};img.onerror=rej;
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
async function doExport(kind,btn){
  const S=computeStats(),t=S.t,base=`${t.name}-${S.inj?'lesiones-':''}${madridDay()}`.replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]/g,'').replace(/\s+/g,'_');
  if(!S.days.length){toast('No hay datos que exportar');return}
  if(kind==='copy'){
    const tsv=(S.inj?logAOA(S):tableAOA(S)).map(r=>r.map(v=>String(v??'').replace(/[\t\n]/g,' ')).join('\t')).join('\n');
    try{await navigator.clipboard.writeText(tsv);toast('Tabla copiada: pégala en Excel, Sheets o un mensaje')}catch(e){toast('No se pudo copiar en este navegador')}
    return;
  }
  btn.setAttribute('aria-busy','true');
  try{
    if(kind==='csv')await saveFile(base+'.csv',csvOf(S.inj?logAOA(S):tableAOA(S)));
    if(kind==='xlsx'){
      const XLSX=await import('xlsx');
      const wb=XLSX.utils.book_new();
      const s1=XLSX.utils.aoa_to_sheet(tableAOA(S));s1['!cols']=[{wch:14},...S.roster.map(()=>({wch:10})),{wch:8}];
      XLSX.utils.book_append_sheet(wb,s1,S.inj?'Sesiones lesión':'Sesiones');
      if(S.inj){const sl=XLSX.utils.aoa_to_sheet(logAOA(S));sl['!cols']=[{wch:11},{wch:14},{wch:22},{wch:12},{wch:7},{wch:8},{wch:7},{wch:60}];XLSX.utils.book_append_sheet(wb,sl,'Registro lesión')}
      const s2=XLSX.utils.aoa_to_sheet(detailAOA(S));s2['!cols']=[{wch:11},{wch:14},{wch:10},{wch:12},{wch:22},{wch:36},{wch:28}];
      XLSX.utils.book_append_sheet(wb,s2,S.inj?'Cuestionarios lesión':'Respuestas');
      await saveFile(base+'.xlsx',new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})]));
    }
    if(kind==='pdf'){
      const {jsPDF}=await import('jspdf');const atMod=await import('jspdf-autotable');const autoTable=typeof atMod.default==='function'?atMod.default:(atMod.autoTable||atMod.default.default||atMod.default.autoTable);
      const doc=new jsPDF({orientation:'landscape',unit:'pt',format:'a4',compress:true});
      const W=doc.internal.pageSize.getWidth();
      doc.setFont('helvetica','bold');doc.setFontSize(22);doc.text(`${t.name} · ${t.category}${S.inj?' · Registro de lesiones':''}`,40,50);
      doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(90);
      const who=st.sel.length?'Jugadores: '+st.sel.map(id=>t.players.find(p=>p.id===id)?.name).join(', '):'Todo el equipo';
      const per=`${fmtDay(S.days[0])} – ${fmtDay(S.days[S.days.length-1])}`;
      doc.text(S.inj?`${who} · ${per} · ${S.kpi.n} reseñas en modo lesión · media ${f1(S.kpi.avg)}/10 · con dolor ${Math.round((S.kpi.pain||0)*100)}%`
        :`${who} · ${per} · ${S.kpi.sessions} sesiones · media ${f1(S.kpi.avg)}/10 · asistencia ${S.kpi.att==null?'–':Math.round(S.kpi.att*100)+'%'}`,40,70);
      const cw=760,svg=chartSVG(S,cw,{exp:true}),ch=+svg.match(/height="(\d+(?:\.\d+)?)"/)[1];
      const png=await svgToPng(svg,cw,ch);const iw=W-80;doc.addImage(png,'PNG',40,86,iw,iw*ch/cw,undefined,'FAST');
      doc.addPage();
      const aoa=tableAOA(S);
      autoTable(doc,{head:[aoa[0]],body:aoa.slice(1),startY:40,styles:{fontSize:9,halign:'center'},columnStyles:{0:{halign:'left',fontStyle:'bold'}},headStyles:{fillColor:[22,32,43]}});
      if(S.inj){const lg=logAOA(S);
        autoTable(doc,{head:[lg[0]],body:lg.slice(1),startY:doc.lastAutoTable.finalY+30,styles:{fontSize:8.5,valign:'top'},columnStyles:{7:{cellWidth:260}},headStyles:{fillColor:[200,50,55]},
          didParseCell:d=>{if(d.section==='body'&&d.column.index===4&&d.cell.raw==='Sí')d.cell.styles.textColor=[200,50,55]}})}
      if(S.qsum.length){
        const body=S.qsum.flatMap(q=>q.style==='scale'?[[q.quiz,q.question,`Media ${f1(avg(q.values))} / ${q.steps}`,q.n]]
          :Object.entries(q.counts).sort((a,b)=>b[1]-a[1]).map(([lb,c],i)=>[i?'':q.quiz,i?'':q.question,lb,c]));
        autoTable(doc,{head:[['Cuestionario','Pregunta','Respuesta','Veces']],body,startY:doc.lastAutoTable.finalY+30,styles:{fontSize:9},headStyles:{fillColor:[22,32,43]}});
      }
      await saveFile(base+'.pdf',doc.output('blob'));
    }
  }catch(err){console.error(err);toast('No se pudo generar el archivo. Inténtalo otra vez.')}
  finally{btn.removeAttribute('aria-busy')}
}

/* ===== Inicio de sesión y arranque ===== */
setErrorHandler(msg=>toast(msg));
function refreshView(){
  if(!$('#sport').hidden)renderSport();
  else if(!$('#team').hidden){store.team(ui.teamId)?renderTeam():(renderSport(),show('sport'))}
  else if(!$('#coach').hidden){store.team(ui.teamId)?renderCoach():(renderSport(),show('sport'))}
  else if(!$('#stats').hidden){store.team(st.teamId)?renderStats():(renderSport(),show('sport'))}
}
setReloadHandler(()=>{if($('#review').hidden&&$('#qedit').hidden)refreshView()});
function showLogin(msg){
  show('login');$('#loginErr').textContent=msg||'';$('#loginPass').value='';
  setTimeout(()=>$('#loginEmail').focus(),50);
}
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=$('#loginEmail').value.trim(),pw=$('#loginPass').value,btn=$('#loginBtn');
  if(!email||!pw){$('#loginErr').textContent='Escribe tu correo y tu contraseña.';return}
  btn.disabled=true;btn.textContent='Entrando…';$('#loginErr').textContent='';
  try{await store.signIn(email,pw);await afterLogin()}
  catch(err){$('#loginErr').textContent=/invalid/i.test(err.message||'')?'Correo o contraseña incorrectos.':navigator.onLine?'No se pudo iniciar sesión. Inténtalo otra vez.':'Sin conexión. Conéctate a internet para entrar.'}
  finally{btn.disabled=false;btn.textContent='Entrar'}
});
async function afterLogin(){
  let r;
  try{r=await store.load()}catch(e){showLogin('No se pudieron cargar los datos. Revisa la conexión.');return}
  if(r==='not_coach'){await store.signOut();showLogin('Esta cuenta no tiene acceso a Vestuario.');return}
  if(r==='offline')toast('Sin conexión: puedes consultar, pero no guardar cambios.');
  show('home');
}
async function boot(){
  const s=await store.session().catch(()=>null);
  if(!s){showLogin();return}
  await afterLogin();
}
/* Al volver a la app, recarga por si hubo cambios desde otro dispositivo */
let lastSync=Date.now();
document.addEventListener('visibilitychange',async()=>{
  if(document.hidden||Date.now()-lastSync<30000||!store.userId)return;
  if(!$('#review').hidden||!$('#qedit').hidden)return;
  lastSync=Date.now();
  try{await store.load();refreshView()}catch(e){}
});
boot();
