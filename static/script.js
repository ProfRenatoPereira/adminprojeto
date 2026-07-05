let funcionarios = [];

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Vinculação de escopo blindada via seletores de eventos puros (Sem onclick no HTML)
window.addEventListener('DOMContentLoaded', () => {
    carregarCargosBanco();
    carregarDadosBanco();
    
    document.getElementById('btn_add_cargo')?.addEventListener('click', adicionarCargoNovo);
    document.getElementById('btn_contratar')?.addEventListener('click', adicionarFuncionario);
    document.getElementById('btn_salvar')?.addEventListener('click', salvarAlteracoesFuncionario);
    document.getElementById('btn_limpar')?.addEventListener('click', limparCamposTela);
    document.getElementById('btn_balanco')?.addEventListener('click', imprimirBalanco);
    document.getElementById('btn_13')?.addEventListener('click', abrirDecimoTerceiroGeral);
    document.getElementById('btn_print_list')?.addEventListener('click', () => window.print());
    document.getElementById('receita_empresa')?.addEventListener('change', actualizarDashboard);
    document.getElementById('limite_func')?.addEventListener('change', actualizarDashboard);
});

async function carregarCargosBanco() {
    const resposta = await fetch('/api/cargos');
    const cargos = await resposta.json();
    const selectCargo = document.getElementById('cargo');
    if (selectCargo) {
        selectCargo.innerHTML = '';
        cargos.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.innerText = c;
            selectCargo.appendChild(opt);
        });
    }
}

async function carregarDadosBanco() {
    const resposta = await fetch('/api/funcionarios');
    funcionarios = await resposta.json();
    renderizarTabela();
    actualizarDashboard();
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
    const departamento = document.getElementById('departamento').value;
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
    limparCamposTela();
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
    const btn = document.getElementById('btn_contratar');
    if (btn) btn.innerText = 'Contratar Profissional';
}

function carregarFuncionarioParaEdicao(id, nome, cargo, salario, horas, regime, insal, benef, filhos, obs, data, turno, entrada, depto) {
    document.getElementById('func_id_edicao').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('cargo').value = cargo;
    document.getElementById('salario').value = salario;
    document.getElementById('horas_comp').value = horas;
    document.getElementById('regime_he').value = regime;
    document.getElementById('insalubridade').value = insal;
    document.getElementById('beneficios').value = benef;
    document.getElementById('qtd_filhos').value = filhos;
    document.getElementById('observacoes').value = obs;
    document.getElementById('data_admissao').value = data;
    document.getElementById('turno').value = turno;
    document.getElementById('hora_entrada').value = entrada;
    document.getElementById('departamento').value = depto;
    const btn = document.getElementById('btn_contratar');
    if (btn) btn.innerText = 'Modo Edição Ativo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function salvarAlteracoesFuncionario() {
    const id = document.getElementById('func_id_edicao').value;
    if (!id) { alert('Selecione um funcionário clicando no nome dele primeiro.'); return; }
    const valorPromocao = parseFloat(document.getElementById('novo_aumento_salarial').value) || 0;
    if (valorPromocao > 0) { document.getElementById('salario').value = valorPromocao; }
    
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
    const departamento = document.getElementById('departamento').value;
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

    await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id, nome, cargo, salario, horasComp, insalubridade, beneficios, heSemana, heSabado, heDomingo,
            planoSaude, planoOdonto, valeFarmacia, sindicato, adiantamento, vt, qtdFilhos, mesRef, regimeHe, turno, horaEntrada, departamento
        })
    });
    limparCamposTela();
    carregarDadosBanco();
}

function actualizarDashboard() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    let totalBruto = 0, totalDescontos = 0, totalLiquido = 0;
    funcionarios.forEach(f => {
        totalBruto += f.salario + (f.total_he_ganho || 0) + (f.insalubridade || 0) + (f.reflexo_13_ferias || 0) + (f.adicional_noturno || 0);
        totalDescontos += (f.total_descontos || 0);
        totalLiquido += (f.liquido || 0);
    });
    let custoTotal = funcionarios.reduce((acc, f) => acc + f.salario + (f.beneficios || 0) + (f.total_he_ganho || 0) + (f.adicional_noturno || 0), 0);
    let saldoFinal = receita - custoTotal;
    document.getElementById('dash_total_func').innerText = funcionarios.length + ' / ' + document.getElementById('limite_func').value;
    document.getElementById('dash_custo_bruto').innerText = formatarMoeda(totalBruto);
    document.getElementById('dash_total_descontos').innerText = formatarMoeda(totalDescontos);
    document.getElementById('dash_folha_liquida').innerText = formatarMoeda(totalLiquido);
    document.getElementById('dash_saldo_empresa').innerText = formatarMoeda(saldoFinal);
    document.getElementById('card_balanco').className = saldoFinal < 0 ? 'metric negative' : 'metric';
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
        const dataFormatada = f.data_admissao ? f.data_admissao.split('-').reverse().join('/') : '---';
        const turnoRotulo = f.turno === 'noturno' ? '🌙 Noturno' : '☀️ Diurno';
        const jTexto = f.banco_horas > 0 ? f.horas_comp + 'h (+' + f.banco_horas + 'h BH)' : f.horas_comp + 'h';
        const deptoRotulo = f.departamento ? f.departamento : 'Administrativo';
        
        const args = [
            f.id, JSON.stringify(f.nome), JSON.stringify(f.cargo), f.salario, f.horas_comp, 
            JSON.stringify(f.regime_he), f.insalubridade, f.beneficios, f.qtd_filhos, 
            JSON.stringify(f.observacoes), JSON.stringify(f.data_admissao), JSON.stringify(f.turno), 
            JSON.stringify(f.hora_entrada), JSON.stringify(deptoRotulo)
        ].join(',');

        const tr = document.createElement('tr');
        tr.innerHTML = '<td><a onclick="carregarFuncionarioParaEdicao(' + args + ')" style="cursor:pointer; color:var(--primary); text-decoration:underline;"><strong>' + f.nome + '</strong></a><br><small>Admissão: ' + dataFormatada + '</small></td><td>' + f.cargo + '<br><small style="color:#64748b">Dep: ' + deptoRotulo + '</small></td><td><small>Jornada: ' + jTexto + '</small><br><strong>' + turnoRotulo + '</strong></td><td style="color:#16a34a"><strong>' + formatarMoeda(f.liquido) + '</strong></td><td class="actions-cell"><a onclick="abrirContracheque(' + f.id + ')" class="btn-link">📄 Mensal</a><a onclick="abrirFerias(' + f.id + ')" class="btn-link" style="color:#16a34a">🌴 Férias</a><button class="btn-delete" style="background:#0284c7; color:white; border:none; padding:4px 8px; margin-right:5px;" onclick="selecionarTipoRescisao(' + f.id + ')">⚠️ Rescisão</button><button class="btn-delete" onclick="deletarFuncionario(' + f.id + ')">Demitir</button></td>';
        corpo.appendChild(tr);
    });
}

function imprimirBalanco() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    let totalBruto = 0;
    funcionarios.forEach(f => { totalBruto += (f.salario + (f.total_he_ganho || 0) + (f.insalubridade || 0) + (f.reflexo_13_ferias || 0) + (f.adicional_noturno || 0)); });
    const area = document.getElementById('print-area');
    area.innerHTML = "<div style='padding:40px; font-family:sans-serif;'><h2>TERCEIRO ADM ASSOCIADOS - BALANÇO</h2><hr><br><p><strong>Receita Operacional Bruta:</strong> " + formatarMoeda(receita) + "</p><p><strong>Custo de Salários/Reflexos:</strong> " + formatarMoeda(totalBruto) + "</p><h3>Saldo Final de Caixa: " + formatarMoeda(receita - totalBruto) + "</h3></div>";
    document.body.classList.add('imprimindo-balanco');
    window.print();
    setTimeout(() => { document.body.classList.remove('imprimindo-balanco'); }, 1000);
}

function abrirContracheque(id) {
    const f = funcionarios.find(emp => emp.id === id);
    if(!f) return;
    const vHora = f.salario / f.horas_comp;
    const vBanco = f.banco_horas > 0 ? f.banco_horas * vHora : 0;
    const proventosTotais = f.salario + (f.total_he_ganho || 0) + (f.reflexo_13_ferias || 0) + (f.insalubridade || 0) + (f.beneficios || 0) + (f.salario_familia || 0) + (f.adicional_noturno || 0) + vBanco;
    const janela = window.open('', '_blank', 'width=750,height=850');
    janela.document.write("<html><body style='font-family:monospace; padding:25px;'><div style='border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;'><h2>RECIBO DE PAGAMENTO MENSAL</h2><p><strong>TERCEIRO ADM ASSOCIADOS</strong></p><hr><p><strong>Colaborador:</strong> " + f.nome + " | <strong>Dep:</strong> " + (f.departamento || 'Geral') + "</p><p><strong>Salário Base:</strong> " + formatarMoeda(f.salario) + "</p><p><strong>Total Proventos:</strong> " + formatarMoeda(proventosTotais) + "</p><h3>VALOR LÍQUIDO: " + formatarMoeda(f.liquido) + "</h3></div></body></html>");
    janela.document.close();
}

function abrirFerias(id) {
    const f = funcionarios.find(emp => emp.id === id);
    if(!f) return;
    const baseFerias = f.salario + (f.insalubridade || 0) + (f.adicional_noturno || 0);
    const terco = baseFerias / 3;
    const janela = window.open('', '_blank', 'width=750,height=700');
    janela.document.write("<html><body style='font-family:monospace; padding:30px;'><div style='border:2px solid #000; padding:20px; max-width:600px; margin:0 auto;'><h2>RECIBO DE AVISO E GOZO DE FÉRIAS</h2><hr><p><strong>Colaborador:</strong> " + f.nome + "</p><h3>LÍQUIDO DAS FÉRIAS: " + formatarMoeda((baseFerias + terco) * 0.91) + "</h3></div></body></html>");
    janela.document.close();
}

function selecionarTipoRescisao(id) {
    const f = funcionarios.find(emp => emp.id === id);
    if(!f) return;
    const tipo = confirm("Clique em [OK] para DEMISSÃO SEM JUSTA CAUSA.\nClique em [CANCELAR] para PEDIDO DE DEMISSÃO.");
    emitirRescisaoExecutiva(f, tipo ? 'demissao_sem_justa' : 'pedido_demissao');
}

async function emitirRescisaoExecutiva(f, tipo) {
    const resposta = await fetch('/api/rescisao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ salario: f.salario, admissao: f.data_admissao, tipoRescisao: tipo }) });
    const r = await resposta.json();
    const janela = window.open('', '_blank', 'width=750,height=850');
    janela.document.write("<html><body style='font-family:monospace; padding:30px;'><div style='border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;'><h2>TERMO DE RESCISÃO CLT</h2><hr><p><strong>Causa:</strong> " + (tipo === 'pedido_demissao' ? 'Pedido de Demissão' : 'Dispensa sem Justa Causa') + "</p><h3>LÍQUIDO DA QUITAÇÃO: " + formatarMoeda(r.liquido) + "</h3></div></body></html>");
    janela.document.close();
}

function abrirDecimoTerceiroGeral() {
    if (funcionarios.length === 0) { alert("Nenhum funcionário ativo."); return; }
    let totalLiquido = 0;
    funcionarios.forEach(f => { totalLiquido += (f.salario * 0.91); });
    const janela = window.open('', '_blank', 'width=750,height=700');
    janela.document.write("<html><body style='font-family:monospace; padding:30px;'><div style='border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;'><h2>FOLHA DE 13º SALÁRIO INTEGRAL</h2><hr><h3>TOTAL LÍQUIDO A PAGAR: " + formatarMoeda(totalLiquido) + "</h3></div></body></html>");
    janela.document.close();
}
