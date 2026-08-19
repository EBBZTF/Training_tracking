/* =========================================================
   Speicher — funktioniert in der Claude-Vorschau (window.storage)
   und als eigenständige Datei auf dem iPhone (localStorage).
   ========================================================= */
const KEY = 'trainingsplan:v1';
const useClaude = typeof window.storage !== 'undefined' && window.storage;

async function save(data){
  const json = JSON.stringify(data);
  try{
    if(useClaude) await window.storage.set(KEY, json);
    else localStorage.setItem(KEY, json);
  }catch(e){ toast('Speichern fehlgeschlagen'); console.error(e); }
}
async function load(){
  try{
    if(useClaude){ const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : null; }
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

/* =========================================================
   Standardplan
   ========================================================= */
const uid = () => Math.random().toString(36).slice(2,9);
// e(name, typ, sätze, wdh, notiz)      → beidseitig
// u(name, typ, sätzeL, sätzeR, wdh, notiz) → einseitig
const e = (name,type,sets,reps,note='') => ({id:uid(),name,type,uni:false,sets,reps,note});
const u = (name,type,sL,sR,reps,note='') => ({id:uid(),name,type,uni:true,setsL:sL,setsR:sR,reps,note});

function defaultPlan(){ return {
  warmup:[
    'Kreislauf 5 Min — Rudern, Bike oder Seilspringen',
    'Morgens zusätzlich: 3 Min länger Kreislauf, bis du wirklich warm bist',
    'Hüftkreisen · 10 pro Richtung',
    'Beinpendel vorne/seitlich · 10 pro Seite',
    'Bird Dog · 8 pro Seite',
    'Glute Bridge · 2×12',
    'Dead Bug · 2×8 pro Seite',
    'Side Plank · 2×20 Sek.',
    'Morgens zusätzlich: erster Arbeitssatz mit halber Last als Testlauf'
  ],
  hip:{ kind:'huefte', name:'Hüft-Block', ex:[
    u('Side-lying Clam mit Band','band',2,3,'15','Becken senkrecht, nicht nach hinten rollen'),
    u('Side-lying Abduction','band',2,3,'12','Bein leicht hinten, Zehen zur Decke'),
    e('Banded Lateral Walk','band',2,'12 Schritte','Oberkörper aufrecht, Spannung halten'),
    u('Stehende Aussenrotation am Band','band',2,2,'12','Standbein arbeitet mit')
  ]},
  days:[
    {id:'mo',short:'Mo',slot:'morgens',title:'Unterkörper + Pistol',blocks:[
      {kind:'skill',name:'Skill — Pistol',ex:[
        u('Box Pistol','cm',6,4,'3','Links 2 Extra-Sätze. Boxhöhe notieren, mit der Zeit senken'),
        u('Assisted Pistol an Ringen','bw',3,3,'5','Nur so viel ziehen wie nötig')
      ]},
      {kind:'kraft',name:'Kraft',ex:[
        u('Bulgarian Split Squat','kg',4,4,'6-8'),
        u('Einbeiniges Kreuzheben','kg',3,3,'8','Starker Aussenrotations-Reiz im Standbein'),
        u('Step-down von der Box','kg',3,3,'8','Langsam, Kontrolle in der Frontalebene')
      ]},
      {kind:'explosiv',name:'Explosiv',ex:[
        e('Kettlebell Swing','kg',6,'8','Kraft aus der Hüfte, nicht aus den Armen'),
        e('Standweitsprung','m',4,'3','Landung ist der Punkt — rechtes Knie nicht einwärts')
      ]},
      {kind:'core',name:'Core',ex:[
        e('Hollow Body Hold','sek',4,'—'),
        u('Pallof Press','kg',3,3,'10'),
        u('Suitcase Carry','kg',3,0,'30 m','Nur links tragen')
      ]}
    ]},
    {id:'do',short:'Do',slot:'nachmittags',title:'Push + Handstand',blocks:[
      {kind:'skill',name:'Skill — Handstand',ex:[
        e('Wall Handstand Hold','sek',5,'—','Bauch zur Wand'),
        e('Pike Compression','sek',3,'—'),
        e('Pike Push-up','bw',3,'5')
      ]},
      {kind:'explosiv',name:'Explosiv',ex:[
        e('Push Press (LH)','kg',5,'3','Impuls aus den Beinen'),
        e('Clap Push-up','bw',5,'3')
      ]},
      {kind:'kraft',name:'Kraft',ex:[
        e('Bankdrücken','kg',4,'5-6'),
        e('Liegestütz-Volumen','bw',5,'6-7','Ca. 65% vom Maximum, 90 Sek. Pause'),
        e('Dips / Schrägbankdrücken','kg',3,'8'),
        e('Überkopfdrücken KH','kg',3,'8')
      ]},
      {kind:'core',name:'Core',ex:[
        e('Hollow Rocks','bw',3,'10'),
        u('Dead Bug mit Gewicht','kg',3,3,'8')
      ]}
    ]},
    {id:'fr',short:'Fr',slot:'nachmittags',title:'Unterkörper Kraft',blocks:[
      {kind:'kraft',name:'Kraft',ex:[
        e('Front Squat / Back Squat','kg',4,'5','Volle Tiefe, solange Becken neutral bleibt'),
        e('Hip Thrust','kg',4,'8'),
        u('Cossack Squat mit KH','kg',3,3,'6','Kraftübung, nicht Dehnung'),
        u('Side-lying Abduction mit Gewicht','kg',3,4,'12')
      ]}
    ]},
    {id:'we',short:'Sa/So',slot:'morgens',title:'Pull + Ausdauer',blocks:[
      {kind:'skill',name:'Skill — Klimmzug',ex:[
        e('Negative Klimmzüge','sek',5,'3','Je 5 Sek. runter. Deine wichtigste Übung'),
        e('Scapular Pulls','bw',3,'8'),
        e('Ring Rows, Füsse erhöht','bw',3,'8-10')
      ]},
      {kind:'explosiv',name:'Explosiv',ex:[
        u('Kettlebell High Pull','kg',5,5,'5'),
        e('Explosive Ring Rows','bw',4,'5')
      ]},
      {kind:'kraft',name:'Kraft',ex:[
        u('Einarmiges KH-Rudern','kg',4,4,'8'),
        e('Latzug','kg',3,'8'),
        e('Face Pulls','kg',3,'15'),
        e('Bizeps Curls','kg',3,'10')
      ]},
      {kind:'core',name:'Core',ex:[
        e('Hanging Leg Raises','bw',3,'8'),
        u('Pallof Press','kg',3,3,'10')
      ]},
      {kind:'ausdauer',name:'Ausdauer',ex:[
        e('Zone 2 / Intervalle','min',1,'—','Woche A: 25 Min gleichmässig · Woche B: 8×1 Min hart / 1 Min locker. Nach schwerem Freitag lieber Bike als Rudern')
      ]}
    ]}
  ]
};}

/* ---------- Anleitungen ---------- */
const DESC = {
 'Side-lying Clam mit Band':'Seitlage, Knie 90° gebeugt, Band über den Knien. Die Füsse bleiben zusammen, das obere Knie öffnet sich wie eine Muschel. Becken senkrecht halten und nicht nach hinten rollen — sonst übernimmt der Rumpf die Arbeit.',
 'Side-lying Abduction':'Seitlage, oberes Bein gestreckt und leicht nach hinten geführt, Zehen zeigen leicht zur Decke. Bein anheben und langsam senken. Die Rückführung nach hinten trifft die hinteren Fasern des Glutaeus medius.',
 'Banded Lateral Walk':'Band über den Knien, leichte Kniebeuge, seitliche Schritte. Oberkörper aufrecht, die Spannung im Band nie ganz verlieren. Nicht die Füsse zusammenziehen zwischen den Schritten.',
 'Stehende Aussenrotation am Band':'Band um ein Bein, im Stand das Bein gegen den Bandzug nach aussen drehen. Das Standbein arbeitet aktiv mit und ist Teil der Übung, nicht nur Stütze.',
 'Box Pistol':'Einbeinig vor einer Box stehen, das freie Bein nach vorne gestreckt. Kontrolliert auf die Box absetzen und wieder hoch. Abbruchkriterium ist nicht die Kraft, sondern das Becken: sobald es hinten wegkippt, ist die Box zu niedrig.',
 'Assisted Pistol an Ringen':'Wie ein voller Pistol Squat, aber die Hände halten sich an Ringen oder TRX. Nur so viel ziehen wie nötig — die Hilfe soll mit der Zeit weniger werden.',
 'Bulgarian Split Squat':'Hinterer Fuss erhöht auf einer Bank, das vordere Bein macht die Arbeit. Kurzhanteln in den Händen. Oberkörper leicht vorgeneigt.',
 'Einbeiniges Kreuzheben':'Auf einem Bein stehen, den Oberkörper nach vorne kippen während das freie Bein nach hinten steigt. Rücken gerade, Hüfte bleibt waagrecht. Starker Aussenrotations-Reiz im Standbein.',
 'Step-down von der Box':'Auf einer Box stehen, ein Bein langsam absenken bis die Ferse den Boden tippt, dann kontrolliert zurück. Das Standbein-Knie darf dabei nicht nach innen wandern.',
 'Kettlebell Swing':'Hüftbeugung mit geradem Rücken, Kettlebell zwischen den Beinen durch und explosiv durch Hüftstreckung nach vorne schwingen. Die Kraft kommt aus der Hüfte, nicht aus den Armen — die Arme sind nur Seile.',
 'Standweitsprung':'Aus dem Stand mit beiden Beinen so weit wie möglich nach vorne springen, weich auf beiden Füssen landen, kurz stabilisieren. Jeder Sprung startet aus dem Stillstand, kein Hüpf-Rhythmus. Die Landung ist der eigentliche Punkt: rechtes Knie darf nicht nach innen kippen. Von vorne filmen, notfalls kürzer springen.',
 'Hollow Body Hold':'Rückenlage, Arme und Beine gestreckt leicht über dem Boden, unterer Rücken fest an den Boden gedrückt. Der Körper bildet eine flache Schale. Löst sich der Rücken vom Boden, ist die Position zu flach — Arme oder Beine höher nehmen.',
 'Pallof Press':'Seitlich zum Kabelzug oder Band stehen, Griff vor der Brust, die Arme nach vorne strecken und der Rotation widerstehen. Es bewegt sich nichts ausser den Armen.',
 'Suitcase Carry':'Ein schweres Gewicht einhändig wie einen Koffer tragen. Oberkörper bleibt aufrecht und gerade, keine Seitneigung. Hier bewusst nur links tragen.',
 'Wall Handstand Hold':'Mit den Füssen die Wand hochlaufen bis der Bauch zur Wand zeigt und der Körper gestreckt ist. Deutlich wertvoller als die Rücken-zur-Wand-Version, weil sie die richtige Linie erzwingt.',
 'Pike Compression':'Sitzen mit gestreckten Beinen, Hände neben der Hüfte, aktiv die Beine vom Boden abheben. Sieht nach wenig aus und ist eine der härtesten Voraussetzungen für den Press Handstand.',
 'Pike Push-up':'Umgekehrtes V mit hoher Hüfte, Kopf Richtung Boden senken und drücken. Ein Liegestütz in Schulterdrück-Position.',
 'Push Press (LH)':'Langhantel auf Schulterhöhe, kurze Kniebeuge, dann explosiv über Kopf drücken. Der Impuls kommt aus den Beinen, die Arme führen nur zu Ende.',
 'Clap Push-up':'Liegestütz mit so viel Druck, dass die Hände abheben. Auf einer Bank erhöht ist die einfachere Einstiegsvariante.',
 'Bankdrücken':'Rückenlage auf der Bank, Gewicht kontrolliert zur Brust senken und nach oben drücken. Schulterblätter bleiben zusammengezogen.',
 'Liegestütz-Volumen':'Saubere Liegestütz, Körper in einer Linie von Kopf bis Ferse. Bewusst nicht bis zum Versagen — ca. 65 % deines Maximums pro Satz. Das Volumen ist der Motor Richtung 20, nicht die Maximalversuche.',
 'Dips / Schrägbankdrücken':'Dips: an Barren stützen, Körper absenken bis der Oberarm waagrecht ist, dann drücken. Schrägbank: Bankdrücken mit 30–45° Neigung.',
 'Überkopfdrücken KH':'Im Stehen oder Sitzen Kurzhanteln von Schulterhöhe über Kopf drücken, ohne Beinimpuls. Rippen unten halten, nicht ins Hohlkreuz ausweichen.',
 'Hollow Rocks':'Die Hollow-Position einnehmen und in dieser Form vor und zurück schaukeln. Die Form darf sich beim Schaukeln nicht verändern.',
 'Dead Bug mit Gewicht':'Rückenlage, Arme zur Decke, Beine im 90°-Winkel, Hantel in den Händen. Gegenüberliegender Arm und Bein senken sich ab, der untere Rücken bleibt am Boden.',
 'Front Squat / Back Squat':'Kniebeuge mit der Langhantel vorne auf den Schultern (Front) oder im Nacken (Back). Volle Tiefe, solange das Becken neutral bleibt und nicht hinten wegkippt.',
 'Hip Thrust':'Schultern auf einer Bank, Langhantel über der Hüfte (gepolstert), Becken kraftvoll nach oben drücken bis Knie, Hüfte und Schulter eine waagrechte Linie bilden. Oben kurz halten.',
 'Cossack Squat mit KH':'Breiter Stand, Gewicht auf ein Bein verlagern und tief absinken, das andere Bein bleibt gestreckt mit angehobener Fussspitze. Hier als Kraftübung geführt, nicht als Dehnung.',
 'Side-lying Abduction mit Gewicht':'Wie im Hüft-Block, aber mit Gewichtsmanschette oder Kurzhantel auf dem Oberschenkel. Langsam senken, das ist der wertvolle Teil.',
 'Zone 2 / Intervalle':'Zone 2: gleichmässiges Tempo, bei dem du dich noch in ganzen Sätzen unterhalten könntest. Intervalle: 8× eine Minute hart, eine Minute locker. Gelenkschonend bevorzugt — Rudern, Bike, Crosstrainer.',
 'Negative Klimmzüge':'Von einer Box in die obere Klimmzugposition springen, Kinn über der Stange, dann so langsam wie möglich absenken — Ziel 5 Sekunden. Deine wichtigste Übung für den ersten sauberen Klimmzug.',
 'Scapular Pulls':'Im Hang nur die Schulterblätter nach unten und zusammenziehen, die Arme bleiben gestreckt. Der Körper hebt sich dabei nur wenige Zentimeter.',
 'Ring Rows, Füsse erhöht':'Unter den Ringen hängend den Körper zu den Ringen ziehen. Je waagrechter der Körper, desto schwerer. Die Füsse erhöht zu stellen macht es deutlich anspruchsvoller.',
 'Kettlebell High Pull':'Wie ein Swing, aber am Umkehrpunkt wird die Kettlebell mit dem Ellenbogen nach hinten auf Brusthöhe gezogen. Der Schwung kommt weiterhin aus der Hüfte.',
 'Explosive Ring Rows':'Ring Row so kraftvoll ausgeführt, dass die Hände am oberen Punkt kurz abheben könnten. Tempo statt Last.',
 'Einarmiges KH-Rudern':'Eine Hand und ein Knie auf der Bank, Kurzhantel zur Hüfte ziehen. Der Oberkörper bleibt ruhig und dreht nicht mit.',
 'Latzug':'Am Kabelzug sitzend die Stange zur oberen Brust ziehen. Ellenbogen nach unten denken, nicht die Arme nach hinten reissen.',
 'Face Pulls':'Seil am Kabelzug auf Gesichtshöhe zum Gesicht ziehen, Ellenbogen hoch und weit aussen. Gut für die Schultergesundheit beim vielen Drücken.',
 'Bizeps Curls':'Kurzhanteln aus gestreckten Armen zur Schulter beugen. Ellenbogen bleiben am Körper.',
 'Hanging Leg Raises':'Im Hang an der Stange die gestreckten Beine anheben. Vorher die Schulterblätter aktivieren, nicht passiv durchhängen.'
};
function attachDesc(p){
  const all = [p.hip, ...p.days.flatMap(d=>d.blocks)];
  all.forEach(b=>b.ex.forEach(x=>{ if(!x.desc && DESC[x.name]) x.desc = DESC[x.name]; }));
  return p;
}

const UNIT = {kg:'kg', band:'Band', sek:'Sek', bw:'Wdh', cm:'cm', m:'m', min:'Min'};const TEXTY = {band:1};
const QUICK = {
  kg:[2.5,5,7.5,10,12.5,15,20,25,30,40],
  sek:[10,15,20,30,40,45,60],
  bw:[3,5,6,8,10,12,15,20],
  cm:[20,25,30,35,40,45,50],
  m:[1.2,1.4,1.6,1.8,2.0],
  min:[15,20,25,30],
  band:['gelb','rot','grün','blau','schwarz']
};

/* =========================================================
   Zustand
   ========================================================= */
let plan, logs = [], dayId = 'mo', mode = 'log', today = iso(new Date()), open = null;

function iso(d){ return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); }
function esc(s){ return String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function toast(t){ const el=document.getElementById('toast'); el.textContent=t; el.classList.add('on');
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('on'),1700); }

function session(create){
  let s = logs.find(x=>x.date===today && x.dayId===dayId);
  if(!s && create){ s = {date:today, dayId, vals:{}, warm:[]}; logs.push(s); }
  return s;
}
function getVal(exId,side,i){
  const s = session(false); if(!s) return '';
  return s.vals?.[exId]?.[side]?.[i] ?? '';
}
function setVal(exId,side,i,v){
  const s = session(true);
  s.vals[exId] = s.vals[exId] || {};
  s.vals[exId][side] = s.vals[exId][side] || [];
  s.vals[exId][side][i] = v;
  persist();
}
// letzter Eintrag vor heute
function lastVal(exId,side,i){
  const prev = logs.filter(s=>s.date < today && s.vals?.[exId]?.[side]?.[i] !== undefined
      && s.vals[exId][side][i] !== '')
    .sort((a,b)=>b.date.localeCompare(a.date))[0];
  return prev ? prev.vals[exId][side][i] : '';
}
async function persist(){ await save({plan, logs}); }

function allBlocks(day){ return [Object.assign({}, plan.hip, {shared:true}), ...day.blocks]; }
function curDay(){ return plan.days.find(d=>d.id===dayId) || plan.days[0]; }

/* =========================================================
   Ansicht
   ========================================================= */
function render(){
  document.getElementById('date').value = today;
  document.getElementById('tabs').innerHTML = plan.days.map(d=>
    `<button class="tab ${d.id===dayId?'on':''}" data-day="${d.id}">
       <b>${esc(d.short)}</b><span>${esc(d.slot||'')}</span></button>`).join('');

  const day = curDay();
  const main = document.getElementById('main');
  const head = `<div class="dayhead">
    <div class="daytitle">${esc(day.title)}</div>
    ${day.slot==='morgens'?`<div class="daywarn">Morgeneinheit — Aufwärmen auf 18 Min verlängern, kalte Hüfte braucht länger</div>`:''}
  </div>`;

  if(mode==='log') main.innerHTML = head + warmHTML() + allBlocks(day).map(b=>blockHTML(b,false)).join('');
  else main.innerHTML = head + allBlocks(day).map(b=>blockHTML(b,true)).join('')
    + `<div class="block"><button class="addbtn" data-addblock="1">+ Block hinzufügen</button></div>`;
}

function warmHTML(){
  const s = session(false), done = s?.warm || [];
  const n = done.filter(Boolean).length;
  return `<div class="warm">
    <button class="wtog" data-warm="t">
      <span class="dot" style="--k:var(--explosiv)"></span>
      <span class="btitle">Aufwärmen</span>
      <span class="bmeta">${n}/${plan.warmup.length}${open==='warm'?'  ▲':'  ▼'}</span>
    </button>
    ${open==='warm' ? `<div class="wbody">${plan.warmup.map((w,i)=>
      `<div class="witem ${done[i]?'on':''}" data-warmi="${i}"><span class="box"></span><span>${esc(w)}</span></div>`
    ).join('')}</div>` : ''}
  </div>`;
}

function blockHTML(b,edit){
  const bi = b.shared ? 'hip' : curDay().blocks.indexOf(b);
  return `<section class="block" style="--k:var(--${b.kind})">
    <div class="bhead">
      <span class="dot"></span><span class="btitle">${esc(b.name)}</span>
      ${b.shared?'<span class="bmeta">jeden Tag</span>':''}
    </div>
    ${b.ex.map(x=>edit?editHTML(x,bi):exHTML(x)).join('')}
    ${edit?`<button class="addbtn" data-addex="${bi}">+ Übung</button>`:''}
  </section>`;
}

function exHTML(x){
  const spec = x.uni
    ? `${x.setsL||0}/${x.setsR||0} × ${x.reps}  ·  ${UNIT[x.type]}`
    : `${x.sets} × ${x.reps}  ·  ${UNIT[x.type]}`;
  let tracks = '';
  if(x.uni){
    if(x.setsL>0) tracks += trackHTML(x,'L',x.setsL);
    if(x.setsR>0) tracks += trackHTML(x,'R',x.setsR);
  } else tracks = trackHTML(x,'B',x.sets);
  return `<div class="ex">
    <div class="etop">
      <div>
        <div class="ename">${esc(x.name)}</div>
        <div class="espec">${esc(spec)}</div>
      </div>
      ${x.desc?`<button class="info" data-info="${x.id}" aria-label="Anleitung zu ${esc(x.name)}">i</button>`:''}
    </div>
    ${tracks}
    ${x.note?`<div class="enote">${esc(x.note)}</div>`:''}
  </div>`;
}

function trackHTML(x,side,n){
  let chips='';
  for(let i=0;i<n;i++){
    const v = getVal(x.id,side,i), last = lastVal(x.id,side,i);
    const show = v!=='' ? v : (last!=='' ? last : '·');
    chips += `<button class="chip ${v!==''?'filled':'empty'}"
      data-ex="${x.id}" data-side="${side}" data-i="${i}" data-name="${esc(x.name)}" data-type="${x.type}">
      <span class="v">${esc(show)}</span><span class="u">${v!==''?UNIT[x.type]:(last!==''?'zuletzt':'Satz '+(i+1))}</span>
    </button>`;
  }
  return `<div class="track">
    <span class="side ${side}">${side==='B'?'':side}</span>
    <div class="chips">${chips}</div></div>`;
}

function editHTML(x,bi){
  const o = t=>`<option value="${t}" ${x.type===t?'selected':''}>${UNIT[t]}</option>`;
  return `<div class="edit" data-exid="${x.id}" data-bi="${bi}">
    <div class="f wide"><label>Übung</label><input data-k="name" value="${esc(x.name)}"></div>
    <div class="grid">
      <div class="f"><label>Belastung</label><select data-k="type">
        ${['kg','band','sek','bw','cm','m','min'].map(o).join('')}</select></div>
      <div class="f"><label>Wiederholungen</label><input data-k="reps" value="${esc(x.reps)}"></div>
      <div class="f"><label>Seiten</label><select data-k="uni">
        <option value="0" ${!x.uni?'selected':''}>Beidseitig</option>
        <option value="1" ${x.uni?'selected':''}>Links / rechts</option></select></div>
      ${x.uni
        ? `<div class="f"><label>Sätze L / R</label>
             <div style="display:flex;gap:6px">
               <input data-k="setsL" type="number" inputmode="numeric" value="${x.setsL||0}">
               <input data-k="setsR" type="number" inputmode="numeric" value="${x.setsR||0}"></div></div>`
        : `<div class="f"><label>Sätze</label>
             <input data-k="sets" type="number" inputmode="numeric" value="${x.sets||1}"></div>`}
      <div class="f wide"><label>Notiz — kurzer Hinweis unter der Übung</label><input data-k="note" value="${esc(x.note||'')}"></div>
      <div class="f wide"><label>Anleitung — Text hinter dem i</label><textarea data-k="desc" rows="4">${esc(x.desc||'')}</textarea></div>
    </div>
    <div class="erow">
      <button class="mini" data-move="-1">↑ Hoch</button>
      <button class="mini" data-move="1">↓ Runter</button>
      <button class="mini danger" data-del="1" style="margin-left:auto">Löschen</button>
    </div>
  </div>`;
}

/* =========================================================
   Eingabe-Overlay
   ========================================================= */
function findEx(id){
  for(const b of [plan.hip, ...plan.days.flatMap(d=>d.blocks)]){
    const f = b.ex.find(x=>x.id===id); if(f) return f;
  }
  return null;
}

function openInfo(id){
  const x = findEx(id); if(!x) return;
  const spec = x.uni ? `${x.setsL||0}/${x.setsR||0} × ${x.reps}` : `${x.sets} × ${x.reps}`;
  document.getElementById('card').innerHTML = `
    <h2>${esc(x.name)}</h2>
    <div class="sub">${esc(spec)}  ·  ${UNIT[x.type]}</div>
    <div class="guide">${esc(x.desc||'Keine Anleitung hinterlegt.')}</div>
    ${x.note?`<div class="cue"><span class="cuelabel">Achte darauf</span>${esc(x.note)}</div>`:''}
    <button class="solid" data-close="1">Schliessen</button>`;
  show(true);
}

function openEntry(exId,side,i,name,type){
  const cur = getVal(exId,side,i), last = lastVal(exId,side,i);
  const sideTxt = side==='L'?' · links':side==='R'?' · rechts':'';
  const q = QUICK[type]||[];
  document.getElementById('card').innerHTML = `
    <h2>${esc(name)}</h2>
    <div class="sub">Satz ${i+1}${sideTxt} · ${UNIT[type]}${last!==''?`  ·  zuletzt ${esc(last)}`:''}</div>
    <input class="big" id="entry" value="${esc(cur)}"
      ${TEXTY[type]?'type="text"':'type="number" inputmode="decimal" step="any"'}>
    <div class="quick">${q.map(v=>`<button data-q="${esc(v)}">${esc(v)}</button>`).join('')}</div>
    <button class="solid" id="okEntry">Eintragen</button>
    <button class="ghost" id="clearEntry">Wert löschen</button>`;
  show(true);
  const inp = document.getElementById('entry');
  setTimeout(()=>{inp.focus(); inp.select();},60);
  document.getElementById('okEntry').onclick = ()=>{ setVal(exId,side,i,inp.value.trim()); show(false); render(); };
  document.getElementById('clearEntry').onclick = ()=>{ setVal(exId,side,i,''); show(false); render(); };
  inp.onkeydown = ev=>{ if(ev.key==='Enter') document.getElementById('okEntry').click(); };
  document.getElementById('card').querySelectorAll('[data-q]').forEach(b=>
    b.onclick = ()=>{ inp.value = b.dataset.q; });
}
function show(v){ document.getElementById('sheet').classList.toggle('hide',!v); }

/* =========================================================
   Verlauf & Daten
   ========================================================= */
function openHistory(){
  const rows = logs.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,40);
  document.getElementById('card').innerHTML = `<h2>Verlauf</h2>
    <div class="sub">${logs.length} Einheiten protokolliert</div>
    ${rows.length?rows.map(s=>{
      const d = plan.days.find(x=>x.id===s.dayId);
      const parts=[];
      for(const [exId,sides] of Object.entries(s.vals||{})){
        let nm='';
        for(const b of [plan.hip,...plan.days.flatMap(dd=>dd.blocks)])
          { const f=b.ex.find(z=>z.id===exId); if(f){nm=f.name;break;} }
        const vs=[]; for(const k of ['B','L','R']) if(sides[k]) vs.push((k==='B'?'':k+' ')+sides[k].filter(z=>z!=='').join(' / '));
        if(nm&&vs.length) parts.push(`${nm}: ${vs.join('  |  ')}`);
      }
      return `<div class="hist"><div class="d">${s.date} · ${esc(d?d.title:s.dayId)}</div>
        <div class="vals">${parts.length?esc(parts.join('\n')).replace(/\n/g,'<br>'):'—'}</div></div>`;
    }).join(''):'<div class="empty-note">Noch nichts protokolliert.<br>Trag deinen ersten Satz ein.</div>'}`;
  show(true);
}

function openData(){
  document.getElementById('card').innerHTML = `<h2>Daten</h2>
    <div class="sub">Sichere regelmässig. iOS löscht den Speicher von Web-Apps, die wochenlang ungeöffnet bleiben.</div>
    <button class="solid" id="exp">Als JSON exportieren</button>
    <button class="ghost" id="imp">JSON importieren</button>
    <button class="ghost" id="rst" style="color:var(--kraft)">Plan auf Ausgangsversion zurücksetzen</button>
    <input type="file" id="file" accept="application/json" style="display:none">`;
  show(true);
  document.getElementById('exp').onclick = ()=>{
    const blob = new Blob([JSON.stringify({plan,logs},null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `training-${today}.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    toast('Exportiert');
  };
  document.getElementById('imp').onclick = ()=>document.getElementById('file').click();
  document.getElementById('file').onchange = ev=>{
    const f = ev.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = async ()=>{ try{
      const d = JSON.parse(r.result);
      if(!d.plan||!Array.isArray(d.logs)) throw 0;
      plan = d.plan; logs = d.logs; await persist(); show(false); render(); toast('Importiert');
    }catch(e){ toast('Datei nicht lesbar'); } };
    r.readAsText(f);
  };
  document.getElementById('rst').onclick = async ()=>{
    if(!confirm('Plan zurücksetzen? Protokollierte Einheiten bleiben erhalten.')) return;
    plan = attachDesc(defaultPlan()); await persist(); show(false); render(); toast('Plan zurückgesetzt');
  };
}

/* =========================================================
   Ereignisse
   ========================================================= */
document.addEventListener('click', async ev=>{
  const t = ev.target;

  if(t.closest('#sheet') && !t.closest('#card')){ show(false); return; }
  if(t.closest('[data-close]')){ show(false); return; }

  const inf = t.closest('[data-info]');
  if(inf){ openInfo(inf.dataset.info); return; }

  const tab = t.closest('[data-day]');
  if(tab){ dayId = tab.dataset.day; open=null; render(); return; }

  if(t.closest('[data-warm]')){ open = open==='warm'?null:'warm'; render(); return; }
  const wi = t.closest('[data-warmi]');
  if(wi){ const s=session(true); const i=+wi.dataset.warmi;
    s.warm[i] = !s.warm[i]; await persist(); render(); return; }

  const chip = t.closest('.chip');
  if(chip){ openEntry(chip.dataset.ex, chip.dataset.side, +chip.dataset.i,
      chip.dataset.name, chip.dataset.type); return; }

  const addex = t.closest('[data-addex]');
  if(addex){ const bi = addex.dataset.addex;
    const blk = bi==='hip' ? plan.hip : curDay().blocks[+bi];
    blk.ex.push(e('Neue Übung','kg',3,'8')); await persist(); render(); return; }

  if(t.closest('[data-addblock]')){
    curDay().blocks.push({kind:'core',name:'Neuer Block',ex:[e('Neue Übung','kg',3,'8')]});
    await persist(); render(); return; }

  const box = t.closest('.edit');
  if(box){
    const bi = box.dataset.bi, blk = bi==='hip' ? plan.hip : curDay().blocks[+bi];
    const idx = blk.ex.findIndex(x=>x.id===box.dataset.exid);
    if(t.closest('[data-del]')){
      if(confirm('Übung löschen?')){ blk.ex.splice(idx,1); await persist(); render(); } return; }
    const mv = t.closest('[data-move]');
    if(mv){ const j = idx + (+mv.dataset.move);
      if(j>=0 && j<blk.ex.length){ const [x]=blk.ex.splice(idx,1); blk.ex.splice(j,0,x);
        await persist(); render(); } return; }
  }
});

// Felder im Bearbeiten-Modus
document.addEventListener('change', async ev=>{
  const box = ev.target.closest('.edit'); if(!box) return;
  const bi = box.dataset.bi, blk = bi==='hip' ? plan.hip : curDay().blocks[+bi];
  const x = blk.ex.find(z=>z.id===box.dataset.exid); if(!x) return;
  const k = ev.target.dataset.k, v = ev.target.value;
  if(k==='uni'){ x.uni = v==='1';
    if(x.uni){ x.setsL = x.setsL ?? (x.sets||3); x.setsR = x.setsR ?? (x.sets||3); }
    else x.sets = x.sets || Math.max(x.setsL||0,x.setsR||0) || 3;
  }
  else if(['sets','setsL','setsR'].includes(k)) x[k] = Math.max(0, +v||0);
  else x[k] = v;
  await persist(); render();
});

document.getElementById('date').onchange = ev=>{ today = ev.target.value; render(); };
const nav = {nLog:'log', nEdit:'edit'};
['nLog','nEdit'].forEach(id=>document.getElementById(id).onclick = ()=>{
  mode = nav[id]; open = null;
  document.querySelectorAll('footer button').forEach(b=>b.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  render();
});
document.getElementById('nHist').onclick = openHistory;
document.getElementById('nData').onclick = openData;

/* ---------- Start ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

(async function init(){
  const d = await load();
  plan = attachDesc(d?.plan || defaultPlan());
  logs = d?.logs || [];
  render();
})();
