let funcionarios = [];

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Disparador de leitura automática ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    carregarCargosBanco();
    carregarDadosBanco();
});

async function carregarCargosBanco() {
    const resposta = await fetch('/api/cargos');
    const cargos = await resposta.json();
    const selectCargo = document.getElementById('cargo');
    if (selectCargo) {
        selectCargo.innerHTML = '';
        cargos.forEach(c => {
            const nomeCargo = Array.isArray(c) ? c : c;
            const opt = document.createElement('option');
            opt.value = nomeCargo;
            opt.innerText = nomeCargo;
            selectCargo.appendChild(opt);
        });
    }
}

async function carregarDadosBanco() {
    const resposta = await fetch('/api/funcionarios');
    funcionarios = await resposta.json();
    renderizarTabela();
    atualizarDashboard();
}

async function adicionarCargoNovo() {
    const inputCargo = document.getElementById('novo_cargo_input');
    const nomeCargo = inputCargo.value.trim();
    if (!nomeCargo) { alert('Digite o nome do novo cargo.'); return; }

    await fetch('/api/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_cargo: nomeCargo })
    });

    inputCargo.value = '';
    await carregarCargosBanco();
    alert('Cargo "' + nomeCargo + '" inserido com sucesso!');
}

async function adicionarFuncionario() {
    const nome = document.getElementById('nome').value.trim();
    const cargo = document.getElementById('cargo').value;
    const salario = parseFloat(document.getElementById('salario').value) || 0;
    const horasComp = parseFloat(document.getElementById('horas_comp').value) || 220;
    const insalubridade = parseFloat(document.getElementById('insalubridade').value) || 0;
    const beneficios = parseFloat(document.getElementById('beneficios').value) || 0;
    const qtdFilhos = parseInt(document.getElementById('qtd_filhos').value) || 0;
    const observacoes = document.getElementById('observacoes').value.trim();
    const dataAdmissao = document.getElementById('data_admissao').value;
    const regimeHe = document.getElementById('regime_he').value;
    const turno = document.getElementById('turno').value;
    const horaEntrada = document.getElementById('hora_entrada').value;
    const departamento = document.getElementById('departamento') ? document.getElementById('departamento').value : 'Administrativo';
    
    const heSemana = parseFloat(document.getElementById('he_semana').value) || 0;
    const heSabado = parseFloat(document.getElementById('he_sabado').value) || 0;
    const heDomingo = parseFloat(document.getElementById('he_domingo').value) || 0;
    const planoSaude = parseFloat(document.getElementById('plano_saude').value) || 0;
    const planoOdonto = parseFloat(document.getElementById('plano_odonto').value) || 0;
    const valeFarmacia = parseFloat(document.getElementById('vale_farmacia').value) || 0;
    const sindicato = parseFloat(document.getElementById('sindicato').value) || 0;
    const adiantamento = document.getElementById('adiantamento').value;
    const vt = document.getElementById('vt_desconto').value;
    const mesRef = document.getElementById('mes_referencia').value;

    if (!nome) { alert('Insira o nome do profissional.'); return; }

    await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: '', nome, cargo, salario, horasComp, insalubridade, beneficios, heSemana, heSabado, heDomingo,
            planoSaude, planoOdonto, valeFarmacia, sindicato, adiantamento, vt, qtdFilhos, mesRef, regimeHe, turno, horaEntrada, departamento
        })
    });

    document.getElementById('nome').value = '';
    document.getElementById('observacoes').value = '';
    carregarDadosBanco();
}

async function deletarFuncionario(id) {
    await fetch('/api/funcionarios/' + id, { method: 'DELETE' });
    carregarDadosBanco();
}

function limparCamposTela() {
    document.getElementById('func_id_edicao').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('salario').value = '3500';
    document.getElementById('horas_comp').value = '220';
    document.getElementById('regime_he').value = 'pagar';
    document.getElementById('insalubridade').value = '0';
    document.getElementById('beneficios').value = '500';
    document.getElementById('qtd_filhos').value = '0';
    document.getElementById('observacoes').value = '';
    document.getElementById('he_semana').value = '0';
    document.getElementById('he_sabado').value = '0';
    document.getElementById('he_domingo').value = '0';
    document.getElementById('turno').value = 'diurno';
    document.getElementById('hora_entrada').value = '08:00';
    document.getElementById('adiantamento').value = 'nao';
    document.getElementById('vt_desconto').value = 'nao';
    document.getElementById('novo_aumento_salarial').value = '0';
    const btn = document.getElementById('btn_principal_folha');
    if (btn) btn.innerText = 'Contratar Profissional';
}


function carregarFuncionarioParaEdicao(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    document.getElementById('func_id_edicao').value = f.id;
    document.getElementById('nome').value = f.nome;
    document.getElementById('cargo').value = f.cargo;
    document.getElementById('salario').value = f.salario;
    document.getElementById('horas_comp').value = f.horas_comp;
    document.getElementById('regime_he').value = f.regime_he || 'pagar';
    document.getElementById('insalubridade').value = f.insalubridade;
    document.getElementById('beneficios').value = f.beneficios;
    document.getElementById('qtd_filhos').value = f.qtd_filhos;
    document.getElementById('observacoes').value = f.observacoes;
    document.getElementById('data_admissao').value = f.data_admissao;
    document.getElementById('turno').value = f.turno || 'diurno';
    document.getElementById('hora_entrada').value = f.hora_entrada || '08:00';
    if(document.getElementById('departamento')) document.getElementById('departamento').value = f.departamento || 'Administrativo';
    
    const btn = document.getElementById('btn_principal_folha');
    if (btn) btn.innerText = 'Modo Edição Ativo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function salvarAlteraçõesFuncionario() {
    const id = document.getElementById('func_id_edicao').value;
    if (!id) { alert('Selecione um funcionário primeiro.'); return; }
    const valorPromocao = parseFloat(document.getElementById('novo_aumento_salarial').value) || 0;
    
    const nome = document.getElementById('nome').value.trim();
    const cargo = document.getElementById('cargo').value;
    const salario = valorPromocao > 0 ? valorPromocao : parseFloat(document.getElementById('salario').value) || 0;
    const horasComp = parseFloat(document.getElementById('horas_comp').value) || 220;
    const insalubridade = parseFloat(document.getElementById('insalubridade').value) || 0;
    const beneficios = parseFloat(document.getElementById('beneficios').value) || 0;
    const qtdFilhos = parseInt(document.getElementById('qtd_filhos').value) || 0;
    const observacoes = document.getElementById('observacoes').value.trim();
    const dataAdmissao = document.getElementById('data_admissao').value;
    const regimeHe = document.getElementById('regime_he').value;
    const turno = document.getElementById('turno').value;
    const horaEntrada = document.getElementById('hora_entrada').value;
    const departamento = document.getElementById('departamento') ? document.getElementById('departamento').value : 'Administrativo';

    await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: id, nome, cargo, salario, horasComp, insalubridade, beneficios, heSemana:0, heSabado:0, heDomingo:0,
            planoSaude:0, planoOdonto:0, valeFarmacia:0, sindicato:0, adiantamento:'nao', vt:'nao', qtdFilhos, mesRef:'Julho', regimeHe, turno, horaEntrada, departamento
        })
    });
    
    alert('Dados salvos com sucesso!');
    limparCamposTela();
    carregarDadosBanco();
}

function atualizarDashboard() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    let totalBruto = 0; let totalDescontos = 0; let totalLiquido = 0;
    
    funcionarios.forEach(f => {
        totalBruto += f.salario + (f.total_he_ganho || 0) + (f.insalubridade || 0) + (f.reflexo_13_ferias || 0);
        totalDescontos += (f.total_descontos || 0);
        totalLiquido += (f.liquido || 0);
    });

    let custoTotal = funcionarios.reduce((acc, f) => acc + f.salario + (f.beneficios || 0) + (f.total_he_ganho || 0), 0);
    let saldoFinal = receita - custoTotal;

    document.getElementById('dash_total_func').innerText = funcionarios.length + ' / ' + document.getElementById('limite_func').value;
    document.getElementById('dash_custo_bruto').innerText = formatarMoeda(totalBruto);
    document.getElementById('dash_total_descontos').innerText = formatarMoeda(totalDescontos);
    document.getElementById('dash_folha_liquida').innerText = formatarMoeda(totalLiquido);
    document.getElementById('dash_saldo_empresa').innerText = formatarMoeda(saldoFinal);
    document.getElementById('card_balanco').className = saldoFinal < 0 ? 'metric negative' : 'metric';
    
    // CORREÇÃO VISUAL: Nome da função unificado com a letra "i" regulamentar
    renderizarGraficosNativos(totalLiquido, totalDescontos);
}

function renderizarGraficosNativos(liquido, descontos) {
    const total = liquido + descontos;
    const pizza = document.getElementById('nativePizza');
    if (pizza) {
        const perc = total > 0 ? ((descontos / total) * 100).toFixed(1) : 0;
        pizza.style.background = "conic-gradient(#dc2626 0% " + perc + "%, #16a34a " + perc + "% 100%)";
    }
    const custosCargo = {};
    funcionarios.forEach(f => custosCargo[f.cargo] = (custosCargo[f.cargo] || 0) + f.salario);
    const cargos = Object.keys(custosCargo).sort((a,b) => custosCargo[b] - custosCargo[a]);
    const maxCusto = cargos.length > 0 ? custosCargo[cargos] : 1;
    const containerPareto = document.getElementById('nativePareto');
    if (containerPareto) {
        containerPareto.innerHTML = '';
        cargos.slice(0, 4).forEach(c => {
            const pct = (custosCargo[c] / maxCusto) * 100;
            containerPareto.innerHTML += '<div class="bar-wrapper"><div class="bar-native" style="height: ' + pct + '%">' + pct.toFixed(0) + '%</div><div class="bar-label">' + c + '</div></div>';
        });
    }
    const containerLinear = document.getElementById('nativeLinear');
    if (containerLinear) {
        containerLinear.innerHTML = '';
        const maxBruto = funcionarios.length > 0 ? Math.max(...funcionarios.map(f => f.salario)) : 1;
        funcionarios.slice(-4).forEach(f => {
            const pct = (f.salario / maxBruto) * 100;
            containerLinear.innerHTML += '<div class="linear-row"><div class="linear-name">' + f.nome + '</div><div class="linear-bar-bg"><div class="linear-bar-fill" style="width: ' + pct + '%"></div></div><div class="linear-value" style="color:#1e3a8a">' + formatarMoeda(f.salario) + '</div></div>';
        });
    }
}

function renderizarTabela() {
    const corpo = document.getElementById('tabela_corpo');
    corpo.innerHTML = '';
    funcionarios.forEach(f => {
        const dados = encodeURIComponent(JSON.stringify(f));
        const dataFormatada = f.data_admissao ? f.data_admissao.split('-').reverse().join('/') : '---';
        const turnoRotulo = f.turno === 'noturno' ? '🌙 Noturno' : '☀️ Diurno';
        const jTexto = f.banco_horas > 0 ? f.horas_comp + 'h (+' + f.banco_horas + 'h BH)' : f.horas_comp + 'h';
        const deptoRotulo = f.departamento ? f.departamento : 'Administrativo';
        
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><a onclick="carregarFuncionarioParaEdicao(\'' + dados + '\')" style="cursor:pointer; color:var(--primary); text-decoration:underline;"><strong>' + f.nome + '</strong></a><br><small>Admissão: " + dataFormatada + "</small></td><td>' + f.cargo + '<br><small style="color:#64748b">Dep: ' + deptoRotulo + '</small></td><td><small>Jornada: ' + jTexto + '</small><br><strong>' + turnoRotulo + '</strong></td><td style="color:#16a34a"><strong>' + formatarMoeda(f.liquido) + '</strong></td><td class="actions-cell"><a onclick="abrirContracheque(\'' + dados + '\')" class="btn-link">📄 Vencimento</a><button class="btn-delete" onclick="deletarFuncionario(' + f.id + ')">Demitir</button></td>';
        corpo.appendChild(tr);
    });
}

function imprimirBalanco() { window.print(); }
function abrirDecimoTerceiroGeral() { alert("Folha de gratificação calculada!"); }
function abrirContracheque() { alert("Recibo de Vencimento disponível!"); }
function abrirFerias() { alert("Recibo de Férias disponível!"); }
function selecionarTipoRescisao() { alert("Módulo de Rescisão seletiva ativo!"); }


