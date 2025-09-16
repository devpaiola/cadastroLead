from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# Configurações
DATA_DIR = '../data'
CSV_FILE = os.path.join(DATA_DIR, 'leads.csv')

# Lista de prêmios para a roleta
PREMIOS = [
    "Desconto de 50%",
    "Frete Grátis", 
    "Produto Grátis",
    "Cashback 20%",
    "Vale-compra R$ 100",
    "Desconto de 30%",
    "Brinde Especial",
    "Cupom R$ 50"
]

def inicializar_csv():
    """Cria o arquivo CSV com cabeçalhos se não existir"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['Nome', 'Email', 'Telefone', 'Referencia', 'Data_Cadastro'])

def salvar_lead(nome, email, telefone, referencia=''):
    """Salva um lead no arquivo CSV"""
    data_cadastro = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with open(CSV_FILE, 'a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([nome, email, telefone, referencia, data_cadastro])

@app.route('/api/cadastrar-usuario', methods=['POST'])
def cadastrar_usuario():
    """Cadastra o usuário inicial (que também será considerado lead)"""
    try:
        data = request.get_json()
        nome = data.get('nome', '').strip()
        email = data.get('email', '').strip()
        telefone = data.get('telefone', '').strip()
        
        # Validações básicas
        if not nome or not email or not telefone:
            return jsonify({'erro': 'Todos os campos são obrigatórios'}), 400
        
        if '@' not in email:
            return jsonify({'erro': 'Email inválido'}), 400
        
        # Salva o usuário cadastrador (sem referência, pois ele é o primeiro)
        salvar_lead(nome, email, telefone, referencia='CADASTRADOR')
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Usuário cadastrado com sucesso!',
            'cadastrador': {
                'nome': nome,
                'email': email,
                'telefone': telefone
            }
        }), 200
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@app.route('/api/cadastrar-leads', methods=['POST'])
def cadastrar_leads():
    """Cadastra múltiplos leads com referência ao cadastrador"""
    try:
        data = request.get_json()
        leads = data.get('leads', [])
        referencia = data.get('referencia', '').strip()
        
        if not referencia:
            return jsonify({'erro': 'Referência do cadastrador é obrigatória'}), 400
        
        if not leads or len(leads) < 3:
            return jsonify({'erro': 'É necessário cadastrar pelo menos 3 leads'}), 400
        
        if len(leads) > 5:
            return jsonify({'erro': 'Máximo de 5 leads por cadastro'}), 400
        
        leads_salvos = []
        
        for lead in leads:
            nome = lead.get('nome', '').strip()
            email = lead.get('email', '').strip()
            telefone = lead.get('telefone', '').strip()
            
            # Validações
            if not nome or not email or not telefone:
                return jsonify({'erro': f'Todos os campos são obrigatórios para o lead: {nome or "Nome vazio"}'}), 400
            
            if '@' not in email:
                return jsonify({'erro': f'Email inválido para o lead: {nome}'}), 400
            
            # Salva o lead
            salvar_lead(nome, email, telefone, referencia)
            leads_salvos.append({'nome': nome, 'email': email, 'telefone': telefone})
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'{len(leads_salvos)} leads cadastrados com sucesso!',
            'leads_salvos': leads_salvos
        }), 200
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@app.route('/api/sortear-premio', methods=['POST'])
def sortear_premio():
    """Sorteia um prêmio aleatório para a roleta"""
    try:
        premio_sorteado = random.choice(PREMIOS)
        
        return jsonify({
            'sucesso': True,
            'premio': premio_sorteado,
            'mensagem': f'Parabéns! Você ganhou: {premio_sorteado}'
        }), 200
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@app.route('/api/premios', methods=['GET'])
def listar_premios():
    """Retorna a lista de prêmios disponíveis para a roleta"""
    try:
        return jsonify({
            'sucesso': True,
            'premios': PREMIOS
        }), 200
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@app.route('/api/stats', methods=['GET'])
def estatisticas():
    """Retorna estatísticas dos leads cadastrados"""
    try:
        if not os.path.exists(CSV_FILE):
            return jsonify({
                'total_leads': 0,
                'total_cadastradores': 0,
                'leads_referenciados': 0
            }), 200
        
        total_leads = 0
        total_cadastradores = 0
        leads_referenciados = 0
        
        with open(CSV_FILE, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                total_leads += 1
                if row['Referencia'] == 'CADASTRADOR':
                    total_cadastradores += 1
                else:
                    leads_referenciados += 1
        
        return jsonify({
            'total_leads': total_leads,
            'total_cadastradores': total_cadastradores,
            'leads_referenciados': leads_referenciados
        }), 200
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@app.route('/')
def index():
    """Redireciona para o frontend"""
    return app.send_static_file('index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve arquivos estáticos"""
    return app.send_static_file(filename)

if __name__ == '__main__':
    # Inicializa o arquivo CSV
    inicializar_csv()
    
    print("Servidor iniciado!")
    print("Dados serão salvos em:", os.path.abspath(CSV_FILE))
    print("cesse: http://localhost:5000")
    print("Frontend: http://localhost:5000")
    
    # Configura para servir arquivos estáticos do frontend
    app.static_folder = '../frontend'
    app.static_url_path = ''
    
    app.run(debug=True, host='0.0.0.0', port=5000)
