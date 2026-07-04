from flask import Flask, render_template, request, jsonify
from datetime import datetime
import sqlite3
import os

app = Flask(__name__)
DB_FILE = 'folha.db'

def iniciar_banco():
    conexao = sqlite3.connect(DB_FILE)
    cursor = conexao.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS funcionarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL, cargo TEXT, salario REAL, horas_comp REAL, insalubridade REAL,
            beneficios REAL, qtd_filhos INTEGER, observacoes TEXT, data_admissao TEXT, mes_ref TEXT,
            v_he_semana REAL, v_he_sabado REAL, v_he_domingo REAL, total_he_ganho REAL,
            reflexo_13_ferias REAL, salario_familia REAL, inss REAL, irrf REAL, vt REAL,
            adiantamento_valor REAL, total_descontos REAL, liquido REAL
        )
    ''')
    conexao.commit()
    conexao.close()

def calcular_inss(salario_contribuicao):
    if salario_contribuicao <= 1412: return salario_contribuicao * 0.075
    if salario_contribuicao <= 2666.68: return (salario_contribuicao * 0.09) - 21.18
    if salario_contribuicao <= 4000.03: return (salario_contribuicao * 0.12) - 101.18
    if salario_contribuicao <= 7786.02: return (salario_contribuicao * 0.14) - 181.18
    return 908.86

def calcular_irrf(salario_contribuicao, desconto_inss):
    base = salario_contribuicao - desconto_inss
    if base <= 2259.20: return 0
    if base <= 2826.65: return (base * 0.075) - 169.44
    if base <= 3751.05: return (base * 0.15) - 381.44
    if base <= 4664.68: return (base * 0.225) - 662.77
    return (base * 0.275) - 896.00

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/funcionarios', methods=['GET'])
def listar_funcionarios():
    conexao = sqlite3.connect(DB_FILE)
    conexao.row_factory = sqlite3.Row
    cursor = conexao.cursor()
    cursor.execute('SELECT * FROM funcionarios')
    linhas = cursor.fetchall()
    conexao.close()
    return jsonify([dict(linha) for linha in linhas])

@app.route('/api/calcular', methods=['POST'])
def calcular_e_salvar():
    dados = request.json
    salario_base = float(dados.get('salario', 0))
    horas_comp = float(dados.get('horasComp', 220)) or 220
    beneficios = float(dados.get('beneficios', 0))
    insalubridade = float(dados.get('insalubridade', 0))
    qtd_filhos = int(dados.get('qtdFilhos', 0))
    nome = dados.get('nome', '').strip()
    cargo = dados.get('cargo', '')
    observacoes = dados.get('observacoes', '')
    data_admissao = dados.get('dataAdmissao', '')
    mes_ref = dados.get('mesRef', '')
    
    he_semana = float(dados.get('heSemana', 0))
    he_sabado = float(dados.get('heSabado', 0))
    he_domingo = float(dados.get('heDomingo', 0))
    
    sindicato = float(dados.get('sindicato', 0))
    plano_saude = float(dados.get('planoSaude', 0))
    plano_odonto = float(dados.get('planoOdonto', 0))
    vale_farmacia = float(dados.get('valeFarmacia', 0))
    aplicar_adiantamento = dados.get('adiantamento', 'nao') == 'sim'
    descontar_vt = dados.get('vt', 'nao') == 'sim'
    
    total_salario_familia = 0
    if salario_base <= 1819.26 and qtd_filhos > 0:
        total_salario_familia = qtd_filhos * 62.04
        
    valor_hora = salario_base / horas_comp
    v_he_semana = he_semana * (valor_hora * 1.25)
    v_he_sabado = he_sabado * (valor_hora * 1.50)
    v_he_domingo = he_domingo * (valor_hora * 2.00)
    total_he_ganho = v_he_semana + v_he_sabado + v_he_domingo
    reflexo_13_ferias = total_he_ganho * (2.0 / 12.0)
    
    salario_contribuicao = salario_base + total_he_ganho + insalubridade + reflexo_13_ferias
    inss = calcular_inss(salario_contribuicao)
    irrf = calcular_irrf(salario_contribuicao, inss)
    vt = salario_base * 0.06 if descontar_vt else 0
    
    proventos_previa = salario_base + beneficios + total_he_ganho + insalubridade + reflexo_13_ferias + total_salario_familia
    descontos_previa = inss + irrf + vt + sindicato + plano_saude + plano_odonto + vale_farmacia
    
    valor_adiantamento = (proventos_previa - descontos_previa) * 0.40 if aplicar_adiantamento else 0
    total_descontos = descontos_previa + valor_adiantamento
    liquido_final = proventos_previa - total_descontos
    
    # Gravação no Banco de Dados SQLite
    conexao = sqlite3.connect(DB_FILE)
    cursor = conexao.cursor()
    cursor.execute('''
        INSERT INTO funcionarios (nome, cargo, salario, horas_comp, insalubridade, beneficios, qtd_filhos, 
        observacoes, data_admissao, mes_ref, v_he_semana, v_he_sabado, v_he_domingo, total_he_ganho, 
        reflexo_13_ferias, salario_familia, inss, irrf, vt, adiantamento_valor, total_descontos, liquido)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (nome, cargo, salario_base, horas_comp, insalubridade, beneficios, qtd_filhos, observacoes, 
          data_admissao, mes_ref, v_he_semana, v_he_sabado, v_he_domingo, total_he_ganho, reflexo_13_ferias, 
          total_salario_familia, inss, irrf, vt, valor_adiantamento, total_descontos, liquido_final))
    conexao.commit()
    conexao.close()
    
    return jsonify({'status': 'sucesso'})

@app.route('/api/funcionarios/<int:id_func>', methods=['DELETE'])
def demitir_funcionario(id_func):
    conexao = sqlite3.connect(DB_FILE)
    cursor = conexao.cursor()
    cursor.execute('DELETE FROM funcionarios WHERE id = ?', (id_func,))
    conexao.commit()
    conexao.close()
    return jsonify({'status': 'removido'})

@app.route('/api/rescisao', methods=['POST'])
def calcular_rescisao():
    dados = request.json
    salario_base = float(dados.get('salario', 0))
    dt_admissao_str = dados.get('admissao', '')
    
    dias_aviso = 30
    if dt_admissao_str:
        try:
            dt_admissao = datetime.strptime(dt_admissao_str, "%Y-%m-%d")
            hoje = datetime.now()
            anos = hoje.year - dt_admissao.year - ((hoje.month, hoje.day) < (dt_admissao.month, dt_admissao.day))
            if anos > 0: dias_aviso += min(anos * 3, 60)
        except: pass

    valor_aviso = (salario_base / 30) * dias_aviso
    saldo_salario = salario_base * 0.5
    decimo_terceiro = (salario_base / 12) * 6
    ferias_prop = (salario_base / 12) * 6
    terco = ferias_prop / 3
    total_prov = saldo_salario + decimo_terceiro + ferias_prop + terco + valor_aviso
    total_desc = calcular_inss(saldo_salario + decimo_terceiro)
    
    return jsonify({
        'saldoSalario': saldo_salario, 'decimoTerceiroProp': decimo_terceiro, 'feriasProporcionais': ferias_prop,
        'tercoConstitucional': terco, 'diasAviso': dias_aviso, 'valorAvisoPrevio': valor_aviso,
        'totalProventos': total_prov, 'inss': total_desc, 'liquido': total_prov - total_desc
    })

iniciar_banco()

if __name__ == '__main__':
    porta = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=porta, debug=True)
