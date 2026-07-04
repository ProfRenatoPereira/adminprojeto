let funcionarios = [];

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Disparador automático ao abrir a aplicação
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

async function adicionarCargoNovo() {
    const input = document.getElementById('novo_cargo_input');
    const nomeCargo = input.value.trim();
    if (!nomeCargo) { alert('Digite o nome do novo cargo.'); return; }

    await fetch('/api/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_cargo: nomeCargo })
    });

    input.value = '';
    await carregarCargosBanco();
    alert('Cargo "' + nomeCargo + '" inserido com sucesso no banco SQLite!');
}

async function carregarDadosBanco() {
    const resposta = await fetch('/api/funcionarios');
    funcionarios = await resposta.json();
    renderizarTabela();
    atualizarDashboard();
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
    
    const btn = document.getElementById('btn_principal_folha');
    if (btn) btn.innerText = 'Modo Edição Ativo';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function salvarAlteraçõesFuncionario() {
    const id = document.getElementById('func_id_edicao').value;
    if (!id) { alert('Selecione um funcionário clicando no nome dele na lista abaixo primeiro.'); return; }
    
    await adicionarFuncionarioComId(id);
    alert('Dados salvos e atualizados no SQLite com sucesso!');
    limparCamposTela();
}



async function adicionarFuncionario() {
    await adicionarFuncionarioComId('');
}

async function adicionarFuncionarioComId(idExistente) {
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
            id: idExistente, nome, cargo, salario, horasComp, insalubridade, beneficios, heSemana, heSabado, heDomingo,
            planoSaude, planoOdonto, valeFarmacia, sindicato, adiantamento, vt, qtdFilhos, mesRef, regimeHe, turno, horaEntrada
        })
    });

    if(!idExistente) {
        document.getElementById('nome').value = '';
        document.getElementById('observacoes').value = '';
    }
    carregarDadosBanco();
}

async function deletarFuncionario(id) {
    await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
    carregarDadosBanco();
}

function atualizarDashboard() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    let totalBruto = 0; let totalDescontos = 0; let totalLiquido = 0;
    
    funcionarios.forEach(f => {
        const valorHora = f.salario / f.horas_comp;
        const valorBanco = f.banco_horas > 0 ? f.banco_horas * valorHora : 0;
        totalBruto += f.salario + f.total_he_ganho + f.insalubridade + f.reflexo_13_ferias + (f.adicional_noturno || 0) + valorBanco;
        totalDescontos += f.total_descontos;
        totalLiquido += f.liquido;
    });

    let custoTotal = funcionarios.reduce((acc, f) => {
        const valorHora = f.salario / f.horas_comp;
        const valorBanco = f.banco_horas > 0 ? f.banco_horas * valorHora : 0;
        return acc + f.salario + f.beneficios + f.total_he_ganho + f.insalubridade + f.reflexo_13_ferias + (f.adicional_noturno || 0) + valorBanco;
    }, 0);
    
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
        pizza.style.background = `conic-gradient(#dc2626 0% ${perc}%, #16a34a ${perc}% 100%)`;
    }

    const custosCargo = {};
    funcionarios.forEach(f => custosCargo[f.cargo] = (custosCargo[f.cargo] || 0) + f.salario);
    const cargos = Object.keys(custosCargo).sort((a,b) => custosCargo[b] - custosCargo[a]);
    const maxCusto = cargos.length > 0 ? custosCargo[cargos[0]] : 1;
    
    const containerPareto = document.getElementById('nativePareto');
    if (containerPareto) {
        containerPareto.innerHTML = '';
        cargos.slice(0, 4).forEach(c => {
            const pct = (custosCargo[c] / maxCusto) * 100;
            containerPareto.innerHTML += `
                <div class="bar-wrapper">
                    <div class="bar-native" style="height: ${pct}%">${pct.toFixed(0)}%</div>
                    <div class="bar-label">${c}</div>
                </div>`;
        });
    }

    const containerLinear = document.getElementById('nativeLinear');
    if (containerLinear) {
        containerLinear.innerHTML = '';
        const maxLiquido = funcionarios.length > 0 ? Math.max(...funcionarios.map(f => f.liquido)) : 1;
        funcionarios.slice(-4).forEach(f => {
            const pct = (f.liquido / maxLiquido) * 100;
            containerLinear.innerHTML += `
                <div class="linear-row">
                    <div class="linear-name">${f.nome}</div>
                    <div class="linear-bar-bg"><div class="linear-bar-fill" style="width: ${pct}%"></div></div>
                    <div class="linear-value">${formatarMoeda(f.liquido)}</div>
                </div>`;
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
        const jTexto = f.banco_horas > 0 ? `${f.horas_comp}h (+${f.banco_horas}h BH)` : `${f.horas_comp}h`;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><a onclick="carregarFuncionarioParaEdicao('${dados}')" style="cursor:pointer; color:var(--primary); text-decoration:underline;"><strong>${f.nome}</strong></a><br><small>Admissão: ${dataFormatada}</small></td>
            <td>${f.cargo}</td>
            <td><small>Jornada: ${jTexto}</small><br><strong>${turnoRotulo}</strong></td>
            <td style="color:#16a34a"><strong>${formatarMoeda(f.liquido)}</strong></td>
            <td class="actions-cell">
                <a onclick="abrirContracheque('${dados}')" class="btn-link">📄 Mensal</a>
                <a onclick="abrirFerias('${dados}')" class="btn-link" style="color:#16a34a">🌴 Férias</a>
                <button class="btn-delete" style="background:#0284c7; color:white; border:none; padding:4px 8px; margin-right:5px;" onclick="selecionarTipoRescisao('${dados}')">⚠️ Rescisão</button>
                <button class="btn-delete" onclick="deletarFuncionario(${f.id})">Demitir</button>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

function abrirContracheque(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    const valorHora = f.salario / f.horas_comp;
    const valorBanco = f.banco_horas > 0 ? f.banco_horas * valorHora : 0;
    const proventosTotais = f.salario + f.total_he_ganho + f.reflexo_13_ferias + f.insalubridade + f.beneficios + f.salario_familia + (f.adicional_noturno || 0) + valorBanco;
    const descontosTotais = f.total_descontos;
    
    const janela = window.open('', '_blank', 'width=750,height=850');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:25px; color:#000;">
            <div style="border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;">
                <h2 style="text-align:center; margin-bottom:5px;">RECIBO DE PAGAMENTO MENSAL</h2>
                <p style="text-align:center; font-weight:bold; margin-bottom:5px;">TERCEIRO ADM ASSOCIADOS</p>
                <hr style="border:1px dashed #000; margin:15px 0;">
                <p><strong>Colaborador:</strong> ${f.nome} | <strong>Cargo:</strong> ${f.cargo}</p>
                <p><strong>Mês de Referência:</strong> ${f.mes_ref} | <strong>Turno:</strong> ${f.turno === 'noturno' ? 'Noturno' : 'Diurno'}</p>
                <hr style="border:1px dashed #000; margin:15px 0;">
                <h4 style="color:#1e3a8a;">PROVENTOS</h4>
                <p>(+) Salário Base: ${formatarMoeda(f.salario)}</p>
                ${f.adicional_noturno > 0 ? `<p>(+) Adicional Noturno (CLT 20%): ${formatarMoeda(f.adicional_noturno)}</p>` : ''}
                ${valorBanco > 0 ? `<p>(+) Saldo Banco de Horas (${f.banco_horas}h): ${formatarMoeda(valorBanco)}</p>` : ''}
                ${f.total_he_ganho > 0 ? `<p>(+) Horas Extras Acumuladas: ${formatarMoeda(f.total_he_ganho)}</p>` : ''}
                ${f.insalubridade > 0 ? `<p>(+) Insalubridade: ${formatarMoeda(f.insalubridade)}</p>` : ''}
                <p>(+) Benefícios: ${formatarMoeda(f.beneficios)}</p>
                <hr style="border:1px dashed #ccc; margin:10px 0;">
                <p style="font-weight:bold; text-align:right;">TOTAL PROVENTOS: ${formatarMoeda(proventosTotais)}</p>
                <h4 style="color:#dc2626;">DESCONTOS</h4>
                <p>(-) INSS Progressivo: ${formatarMoeda(f.inss)}</p>
                <p>(-) Imposto de Renda (IRRF): ${formatarMoeda(f.irrf)}</p>
                ${f.adiantamento_valor > 0 ? `<p>(-) Adiantamento (40%): ${formatarMoeda(f.adiantamento_valor)}</p>` : ''}
                <hr style="border:1px dashed #ccc; margin:10px 0;">
                <p style="font-weight:bold; text-align:right;">TOTAL DESCONTOS: ${formatarMoeda(descontosTotais)}</p>
                <hr style="border:1px dashed #000; margin:20px 0 10px 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px; border:1px solid #000;">
                    <h3>LÍQUIDO A RECEBER:</h3><h3>${formatarMoeda(f.liquido)}</h3>
                </div>
                <br><br><p style="text-align:center;">___________________________<br>Assinatura</p>
            </div>
            <script>window.print();<\/script>
        </body></html>
    `);
}





function imprimirBalanco() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    let totalBruto = 0; let totalBeneficios = 0;
    funcionarios.forEach(f => { 
        totalBruto += (f.salario + f.total_he_ganho + f.insalubridade + f.reflexo_13_ferias + (f.adicional_noturno || 0)); 
        totalBeneficios += f.beneficios; 
    });
    let custoTotal = totalBruto + totalBeneficios;
    let saldo = receita - custoTotal;

    const area = document.getElementById('print-area');
    area.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif;">
            <h1 style="text-align:center; color:#1e3a8a;">TERCEIRO ADM ASSOCIADOS - BALANÇO</h1>
            <p style="text-align:center;">Endereço: Av. Paulista, 1000 - Bela Vista, São Paulo - SP</p><hr><br>
            <p><strong>Receita Operacional Bruta:</strong> ${formatarMoeda(receita)}</p>
            <p><strong>Custo Salários e Reflexos:</strong> ${formatarMoeda(totalBruto)}</p>
            <p><strong>Custo de Benefícios:</strong> ${formatarMoeda(totalBeneficios)}</p>
            <h3>Saldo de Caixa: ${formatarMoeda(saldo)}</h3>
        </div>
    `;
    document.body.classList.add('imprimindo-balanco');
    window.print();
    setTimeout(() => { document.body.classList.remove('imprimindo-balanco'); }, 1000);
}

function abrirFerias(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    const baseFerias = f.salario + f.insalubridade + (f.adicional_noturno || 0);
    const terco = baseFerias / 3;
    const proventos = baseFerias + terco;
    const inssFerias = proventos * 0.09; 

    const janela = window.open('', '_blank', 'width=750,height=700');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:30px;">
            <div style="border:2px solid #000; padding:20px; max-width:600px; margin:0 auto;">
                <h2>RECIBO DE AVISO E GOZO DE FÉRIAS</h2>
                <p><strong>TERCEIRO ADM ASSOCIADOS</strong></p><hr>
                <p><strong>Colaborador:</strong> ${f.nome} | <strong>Admissão:</strong> ${f.data_admissao ? f.data_admissao.split('-').reverse().join('/') : '---'}</p><br>
                <h4>PROVENTOS</h4>
                <p>(+) Férias Base: ${formatarMoeda(baseFerias)}</p>
                <p>(+) 1/3 Constitucional: ${formatarMoeda(terco)}</p>
                <h4>DESCONTOS</h4>
                <p style="color:red">(-) INSS: ${formatarMoeda(inssFerias)}</p><hr>
                <h3>LÍQUIDO DAS FÉRIAS: ${formatarMoeda(proventos - inssFerias)}</h3>
                <br><br><p style="text-align:center;">___________________________<br>Assinatura</p>
            </div>
            <script>window.print();<\/script>
        </body></html>
    `);
}

function selecionarTipoRescisao(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    const tipo = confirm("Clique em [OK] para calcular DEMISSÃO SEM JUSTA CAUSA.\nClique em [CANCELAR] para simular PEDIDO DE DEMISSÃO.");
    const rotuloTipo = tipo ? 'demissao_sem_justa' : 'pedido_demissao';
    emitirRescisaoExecutiva(f, rotuloTipo);
}






async function emitirRescisaoExecutiva(f, tipo) {
    const resposta = await fetch('/api/rescisao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salario: f.salario, admissao: f.data_admissao, tipoRescisao: tipo })
    });
    const r = await resposta.json();

    const janela = window.open('', '_blank', 'width=750,height=850');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:30px; color:#000;">
            <div style="border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;">
                <h2>TERMO DE QUITAÇÃO DE RESCISÃO CLT</h2>
                <p>Causa: <strong>${tipo === 'pedido_demissao' ? 'Pedido de Demissão pelo Empregado' : 'Despedida sem Justa Causa pelo Empregador'}</strong></p><hr>
                <h4>VERBAS RESCISÓRIAS</h4>
                <p>(+) Saldo de Salário: ${formatarMoeda(r.saldoSalario)}</p>
                ${r.valorAvisoPrevio > 0 ? `<p>(+) Aviso Prévio Recebido: ${formatarMoeda(r.valorAvisoPrevio)}</p>` : ''}
                <p>(+) 13º Proporcional: ${formatarMoeda(r.decimoTerceiroProp)}</p>
                <p>(+) Férias Proporcionais + 1/3: ${formatarMoeda(r.feriasProporcionais + r.tercoConstitucional)}</p>
                <h4>DEDUÇÕES RESCISÓRIAS</h4>
                <p style="color:red">(-) INSS Retido: ${formatarMoeda(r.inss)}</p>
                ${r.descontoAviso > 0 ? `<p style="color:red">(-) Desconto Aviso Prévio não Cumprido (Art. 487): ${formatarMoeda(r.descontoAviso)}</p>` : ''}
                <hr>
                <h3>SALDO LÍQUIDO RESCISÓRIO: ${formatarMoeda(r.liquido)}</h3>
                <br><br><p style="text-align:center;">___________________________<br>Assinatura</p>
            </div>
            <script>window.print();<\/script>
        </body></html>
    `);
}

function abrirDecimoTerceiroGeral() {
    if (funcionarios.length === 0) { alert("Nenhum funcionário ativo para calcular o 13º."); return; }
    let totalBruto = 0; let totalInss = 0; let totalLiquido = 0;
    let htmlLinhas = '';
    
    funcionarios.forEach(f => {
        const inss = f.salario * 0.09; 
        const liq = f.salario - inss;
        totalBruto += f.salario; totalInss += inss; totalLiquido += liq;
        htmlLinhas += `<p><strong>${f.nome}</strong> (${f.cargo}): Bruto: ${formatarMoeda(f.salario)} | INSS: -${formatarMoeda(inss)} | Líquido: ${formatarMoeda(liq)}</p>`;
    });

    const janela = window.open('', '_blank', 'width=750,height=700');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:30px;">
            <div style="border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;">
                <h2 style="color:green; text-align:center;">FOLHA DE PAGAMENTO - 13º SALÁRIO INTEGRAL</h2>
                <hr><br>
                ${htmlLinhas}
                <hr style="border:1px dashed #000; margin:20px 0;">
                <p>Custo Bruto Acumulado do 13º: ${formatarMoeda(totalBruto)}</p>
                <p>Retenções Previdenciárias: ${formatarMoeda(totalInss)}</p>
                <h3>TOTAL LÍQUIDO A PAGAR: ${formatarMoeda(totalLiquido)}</h3>
                <br><button onclick="window.print()">🖨️ Imprimir Folha 13º</button>
            </div>
        </body></html>
    `);
}
