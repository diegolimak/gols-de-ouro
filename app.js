// ============================================
// GOLS DE OURO - AMOR À VIDA
// Sistema de Gamificação Comercial
// ============================================

const TIMES = {
    thais: {
        nome: 'Time Thaís',
        membros: ['Rodrigo', 'Gisele', 'Thiago', 'Vitor Lorran', 'Marjorie', 'Thaís'],
        cor: '#3b82f6'
    },
    luiza: {
        nome: 'Time Luiza',
        membros: ['Matheus', 'Kaike', 'Victo Matera', 'Gabriela', 'Bianca', 'Luiza'],
        cor: '#ef4444'
    }
};

const PONTUACAO = {
    closer: {
        reuniaoOnline: 3,
        reuniaoPresencial: 5,
        posVenda: 4,
        indicacao: 5,
        crmAtualizado: 10,
        prospeccaoMultiplicador: 2
    },
    novato: {
        contato: 1,
        reuniaoOnline: 3,
        reuniaoPresencial: 5,
        proposta: 5,
        crmAtualizado: 10,
        prospeccaoMultiplicador: 2
    },
    sdr: {
        reuniaoAgendada: 2,
        reuniaoRealizada: 4,
        leadVenda: 10
    },
    backoffice: {
        reuniaoCarteira: 2,
        propostaSubida: 3,
        vidasPonto: 5,
        propostaVenda: 5
    },
    gerente: {
        timeVenceu: 10,
        metaReunioes: 5,
        crmOrganizado: 5,
        melhorVendedor: 5
    },
    vendas: {
        ate29: 10,
        ate49: 15,
        mais50: 20
    }
};

// ============================================
// ARMAZENAMENTO
// ============================================

function salvarDados(dados) {
    localStorage.setItem('golsDeOuro', JSON.stringify(dados));
}

function carregarDados() {
    const dados = localStorage.getItem('golsDeOuro');
    return dados ? JSON.parse(dados) : { registros: [], semanas: [] };
}

function obterSemanaAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const primeiroDia = new Date(ano, 0, 1);
    const diasPassados = Math.floor((hoje - primeiroDia) / (24 * 60 * 60 * 1000));
    const numeroSemana = Math.ceil((diasPassados + primeiroDia.getDay() + 1) / 7);
    return `${ano}-W${String(numeroSemana).padStart(2, '0')}`;
}

function formatarSemana(semana) {
    if (!semana) return '';
    const [ano, w] = semana.split('-W');
    const numSemana = parseInt(w);
    const primeiroDia = new Date(ano, 0, 1 + (numSemana - 1) * 7);
    const ultimoDia = new Date(primeiroDia);
    ultimoDia.setDate(ultimoDia.getDate() + 6);
    const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    return `Semana ${numSemana} · ${fmt(primeiroDia)} a ${fmt(ultimoDia)}/${ano}`;
}

// ============================================
// CÁLCULO DE PONTOS
// ============================================

function calcularPontos(registro) {
    let pontos = 0;
    const perfil = registro.perfil;

    if (perfil === 'closer' || perfil === 'novato') {
        pontos += (registro.reunioesOnline || 0) * PONTUACAO[perfil].reuniaoOnline;
        pontos += (registro.reunioesPresenciais || 0) * PONTUACAO[perfil].reuniaoPresencial;
        pontos += (registro.reunioesOnlineProsp || 0) * PONTUACAO[perfil].reuniaoOnline * PONTUACAO[perfil].prospeccaoMultiplicador;
        pontos += (registro.reunioesPresenciaisProsp || 0) * PONTUACAO[perfil].reuniaoPresencial * PONTUACAO[perfil].prospeccaoMultiplicador;

        if (registro.crmAtualizado) pontos += PONTUACAO[perfil].crmAtualizado;

        if (perfil === 'closer') {
            pontos += (registro.posVendas || 0) * PONTUACAO.closer.posVenda;
            pontos += (registro.indicacoes || 0) * PONTUACAO.closer.indicacao;
            pontos += (registro.posVendasProsp || 0) * PONTUACAO.closer.posVenda * PONTUACAO.closer.prospeccaoMultiplicador;
            pontos += (registro.indicacoesProsp || 0) * PONTUACAO.closer.indicacao * PONTUACAO.closer.prospeccaoMultiplicador;
        }

        if (perfil === 'novato') {
            pontos += (registro.contatos || 0) * PONTUACAO.novato.contato;
            pontos += (registro.propostas || 0) * PONTUACAO.novato.proposta;
            pontos += (registro.contatosProsp || 0) * PONTUACAO.novato.contato * PONTUACAO.novato.prospeccaoMultiplicador;
            pontos += (registro.propostasProsp || 0) * PONTUACAO.novato.proposta * PONTUACAO.novato.prospeccaoMultiplicador;
        }

        pontos += (registro.vendas29 || 0) * PONTUACAO.vendas.ate29;
        pontos += (registro.vendas30 || 0) * PONTUACAO.vendas.ate49;
        pontos += (registro.vendas50 || 0) * PONTUACAO.vendas.mais50;

    } else if (perfil === 'sdr') {
        pontos += (registro.reunioesAgendadas || 0) * PONTUACAO.sdr.reuniaoAgendada;
        pontos += (registro.reunioesRealizadas || 0) * PONTUACAO.sdr.reuniaoRealizada;
        pontos += (registro.leadsVenda || 0) * PONTUACAO.sdr.leadVenda;

    } else if (perfil === 'backoffice') {
        pontos += (registro.reunioesCarteira || 0) * PONTUACAO.backoffice.reuniaoCarteira;
        pontos += (registro.propostasSubidas || 0) * PONTUACAO.backoffice.propostaSubida;
        pontos += Math.floor((registro.vidasPropostas || 0) / PONTUACAO.backoffice.vidasPonto);
        pontos += (registro.propostasVenda || 0) * PONTUACAO.backoffice.propostaVenda;

    } else if (perfil === 'gerente') {
        if (registro.timeVenceu)     pontos += PONTUACAO.gerente.timeVenceu;
        if (registro.metaReunioes)   pontos += PONTUACAO.gerente.metaReunioes;
        if (registro.crmOrganizado)  pontos += PONTUACAO.gerente.crmOrganizado;
        if (registro.melhorVendedor) pontos += PONTUACAO.gerente.melhorVendedor;
    }

    return pontos;
}

// ============================================
// PREVIEW DE PONTOS (formulário)
// ============================================

function calcularPontosPreview() {
    const nome = document.getElementById('nome');
    if (!nome || !nome.value) return;
    const option = nome.options[nome.selectedIndex];
    const perfil = option.dataset.perfil;

    const reg = {
        perfil,
        reunioesOnline:         parseInt(document.getElementById('reunioesOnline')?.value || 0),
        reunioesPresenciais:    parseInt(document.getElementById('reunioesPresenciais')?.value || 0),
        reunioesOnlineProsp:    parseInt(document.getElementById('reunioesOnlineProsp')?.value || 0),
        reunioesPresenciaisProsp: parseInt(document.getElementById('reunioesPresenciaisProsp')?.value || 0),
        crmAtualizado:          document.getElementById('crmAtualizado')?.checked || false,
        vendas29: parseInt(document.getElementById('vendas29')?.value || 0),
        vendas30: parseInt(document.getElementById('vendas30')?.value || 0),
        vendas50: parseInt(document.getElementById('vendas50')?.value || 0)
    };

    if (perfil === 'closer') {
        reg.posVendas      = parseInt(document.getElementById('posVendas')?.value || 0);
        reg.indicacoes     = parseInt(document.getElementById('indicacoes')?.value || 0);
        reg.posVendasProsp = parseInt(document.getElementById('posVendasProsp')?.value || 0);
        reg.indicacoesProsp= parseInt(document.getElementById('indicacoesProsp')?.value || 0);
    } else if (perfil === 'novato') {
        reg.contatos      = parseInt(document.getElementById('contatos')?.value || 0);
        reg.propostas     = parseInt(document.getElementById('propostas')?.value || 0);
        reg.contatosProsp = parseInt(document.getElementById('contatosProsp')?.value || 0);
        reg.propostasProsp= parseInt(document.getElementById('propostasProsp')?.value || 0);
    } else if (perfil === 'sdr') {
        reg.reunioesAgendadas  = parseInt(document.getElementById('reunioesAgendadas')?.value || 0);
        reg.reunioesRealizadas = parseInt(document.getElementById('reunioesRealizadas')?.value || 0);
        reg.leadsVenda         = parseInt(document.getElementById('leadsVenda')?.value || 0);
    } else if (perfil === 'backoffice') {
        reg.reunioesCarteira  = parseInt(document.getElementById('reunioesCarteira')?.value || 0);
        reg.propostasSubidas  = parseInt(document.getElementById('propostasSubidas')?.value || 0);
        reg.vidasPropostas    = parseInt(document.getElementById('vidasPropostas')?.value || 0);
        reg.propostasVenda    = parseInt(document.getElementById('propostasVenda')?.value || 0);
    } else if (perfil === 'gerente') {
        reg.timeVenceu    = document.getElementById('timeVenceu')?.checked || false;
        reg.metaReunioes  = document.getElementById('metaReunioes')?.checked || false;
        reg.crmOrganizado = document.getElementById('crmOrganizado')?.checked || false;
        reg.melhorVendedor= document.getElementById('melhorVendedor')?.checked || false;
    }

    const total = calcularPontos(reg);
    const el = document.getElementById('pontosCalculados');
    if (el) el.textContent = `${total} pontos`;
}

// ============================================
// SALVAR REGISTRO
// ============================================

function salvarRegistro() {
    const nomeEl = document.getElementById('nome');
    if (!nomeEl || !nomeEl.value) {
        mostrarMensagem('Selecione seu nome!', 'error');
        return;
    }

    const option   = nomeEl.options[nomeEl.selectedIndex];
    const nome     = nomeEl.value;
    const perfil   = option.dataset.perfil;
    const time     = option.dataset.time;
    const semana   = document.getElementById('semana').value || obterSemanaAtual();

    const registro = {
        nome, perfil, time, semana,
        timestamp: new Date().toISOString(),
        reunioesOnline:           parseInt(document.getElementById('reunioesOnline')?.value || 0),
        reunioesPresenciais:      parseInt(document.getElementById('reunioesPresenciais')?.value || 0),
        reunioesOnlineProsp:      parseInt(document.getElementById('reunioesOnlineProsp')?.value || 0),
        reunioesPresenciaisProsp: parseInt(document.getElementById('reunioesPresenciaisProsp')?.value || 0),
        crmAtualizado:            document.getElementById('crmAtualizado')?.checked || false,
        vendas29: parseInt(document.getElementById('vendas29')?.value || 0),
        vendas30: parseInt(document.getElementById('vendas30')?.value || 0),
        vendas50: parseInt(document.getElementById('vendas50')?.value || 0)
    };

    if (perfil === 'closer') {
        registro.posVendas      = parseInt(document.getElementById('posVendas')?.value || 0);
        registro.indicacoes     = parseInt(document.getElementById('indicacoes')?.value || 0);
        registro.posVendasProsp = parseInt(document.getElementById('posVendasProsp')?.value || 0);
        registro.indicacoesProsp= parseInt(document.getElementById('indicacoesProsp')?.value || 0);
    } else if (perfil === 'novato') {
        registro.contatos      = parseInt(document.getElementById('contatos')?.value || 0);
        registro.propostas     = parseInt(document.getElementById('propostas')?.value || 0);
        registro.contatosProsp = parseInt(document.getElementById('contatosProsp')?.value || 0);
        registro.propostasProsp= parseInt(document.getElementById('propostasProsp')?.value || 0);
    } else if (perfil === 'sdr') {
        registro.reunioesAgendadas  = parseInt(document.getElementById('reunioesAgendadas')?.value || 0);
        registro.reunioesRealizadas = parseInt(document.getElementById('reunioesRealizadas')?.value || 0);
        registro.leadsVenda         = parseInt(document.getElementById('leadsVenda')?.value || 0);
    } else if (perfil === 'backoffice') {
        registro.reunioesCarteira = parseInt(document.getElementById('reunioesCarteira')?.value || 0);
        registro.propostasSubidas = parseInt(document.getElementById('propostasSubidas')?.value || 0);
        registro.vidasPropostas   = parseInt(document.getElementById('vidasPropostas')?.value || 0);
        registro.propostasVenda   = parseInt(document.getElementById('propostasVenda')?.value || 0);
    } else if (perfil === 'gerente') {
        registro.timeVenceu    = document.getElementById('timeVenceu')?.checked || false;
        registro.metaReunioes  = document.getElementById('metaReunioes')?.checked || false;
        registro.crmOrganizado = document.getElementById('crmOrganizado')?.checked || false;
        registro.melhorVendedor= document.getElementById('melhorVendedor')?.checked || false;
    }

    registro.pontos = calcularPontos(registro);

    const dados = carregarDados();
    const existente = dados.registros.findIndex(r => r.nome === nome && r.semana === semana);

    if (existente >= 0) {
        if (confirm(`Você já tem um registro para esta semana (${registro.pontos} pontos). Deseja atualizar?`)) {
            dados.registros[existente] = registro;
        } else return;
    } else {
        dados.registros.push(registro);
    }

    if (!dados.semanas.includes(semana)) dados.semanas.push(semana);
    dados.semanas.sort().reverse();

    salvarDados(dados);
    mostrarMensagem(`✅ Registro salvo! ${registro.pontos} pontos computados, ${nome}!`, 'success');

    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
}

function mostrarMensagem(texto, tipo = 'success') {
    let el = document.getElementById('mensagem');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mensagem';
        const form = document.getElementById('registroForm');
        if (form) form.prepend(el);
    }
    el.className = tipo === 'error' ? 'error-message' : 'success-message';
    el.textContent = texto;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============================================
// DASHBOARD
// ============================================

function inicializarSistema() {
    const selector = document.getElementById('weekSelector');
    if (!selector) return;

    const dados = carregarDados();
    const semanaAtual = obterSemanaAtual();

    const todasSemanas = [...new Set([semanaAtual, ...dados.semanas])].sort().reverse();

    selector.innerHTML = '';
    todasSemanas.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = formatarSemana(s);
        selector.appendChild(opt);
    });

    selector.value = semanaAtual;
}

function carregarSemana() {
    atualizarDashboard();
}

function atualizarDashboard() {
    const selector = document.getElementById('weekSelector');
    if (!selector) return;

    const semana = selector.value;
    const dados = carregarDados();
    const registros = dados.registros.filter(r => r.semana === semana);

    if (registros.length === 0) {
        limparDashboard();
        return;
    }

    // Pontos por time
    const pontosThais = registros
        .filter(r => r.time === 'thais')
        .reduce((s, r) => s + (r.pontos || 0), 0);
    const pontosLuiza = registros
        .filter(r => r.time === 'luiza')
        .reduce((s, r) => s + (r.pontos || 0), 0);

    document.getElementById('pointsThais').textContent = pontosThais;
    document.getElementById('pointsLuiza').textContent = pontosLuiza;

    // Lider badge
    const thaisCard = document.querySelector('.team-thais');
    const luizaCard = document.querySelector('.team-luiza');
    thaisCard.querySelector('.team-lider-badge')?.remove();
    luizaCard.querySelector('.team-lider-badge')?.remove();

    if (pontosThais > pontosLuiza && pontosThais > 0) {
        const b = document.createElement('div');
        b.className = 'team-lider-badge';
        b.textContent = '⚽ Líder';
        thaisCard.prepend(b);
    } else if (pontosLuiza > pontosThais && pontosLuiza > 0) {
        const b = document.createElement('div');
        b.className = 'team-lider-badge';
        b.textContent = '⚽ Líder';
        luizaCard.prepend(b);
    }

    // Pódio
    const ranking = [...registros].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));

    const podio = [
        { idNome: 'first',  idPts: 'firstPoints',  idTime: 'firstTeam' },
        { idNome: 'second', idPts: 'secondPoints', idTime: 'secondTeam' },
        { idNome: 'third',  idPts: 'thirdPoints',  idTime: 'thirdTeam' }
    ];

    podio.forEach((p, i) => {
        const nEl = document.getElementById(p.idNome);
        const ptEl = document.getElementById(p.idPts);
        const tmEl = document.getElementById(p.idTime);
        if (ranking[i]) {
            if (nEl) nEl.textContent = ranking[i].nome;
            if (ptEl) ptEl.textContent = `${ranking[i].pontos} pts`;
            if (tmEl) {
                tmEl.textContent = TIMES[ranking[i].time]?.nome || '';
                tmEl.className = `podium-team-badge`;
            }
        } else {
            if (nEl) nEl.textContent = '-';
            if (ptEl) ptEl.textContent = '0 pts';
            if (tmEl) tmEl.textContent = '';
        }
    });

    calcularDestaques(registros);
    atualizarRanking(registros);
    atualizarEstatisticas(registros);
}

function calcularDestaques(registros) {
    // Artilheiro
    let artilheiro = null, maxVendas = 0;
    registros.forEach(r => {
        const v = (r.vendas29 || 0) + (r.vendas30 || 0) + (r.vendas50 || 0);
        if (v > maxVendas) { maxVendas = v; artilheiro = r.nome; }
    });
    document.getElementById('artilheiro').textContent = artilheiro || '-';
    document.getElementById('artilheiroValue').textContent = `${maxVendas} vendas`;

    // Assistente (reuniões)
    let assistente = null, maxReunioes = 0;
    registros.forEach(r => {
        const m = (r.reunioesOnline || 0) + (r.reunioesPresenciais || 0)
                + (r.reunioesOnlineProsp || 0) + (r.reunioesPresenciaisProsp || 0)
                + (r.reunioesAgendadas || 0) + (r.reunioesRealizadas || 0);
        if (m > maxReunioes) { maxReunioes = m; assistente = r.nome; }
    });
    document.getElementById('assistente').textContent = assistente || '-';
    document.getElementById('assistenteValue').textContent = `${maxReunioes} reuniões`;

    // CRM Perfeito
    const crm = registros.filter(r => r.crmAtualizado);
    document.getElementById('crmPerfeito').textContent = crm.length > 0 ? crm.map(r => r.nome).join(', ') : '-';
    document.getElementById('crmPerfeitoValue').textContent = crm.length > 0 ? '100%' : '-';

    // Gerente destaque
    const gerentes = registros.filter(r => r.perfil === 'gerente').sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    document.getElementById('gerenteDestaque').textContent = gerentes.length > 0 ? gerentes[0].nome : '-';
    document.getElementById('gerenteValue').textContent = gerentes.length > 0 ? `${gerentes[0].pontos} pts` : '0 pts';
}

function atualizarRanking(registros, filtro = 'todos') {
    const tbody = document.getElementById('rankingBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let lista = [...registros].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    if (filtro === 'thais') lista = lista.filter(r => r.time === 'thais');
    if (filtro === 'luiza') lista = lista.filter(r => r.time === 'luiza');

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">
            <div class="empty-state"><span>📋</span>Nenhum registro para esta semana ainda</div>
        </td></tr>`;
        return;
    }

    lista.forEach((r, idx) => {
        const tr = document.createElement('tr');
        if (idx === 0) tr.className = 'pos-1';
        else if (idx === 1) tr.className = 'pos-2';
        else if (idx === 2) tr.className = 'pos-3';

        const totalReunioes = (r.reunioesOnline || 0) + (r.reunioesPresenciais || 0)
                            + (r.reunioesOnlineProsp || 0) + (r.reunioesPresenciaisProsp || 0)
                            + (r.reunioesAgendadas || 0) + (r.reunioesRealizadas || 0);
        const totalVendas = (r.vendas29 || 0) + (r.vendas30 || 0) + (r.vendas50 || 0);
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}º`;
        const crm = r.crmAtualizado ? '✅' : '—';

        tr.innerHTML = `
            <td><strong>${medal}</strong></td>
            <td><strong>${r.nome}</strong></td>
            <td>${traduzirPerfil(r.perfil)}</td>
            <td><span class="badge badge-${r.time}">${TIMES[r.time]?.nome || r.time}</span></td>
            <td>${totalReunioes}</td>
            <td>${totalVendas}</td>
            <td>${crm}</td>
            <td class="points-col">${r.pontos || 0}</td>`;
        tbody.appendChild(tr);
    });
}

function traduzirPerfil(perfil) {
    return { closer: 'Closer', novato: 'Consultor', sdr: 'SDR', backoffice: 'Backoffice', gerente: 'Gerente' }[perfil] || perfil;
}

function atualizarEstatisticas(registros) {
    const totalReunioes = registros.reduce((s, r) =>
        s + (r.reunioesOnline || 0) + (r.reunioesPresenciais || 0)
          + (r.reunioesOnlineProsp || 0) + (r.reunioesPresenciaisProsp || 0)
          + (r.reunioesAgendadas || 0) + (r.reunioesRealizadas || 0), 0);

    const totalVendas = registros.reduce((s, r) =>
        s + (r.vendas29 || 0) + (r.vendas30 || 0) + (r.vendas50 || 0), 0);

    const totalVidas = registros.reduce((s, r) =>
        s + ((r.vendas29 || 0) * 15) + ((r.vendas30 || 0) * 40) + ((r.vendas50 || 0) * 60), 0);

    const totalProspeccao = registros.reduce((s, r) =>
        s + (r.reunioesOnlineProsp || 0) + (r.reunioesPresenciaisProsp || 0)
          + (r.contatosProsp || 0) + (r.propostasProsp || 0), 0);

    document.getElementById('totalReunioes').textContent = totalReunioes;
    document.getElementById('totalVendas').textContent   = totalVendas;
    document.getElementById('totalVidas').textContent    = totalVidas;
    document.getElementById('totalProspeccao').textContent = totalProspeccao;
}

function filtrarRanking(filtro, el) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');

    const selector = document.getElementById('weekSelector');
    const semana   = selector ? selector.value : obterSemanaAtual();
    const dados    = carregarDados();
    const registros = dados.registros.filter(r => r.semana === semana);
    atualizarRanking(registros, filtro);
}

function limparDashboard() {
    document.getElementById('pointsThais').textContent = '0';
    document.getElementById('pointsLuiza').textContent = '0';
    ['first','second','third'].forEach(p => {
        document.getElementById(p).textContent = '-';
        document.getElementById(p + 'Points').textContent = '0 pts';
        const tmEl = document.getElementById(p + 'Team');
        if (tmEl) tmEl.textContent = '';
    });
    ['totalReunioes','totalVendas','totalVidas','totalProspeccao'].forEach(id => {
        document.getElementById(id).textContent = '0';
    });
    document.getElementById('rankingBody').innerHTML = `
        <tr><td colspan="8">
            <div class="empty-state"><span>📋</span>Nenhum registro para esta semana ainda</div>
        </td></tr>`;
}

function exportarDados() {
    const dados  = carregarDados();
    const blob   = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement('a');
    link.href    = url;
    link.download = `gols-de-ouro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function limparDados() {
    if (confirm('⚠️ Isso vai apagar TODOS os dados e começar nova rodada.\n\nTem certeza?')) {
        if (confirm('🚨 ÚLTIMA CONFIRMAÇÃO — esta ação não pode ser desfeita!')) {
            localStorage.removeItem('golsDeOuro');
            alert('✅ Dados limpos! Nova rodada iniciada.');
            location.reload();
        }
    }
}

// ============================================
// SCROLL REVEAL
// ============================================
function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), i * 60);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
document.addEventListener('DOMContentLoaded', initReveal);
