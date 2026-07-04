let funcionarios = [];

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicialização automática ao abrir a aplicação
window.addEventListener('DOMContentLoaded', carregarDadosBanco);

async function carregarDadosBanco() {
    const resposta = await fetch('/api/funcionarios');
    funcionarios = await resposta.json();
    renderizarTabela();
    atualizarDashboard();
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
            nome, cargo, salario, horasComp, insalubridade, beneficios, heSemana, heSabado, heDomingo,
            planoSaude, planoOdonto, valeFarmacia, sindicato, adiantamento, vt, qtdFilhos, mesRef
        })
    });

    document.getElementById('nome').value = '';
    document.getElementById('observacoes').value = '';
    carregarDadosBanco();
}

async function deletarFuncionario(id) {
    await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
    carregarDadosBanco();
}


function atualizarDashboard() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    const limiteMax = parseInt(document.getElementById('limite_func').value) || 10;

    let totalBruto = 0; let totalDescontos = 0; let totalLiquido = 0;
    funcionarios.forEach(f => {
        totalBruto += f.salario + f.total_he_ganho + f.insalubridade + f.reflexo_13_ferias;
        totalDescontos += f.total_descontos;
        totalLiquido += f.liquido;
    });

    let custoTotal = funcionarios.reduce((acc, f) => acc + f.salario + f.beneficios + f.total_he_ganho + f.insalubridade + f.reflexo_13_ferias, 0);
    let saldoFinal = receita - custoTotal;

    document.getElementById('dash_total_func').innerText = `${funcionarios.length} / ${limiteMax}`;
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
        const percDescontos = total > 0 ? ((descontos / total) * 100).toFixed(1) : 0;
        pizza.style.background = `conic-gradient(#dc2626 0% ${percDescontos}%, #16a34a ${percDescontos}% 100%)`;
    }

    // Processamento de Pareto Nativo por Categoria
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

    // Processamento Linear de Elasticidade Individual
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
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${f.nome}</strong><br><small style="color:#64748b">Admissão: ${dataFormatada}</small></td>
            <td>${f.cargo}</td>
            <td>${formatarMoeda(f.salario)}</td>
            <td style="color:#16a34a"><strong>${formatarMoeda(f.liquido)}</strong></td>
            <td class="actions-cell">
                <a onclick="abrirContracheque('${dados}')" class="btn-link">📄 Mensal</a>
                <a onclick="abrirFerias('${dados}')" class="btn-link" style="color:#16a34a">🌴 Férias</a>
                <button class="btn-delete" style="background:#0284c7; color:white; border:none; padding:4px 8px; margin-right:5px;" onclick="emitirRescisao('${dados}')">⚠️ Rescisão</button>
                <button class="btn-delete" onclick="deletarFuncionario(${f.id})">Demitir</button>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

function imprimirBalanco() {
    const receita = parseFloat(document.getElementById('receita_empresa').value) || 0;
    let totalBruto = 0; let totalBeneficios = 0;
    funcionarios.forEach(f => { 
        totalBruto += (f.salario + f.total_he_ganho + f.insalubridade + f.reflexo_13_ferias); 
        totalBeneficios += f.beneficios; 
    });
    let custoTotal = totalBruto + totalBeneficios;
    let saldo = receita - custoTotal;

    const area = document.getElementById('print-area');
    area.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif;">
            <h1 style="text-align:center; color:#1e3a8a;">TERCEIRO ADM ASSOCIADOS - BALANÇO</h1>
            <p style="text-align:center; color:#555;">Endereço: Av. Paulista, 1000 - Bela Vista, São Paulo - SP</p><hr><br>
            <p><strong>Receita Operacional Bruta:</strong> ${formatarMoeda(receita)}</p>
            <p><strong>Custo Total de Salários e Reflexos:</strong> ${formatarMoeda(totalBruto)}</p>
            <p><strong>Custo Assistencial/Benefícios:</strong> ${formatarMoeda(totalBeneficios)}</p>
            <h3 style="color:${saldo >= 0 ? 'blue' : 'red'}">Saldo de Caixa: ${formatarMoeda(saldo)}</h3>
        </div>
    `;
    
    document.body.classList.add('imprimindo-balanco');
    window.print();
    
    setTimeout(() => {
        document.body.classList.remove('imprimindo-balanco');
    }, 1000);
}


function abrirContracheque(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    const proventosTotais = f.salario + f.total_he_ganho + f.reflexo_13_ferias + f.insalubridade + f.beneficios + f.salario_familia;
    const descontosTotais = f.total_descontos;
    
    const janela = window.open('', '_blank', 'width=750,height=850');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:25px; color:#000;">
            <div style="border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;">
                <h2 style="text-align:center; margin-bottom:5px;">RECIBO DE PAGAMENTO MENSAL</h2>
                <p style="text-align:center; font-weight:bold; margin-bottom:5px;">TERCEIRO ADM ASSOCIADOS</p>
                <p style="text-align:center; font-size:0.85rem; margin-bottom:15px;">Endereço: Av. Paulista, 1000 - Bela Vista, São Paulo - SP</p>
                <p><strong>Colaborador:</strong> ${f.nome} | <strong>Cargo:</strong> ${f.cargo}</p>
                <p><strong>Mês de Referência:</strong> ${f.mes_ref} | <strong>Carga Horária:</strong> ${f.horas_comp}h</p>
                <hr style="border:1px dashed #000; margin:15px 0;">
                
                <h4 style="margin-bottom:8px; color:#1e3a8a;">PROVENTOS (CRÉDITOS)</h4>
                <p>(+) Salário Base: ${formatarMoeda(f.salario)}</p>
                ${f.v_he_semana > 0 ? `<p>(+) Horas Extras (25%): ${formatarMoeda(f.v_he_semana)}</p>` : ''}
                ${f.v_he_sabado > 0 ? `<p>(+) Horas Extras (50%): ${formatarMoeda(f.v_he_sabado)}</p>` : ''}
                ${f.v_he_domingo > 0 ? `<p>(+) Horas Extras (100%): ${formatarMoeda(f.v_he_domingo)}</p>` : ''}
                ${f.reflexo_13_ferias > 0 ? `<p>(+) Reflexo HE (13º/Férias): ${formatarMoeda(f.reflexo_13_ferias)}</p>` : ''}
                ${f.insalubridade > 0 ? `<p>(+) Insalubridade: ${formatarMoeda(f.insalubridade)}</p>` : ''}
                ${f.salario_familia > 0 ? `<p>(+) Salário-Família: ${formatarMoeda(f.salario_familia)}</p>` : ''}
                <p>(+) Benefícios: ${formatarMoeda(f.beneficios)}</p>
                
                <hr style="border:1px dashed #ccc; margin:10px 0;">
                <p style="font-weight:bold; text-align:right;">TOTAL PROVENTOS: ${formatarMoeda(proventosTotais)}</p>
                
                <h4 style="margin:20px 0 8px 0; color:#dc2626;">DESCONTOS (RETENÇÕES)</h4>
                <p>(-) INSS Progressivo: ${formatarMoeda(f.inss)}</p>
                <p>(-) Imposto de Renda (IRRF): ${formatarMoeda(f.irrf)}</p>
                ${f.vt > 0 ? `<p>(-) Vale Transporte (6%): ${formatarMoeda(f.vt)}</p>` : ''}
                ${f.adiantamento_valor > 0 ? `<p>(-) Adiantamento (40%): ${formatarMoeda(f.adiantamento_valor)}</p>` : ''}
                ${f.plano_saude > 0 ? `<p>(-) Plano Saúde: ${formatarMoeda(f.plano_saude)}</p>` : ''}
                ${f.plano_odonto > 0 ? `<p>(-) Plano Odonto: ${formatarMoeda(f.plano_odonto)}</p>` : ''}
                ${f.vale_farmacia > 0 ? `<p>(-) Vale Farmácia: ${formatarMoeda(f.vale_farmacia)}</p>` : ''}
                ${f.sindicato > 0 ? `<p>(-) Sindicato: ${formatarMoeda(f.sindicato)}</p>` : ''}
                
                <hr style="border:1px dashed #ccc; margin:10px 0;">
                <p style="font-weight:bold; text-align:right;">TOTAL DESCONTOS: ${formatarMoeda(descontosTotais)}</p>
                
                <hr style="border:1px dashed #000; margin:20px 0 10px 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px; border:1px solid #000;">
                    <h3 style="font-size:1.2rem; margin:0;">VALOR LÍQUIDO A RECEBER:</h3>
                    <h3 style="font-size:1.4rem; margin:0; color:#16a34a;">${formatarMoeda(f.liquido)}</h3>
                </div>
                ${f.observacoes ? `<div style="margin-top:20px; border:1px solid #cbd5e1; padding:10px;"><strong>Notas:</strong> <p>${f.observacoes}</p></div>` : ''}
                <br><br><p style="text-align:center;">___________________________<br>Assinatura</p>
            </div>
            <script>window.print();<\/script>
        </body></html>
    `);
}

function abrirFerias(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    const baseFerias = f.salario + f.insalubridade;
    const terco = baseFerias / 3;
    const proventos = baseFerias + terco;
    const inssFerias = proventos * 0.09; 
    const liquidoFerias = proventos - inssFerias;

    const janela = window.open('', '_blank', 'width=750,height=700');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:30px;">
            <div style="border:2px solid #000; padding:20px; max-width:600px; margin:0 auto;">
                <h2 style="text-align:center;">RECIBO DE AVISO E GOZO DE FÉRIAS</h2>
                <p style="text-align:center; font-weight:bold;">TERCEIRO ADM ASSOCIADOS</p><hr>
                <p><strong>Colaborador:</strong> ${f.nome} | <strong>Cargo:</strong> ${f.cargo}</p>
                <p><strong>Admissão:</strong> ${f.data_admissao.split('-').reverse().join('/')}</p><br>
                <h4>PROVENTOS</h4>
                <p>(+) Valor de Férias: ${formatarMoeda(baseFerias)}</p>
                <p>(+) 1/3 Constitucional: ${formatarMoeda(terco)}</p>
                <h4>DESCONTOS</h4>
                <p style="color:red">(-) INSS: ${formatarMoeda(inssFerias)}</p><hr>
                <h3>VALOR LÍQUIDO DAS FÉRIAS: ${formatarMoeda(liquidoFerias)}</h3>
                <br><br><p style="text-align:center;">___________________________<br>Assinatura</p>
            </div>
            <script>window.print();<\/script>
        </body></html>
    `);
}

async function emitirRescisao(dadosString) {
    const f = JSON.parse(decodeURIComponent(dadosString));
    const resposta = await fetch('/api/rescisao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salario: f.salario, admissao: f.data_admissao })
    });
    const r = await resposta.json();

    const janela = window.open('', '_blank', 'width=750,height=850');
    janela.document.write(`
        <html><body style="font-family:monospace; padding:30px; color:#000;">
            <div style="border:2px solid #000; padding:20px; max-width:650px; margin:0 auto;">
                <h2 style="text-align:center; color:#dc2626;">TERMO DE RESCISÃO DO CONTRATO</h2>
                <p style="text-align:center; font-weight:bold;">TERCEIRO ADM ASSOCIADOS</p><hr>
                <p><strong>Trabalhador:</strong> ${f.nome}</p>
                <p><strong>Aviso Prévio Indenizado Proporcional (${r.diasAviso} Dias):</strong> ${formatarMoeda(r.valorAvisoPrevio)}</p>
                <p><strong>13º Salário Proporcional:</strong> ${formatarMoeda(r.decimoTerceiroProp)}</p>
                <p><strong>Férias Proporcionais + 1/3:</strong> ${formatarMoeda(r.feriasProporcionais + r.tercoConstitucional)}</p><hr>
                <h3>LÍQUIDO DA QUITAÇÃO: ${formatarMoeda(r.liquido)}</h3>
                <br><br><p style="text-align:center;">___________________________<br>Assinatura</p>
            </div>
            <script>window.print();<\/script>
        </body></html>
    `);
}
