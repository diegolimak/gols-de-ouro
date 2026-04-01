// ============================================
// COPA 2026 — AMOR À VIDA
// Sistema de Gamificação Comercial
// ============================================

const TIMES = {
  thais: { nome: 'Time Thaís', cor: '#3b82f6' },
  luiza: { nome: 'Time Luiza', cor: '#ef4444' }
};

const PONTUACAO = {
  closer: {
    reuniaoOnline: 3, reuniaoPresencial: 5,
    posVenda: 4, indicacao: 5,
    fotoPost: 5,           // NOVO: foto pós-venda postada e marcando a corretora
    crmAtualizado: 10,
    mult: 2
  },
  novato: {
    contato: 1, reuniaoOnline: 3, reuniaoPresencial: 5, proposta: 5,
    fotoPost: 5,
    crmAtualizado: 10,
    mult: 2
  },
  sdr: { reuniaoAgendada: 2, reuniaoRealizada: 4, leadVenda: 10 },
  backoffice: { reuniaoCarteira: 2, propostaSubida: 3, vidasDiv: 5, propostaVenda: 5 },
  gerente: { timeVenceu: 10, metaReunioes: 5, crmOrganizado: 5, melhorVendedor: 5 },
  vendas: { ate29: 10, ate49: 15, mais50: 20 }
};

// ============================================
// STORAGE
// ============================================
function salvar(dados) { localStorage.setItem('copa2026', JSON.stringify(dados)); }
function carregar() {
  const d = localStorage.getItem('copa2026');
  return d ? JSON.parse(d) : { registros: [], semanas: [] };
}

function semanaAtual() {
  const hoje = new Date(), ano = hoje.getFullYear();
  const ini = new Date(ano, 0, 1);
  const sem = Math.ceil(((hoje - ini) / 86400000 + ini.getDay() + 1) / 7);
  return `${ano}-W${String(sem).padStart(2,'0')}`;
}

function formatarSemana(s) {
  if (!s) return '';
  const [ano, w] = s.split('-W'), n = parseInt(w);
  const ini = new Date(ano, 0, 1 + (n-1)*7);
  const fim = new Date(ini); fim.setDate(fim.getDate()+6);
  const f = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  return `Sem. ${n} · ${f(ini)} – ${f(fim)}/${ano}`;
}

// ============================================
// CÁLCULO DE PONTOS
// ============================================
function calcularPontos(r) {
  let p = 0;
  const pf = r.perfil;

  if (pf === 'closer' || pf === 'novato') {
    const m = PONTUACAO[pf].mult;
    p += (r.reunioesOnline||0)           * PONTUACAO[pf].reuniaoOnline;
    p += (r.reunioesPresenciais||0)       * PONTUACAO[pf].reuniaoPresencial;
    p += (r.reunioesOnlineProsp||0)       * PONTUACAO[pf].reuniaoOnline * m;
    p += (r.reunioesPresenciaisProsp||0)  * PONTUACAO[pf].reuniaoPresencial * m;
    p += (r.fotosPost||0)                 * PONTUACAO[pf].fotoPost;  // foto pós-venda
    if (r.crmAtualizado) p += PONTUACAO[pf].crmAtualizado;

    if (pf === 'closer') {
      p += (r.posVendas||0)       * PONTUACAO.closer.posVenda;
      p += (r.indicacoes||0)      * PONTUACAO.closer.indicacao;
      p += (r.posVendasProsp||0)  * PONTUACAO.closer.posVenda * m;
      p += (r.indicacoesProsp||0) * PONTUACAO.closer.indicacao * m;
    }
    if (pf === 'novato') {
      p += (r.contatos||0)       * PONTUACAO.novato.contato;
      p += (r.propostas||0)      * PONTUACAO.novato.proposta;
      p += (r.contatosProsp||0)  * PONTUACAO.novato.contato * m;
      p += (r.propostasProsp||0) * PONTUACAO.novato.proposta * m;
    }

    p += (r.vendas29||0) * PONTUACAO.vendas.ate29;
    p += (r.vendas30||0) * PONTUACAO.vendas.ate49;
    p += (r.vendas50||0) * PONTUACAO.vendas.mais50;

  } else if (pf === 'sdr') {
    p += (r.reunioesAgendadas||0)  * PONTUACAO.sdr.reuniaoAgendada;
    p += (r.reunioesRealizadas||0) * PONTUACAO.sdr.reuniaoRealizada;
    p += (r.leadsVenda||0)         * PONTUACAO.sdr.leadVenda;

  } else if (pf === 'backoffice') {
    p += (r.reunioesCarteira||0)  * PONTUACAO.backoffice.reuniaoCarteira;
    p += (r.propostasSubidas||0)  * PONTUACAO.backoffice.propostaSubida;
    p += Math.floor((r.vidasPropostas||0) / PONTUACAO.backoffice.vidasDiv);
    p += (r.propostasVenda||0)    * PONTUACAO.backoffice.propostaVenda;

  } else if (pf === 'gerente') {
    if (r.timeVenceu)     p += PONTUACAO.gerente.timeVenceu;
    if (r.metaReunioes)   p += PONTUACAO.gerente.metaReunioes;
    if (r.crmOrganizado)  p += PONTUACAO.gerente.crmOrganizado;
    if (r.melhorVendedor) p += PONTUACAO.gerente.melhorVendedor;
  }

  return p;
}

// ============================================
// PREVIEW TEMPO REAL (formulário)
// ============================================
function calcularPontosPreview() {
  const sel = document.getElementById('nome');
  if (!sel || !sel.value) return;
  const pf = sel.options[sel.selectedIndex].dataset.perfil;

  const reg = {
    perfil: pf,
    reunioesOnline:          parseInt(document.getElementById('reunioesOnline')?.value||0),
    reunioesPresenciais:     parseInt(document.getElementById('reunioesPresenciais')?.value||0),
    reunioesOnlineProsp:     parseInt(document.getElementById('reunioesOnlineProsp')?.value||0),
    reunioesPresenciaisProsp:parseInt(document.getElementById('reunioesPresenciaisProsp')?.value||0),
    fotosPost:               parseInt(document.getElementById('fotosPost')?.value||0),
    crmAtualizado:           document.getElementById('crmAtualizado')?.checked||false,
    vendas29: parseInt(document.getElementById('vendas29')?.value||0),
    vendas30: parseInt(document.getElementById('vendas30')?.value||0),
    vendas50: parseInt(document.getElementById('vendas50')?.value||0)
  };

  if (pf==='closer') {
    reg.posVendas=parseInt(document.getElementById('posVendas')?.value||0);
    reg.indicacoes=parseInt(document.getElementById('indicacoes')?.value||0);
    reg.posVendasProsp=parseInt(document.getElementById('posVendasProsp')?.value||0);
    reg.indicacoesProsp=parseInt(document.getElementById('indicacoesProsp')?.value||0);
  } else if (pf==='novato') {
    reg.contatos=parseInt(document.getElementById('contatos')?.value||0);
    reg.propostas=parseInt(document.getElementById('propostas')?.value||0);
    reg.contatosProsp=parseInt(document.getElementById('contatosProsp')?.value||0);
    reg.propostasProsp=parseInt(document.getElementById('propostasProsp')?.value||0);
  } else if (pf==='sdr') {
    reg.reunioesAgendadas=parseInt(document.getElementById('reunioesAgendadas')?.value||0);
    reg.reunioesRealizadas=parseInt(document.getElementById('reunioesRealizadas')?.value||0);
    reg.leadsVenda=parseInt(document.getElementById('leadsVenda')?.value||0);
  } else if (pf==='backoffice') {
    reg.reunioesCarteira=parseInt(document.getElementById('reunioesCarteira')?.value||0);
    reg.propostasSubidas=parseInt(document.getElementById('propostasSubidas')?.value||0);
    reg.vidasPropostas=parseInt(document.getElementById('vidasPropostas')?.value||0);
    reg.propostasVenda=parseInt(document.getElementById('propostasVenda')?.value||0);
  } else if (pf==='gerente') {
    reg.timeVenceu=document.getElementById('timeVenceu')?.checked||false;
    reg.metaReunioes=document.getElementById('metaReunioes')?.checked||false;
    reg.crmOrganizado=document.getElementById('crmOrganizado')?.checked||false;
    reg.melhorVendedor=document.getElementById('melhorVendedor')?.checked||false;
  }

  const total = calcularPontos(reg);
  const el = document.getElementById('pontosCalculados');
  if (el) el.textContent = `${total} pontos`;
}

// ============================================
// SALVAR REGISTRO
// ============================================
function salvarRegistro() {
  const sel = document.getElementById('nome');
  if (!sel?.value) { mostrarMsg('Selecione seu nome!','error'); return; }

  const opt    = sel.options[sel.selectedIndex];
  const nome   = sel.value;
  const pf     = opt.dataset.perfil;
  const time   = opt.dataset.time;
  const semana = document.getElementById('semana').value || semanaAtual();

  const reg = {
    nome, perfil:pf, time, semana,
    timestamp: new Date().toISOString(),
    reunioesOnline:          parseInt(document.getElementById('reunioesOnline')?.value||0),
    reunioesPresenciais:     parseInt(document.getElementById('reunioesPresenciais')?.value||0),
    reunioesOnlineProsp:     parseInt(document.getElementById('reunioesOnlineProsp')?.value||0),
    reunioesPresenciaisProsp:parseInt(document.getElementById('reunioesPresenciaisProsp')?.value||0),
    fotosPost:               parseInt(document.getElementById('fotosPost')?.value||0),
    crmAtualizado:           document.getElementById('crmAtualizado')?.checked||false,
    vendas29: parseInt(document.getElementById('vendas29')?.value||0),
    vendas30: parseInt(document.getElementById('vendas30')?.value||0),
    vendas50: parseInt(document.getElementById('vendas50')?.value||0)
  };

  if (pf==='closer') {
    reg.posVendas=parseInt(document.getElementById('posVendas')?.value||0);
    reg.indicacoes=parseInt(document.getElementById('indicacoes')?.value||0);
    reg.posVendasProsp=parseInt(document.getElementById('posVendasProsp')?.value||0);
    reg.indicacoesProsp=parseInt(document.getElementById('indicacoesProsp')?.value||0);
  } else if (pf==='novato') {
    reg.contatos=parseInt(document.getElementById('contatos')?.value||0);
    reg.propostas=parseInt(document.getElementById('propostas')?.value||0);
    reg.contatosProsp=parseInt(document.getElementById('contatosProsp')?.value||0);
    reg.propostasProsp=parseInt(document.getElementById('propostasProsp')?.value||0);
  } else if (pf==='sdr') {
    reg.reunioesAgendadas=parseInt(document.getElementById('reunioesAgendadas')?.value||0);
    reg.reunioesRealizadas=parseInt(document.getElementById('reunioesRealizadas')?.value||0);
    reg.leadsVenda=parseInt(document.getElementById('leadsVenda')?.value||0);
  } else if (pf==='backoffice') {
    reg.reunioesCarteira=parseInt(document.getElementById('reunioesCarteira')?.value||0);
    reg.propostasSubidas=parseInt(document.getElementById('propostasSubidas')?.value||0);
    reg.vidasPropostas=parseInt(document.getElementById('vidasPropostas')?.value||0);
    reg.propostasVenda=parseInt(document.getElementById('propostasVenda')?.value||0);
  } else if (pf==='gerente') {
    reg.timeVenceu=document.getElementById('timeVenceu')?.checked||false;
    reg.metaReunioes=document.getElementById('metaReunioes')?.checked||false;
    reg.crmOrganizado=document.getElementById('crmOrganizado')?.checked||false;
    reg.melhorVendedor=document.getElementById('melhorVendedor')?.checked||false;
  }

  reg.pontos = calcularPontos(reg);

  const dados = carregar();
  const idx   = dados.registros.findIndex(r => r.nome===nome && r.semana===semana);

  if (idx >= 0) {
    if (!confirm(`Você já tem um registro nesta semana (${dados.registros[idx].pontos} pts). Atualizar?`)) return;
    dados.registros[idx] = reg;
  } else {
    dados.registros.push(reg);
  }

  if (!dados.semanas.includes(semana)) dados.semanas.push(semana);
  dados.semanas.sort().reverse();
  salvar(dados);

  mostrarMsg(`✅ ${reg.pontos} pontos registrados, ${nome}!`, 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 2000);
}

function mostrarMsg(txt, tipo) {
  let el = document.getElementById('_msg');
  if (!el) {
    el = document.createElement('div'); el.id='_msg';
    const form = document.getElementById('registroForm');
    if (form) form.prepend(el);
  }
  el.className = tipo==='error' ? 'msg-error' : 'msg-success';
  el.textContent = txt;
  el.scrollIntoView({ behavior:'smooth', block:'center' });
}

// ============================================
// DASHBOARD
// ============================================
function inicializarSistema() {
  const sel = document.getElementById('weekSelector');
  if (!sel) return;
  const dados = carregar();
  const atual = semanaAtual();
  const semanas = [...new Set([atual, ...dados.semanas])].sort().reverse();
  sel.innerHTML = '';
  semanas.forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = formatarSemana(s); sel.appendChild(o);
  });
  sel.value = atual;
}

function carregarSemana() { atualizarDashboard(); }

function atualizarDashboard() {
  const sel = document.getElementById('weekSelector');
  if (!sel) return;
  const dados   = carregar();
  const semana  = sel.value;
  const regs    = dados.registros.filter(r => r.semana===semana);

  if (!regs.length) { limparDashboard(); return; }

  // placar times
  const ptThais = regs.filter(r=>r.time==='thais').reduce((s,r)=>s+(r.pontos||0),0);
  const ptLuiza = regs.filter(r=>r.time==='luiza').reduce((s,r)=>s+(r.pontos||0),0);

  document.getElementById('pointsThais').textContent = ptThais;
  document.getElementById('pointsLuiza').textContent = ptLuiza;

  // lider
  const paThais = document.getElementById('panelThais');
  const paLuiza = document.getElementById('panelLuiza');
  [paThais, paLuiza].forEach(p => { if(p){ p.classList.remove('panel-lider'); p.querySelector('.lider-pill')?.remove(); } });
  if (ptThais > ptLuiza && ptThais>0 && paThais) {
    paThais.classList.add('panel-lider');
    const b=document.createElement('div'); b.className='lider-pill'; b.textContent='⚽ LÍDER';
    paThais.prepend(b);
  } else if (ptLuiza > ptThais && ptLuiza>0 && paLuiza) {
    paLuiza.classList.add('panel-lider');
    const b=document.createElement('div'); b.className='lider-pill'; b.textContent='⚽ LÍDER';
    paLuiza.prepend(b);
  }

  // pódio
  const rank = [...regs].sort((a,b)=>(b.pontos||0)-(a.pontos||0));
  [
    {n:'first',p:'firstPoints',t:'firstTeam'},
    {n:'second',p:'secondPoints',t:'secondTeam'},
    {n:'third',p:'thirdPoints',t:'thirdTeam'}
  ].forEach(({n,p,t},i) => {
    document.getElementById(n).textContent = rank[i]?.nome || '—';
    document.getElementById(p).textContent = rank[i] ? `${rank[i].pontos} pts` : '0 pts';
    const tel = document.getElementById(t);
    if (tel) {
      tel.textContent = rank[i] ? TIMES[rank[i].time]?.nome || '' : '';
      tel.className   = rank[i] ? `podium-team-tag tag-${rank[i].time}` : 'podium-team-tag';
    }
  });

  calcularDestaques(regs);
  atualizarRanking(regs);
  atualizarEstatisticas(regs);
}

function calcularDestaques(regs) {
  // artilheiro
  let art=null, maxV=0;
  regs.forEach(r=>{ const v=(r.vendas29||0)+(r.vendas30||0)+(r.vendas50||0); if(v>maxV){maxV=v;art=r.nome;} });
  document.getElementById('artilheiro').textContent = art||'—';
  document.getElementById('artilheiroValue').textContent = `${maxV} vendas`;

  // assistente (reuniões)
  let ass=null, maxR=0;
  regs.forEach(r=>{ const m=(r.reunioesOnline||0)+(r.reunioesPresenciais||0)+(r.reunioesOnlineProsp||0)+(r.reunioesPresenciaisProsp||0)+(r.reunioesAgendadas||0)+(r.reunioesRealizadas||0); if(m>maxR){maxR=m;ass=r.nome;} });
  document.getElementById('assistente').textContent = ass||'—';
  document.getElementById('assistenteValue').textContent = `${maxR} reuniões`;

  // influencer (mais fotos/posts)
  let inf=null, maxF=0;
  regs.forEach(r=>{ if((r.fotosPost||0)>maxF){maxF=r.fotosPost||0;inf=r.nome;} });
  document.getElementById('influencer').textContent = inf&&maxF>0?inf:'—';
  document.getElementById('influencerValue').textContent = maxF>0?`${maxF} posts`:'—';

  // CRM
  const crm = regs.filter(r=>r.crmAtualizado);
  document.getElementById('crmPerfeito').textContent    = crm.length?crm.map(r=>r.nome).join(', '):'—';
  document.getElementById('crmPerfeitoValue').textContent = crm.length?'100%':'—';

  // gerente
  const ger = regs.filter(r=>r.perfil==='gerente').sort((a,b)=>(b.pontos||0)-(a.pontos||0));
  document.getElementById('gerenteDestaque').textContent = ger.length?ger[0].nome:'—';
  document.getElementById('gerenteValue').textContent    = ger.length?`${ger[0].pontos} pts`:'0 pts';
}

function atualizarRanking(regs, filtro='todos') {
  const tbody = document.getElementById('rankingBody');
  if (!tbody) return;
  tbody.innerHTML='';

  let lista = [...regs].sort((a,b)=>(b.pontos||0)-(a.pontos||0));
  if (filtro==='thais') lista=lista.filter(r=>r.time==='thais');
  if (filtro==='luiza') lista=lista.filter(r=>r.time==='luiza');

  if (!lista.length) {
    tbody.innerHTML=`<tr><td colspan="9"><div class="empty-state"><span>📋</span>Nenhum registro para esta semana ainda</div></td></tr>`;
    return;
  }

  lista.forEach((r,i) => {
    const tr=document.createElement('tr');
    if (i===0) tr.className='r1'; else if(i===1) tr.className='r2'; else if(i===2) tr.className='r3';
    const reunioes=(r.reunioesOnline||0)+(r.reunioesPresenciais||0)+(r.reunioesOnlineProsp||0)+(r.reunioesPresenciaisProsp||0)+(r.reunioesAgendadas||0)+(r.reunioesRealizadas||0);
    const vendas=(r.vendas29||0)+(r.vendas30||0)+(r.vendas50||0);
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`;
    tr.innerHTML=`
      <td><strong>${medal}</strong></td>
      <td><strong>${r.nome}</strong></td>
      <td>${traduzir(r.perfil)}</td>
      <td><span class="badge tag-${r.time}">${TIMES[r.time]?.nome||r.time}</span></td>
      <td>${reunioes}</td>
      <td>${vendas}</td>
      <td>${r.fotosPost||0}</td>
      <td>${r.crmAtualizado?'✅':'—'}</td>
      <td class="pts-col">${r.pontos||0}</td>`;
    tbody.appendChild(tr);
  });
}

function traduzir(p) {
  return {closer:'Closer',novato:'Consultor',sdr:'SDR',backoffice:'Backoffice',gerente:'Gerente'}[p]||p;
}

function atualizarEstatisticas(regs) {
  const totalR=regs.reduce((s,r)=>s+(r.reunioesOnline||0)+(r.reunioesPresenciais||0)+(r.reunioesOnlineProsp||0)+(r.reunioesPresenciaisProsp||0)+(r.reunioesAgendadas||0)+(r.reunioesRealizadas||0),0);
  const totalV=regs.reduce((s,r)=>s+(r.vendas29||0)+(r.vendas30||0)+(r.vendas50||0),0);
  const totalVidas=regs.reduce((s,r)=>s+((r.vendas29||0)*15)+((r.vendas30||0)*40)+((r.vendas50||0)*60),0);
  const totalF=regs.reduce((s,r)=>s+(r.fotosPost||0),0);
  document.getElementById('totalReunioes').textContent=totalR;
  document.getElementById('totalVendas').textContent=totalV;
  document.getElementById('totalVidas').textContent=totalVidas;
  document.getElementById('totalFotos').textContent=totalF;
}

function filtrarRanking(filtro, el) {
  document.querySelectorAll('.rf-btn').forEach(b=>b.classList.remove('active'));
  if (el) el.classList.add('active');
  const sel=document.getElementById('weekSelector');
  const dados=carregar();
  const regs=dados.registros.filter(r=>r.semana===(sel?sel.value:semanaAtual()));
  atualizarRanking(regs, filtro);
}

function limparDashboard() {
  document.getElementById('pointsThais').textContent='0';
  document.getElementById('pointsLuiza').textContent='0';
  ['first','second','third'].forEach(p=>{
    document.getElementById(p).textContent='—';
    document.getElementById(p+'Points').textContent='0 pts';
    const t=document.getElementById(p+'Team'); if(t)t.textContent='';
  });
  ['totalReunioes','totalVendas','totalVidas','totalFotos'].forEach(id=>document.getElementById(id).textContent='0');
  document.getElementById('rankingBody').innerHTML=`<tr><td colspan="9"><div class="empty-state"><span>📋</span>Nenhum registro para esta semana ainda</div></td></tr>`;
}

function exportarDados() {
  const dados=carregar();
  const blob=new Blob([JSON.stringify(dados,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`copa2026-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function limparDados() {
  if (!confirm('⚠️ Apagar TODOS os dados e iniciar nova rodada?')) return;
  if (!confirm('🚨 ÚLTIMA CONFIRMAÇÃO — não pode ser desfeito!')) return;
  localStorage.removeItem('copa2026');
  alert('✅ Dados limpos. Nova rodada iniciada!');
  location.reload();
}

// Scroll reveal
document.addEventListener('DOMContentLoaded',()=>{
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{ if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'),i*55); obs.unobserve(e.target); } });
  },{threshold:0.08});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
});
