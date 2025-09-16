// Configurações da API
const API_BASE = 'http://localhost:5000/api';

// Variáveis globais
let dadosCadastrador = null;
let leadsCount = 3;
let premiosDisponiveis = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

async function inicializarApp() {
    try {
        
        // Carregar prêmios
        await carregarPremios();
        
        // Configurar eventos
        configurarEventos();
        
        // Criar campos iniciais de leads
        criarCamposLeads(3);
        
        console.log('✅ App inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar app:', error);
        mostrarErro('Erro ao inicializar aplicação');
    }
}

function configurarEventos() {
    // Formulário do usuário
    document.getElementById('form-usuario').addEventListener('submit', handleCadastroUsuario);
    
    // Formulário dos leads
    document.getElementById('form-leads').addEventListener('submit', handleCadastroLeads);
    
    // Botão adicionar lead
    document.getElementById('btn-adicionar-lead').addEventListener('click', adicionarLead);
    
    // Botão girar roleta
    document.getElementById('btn-girar').addEventListener('click', girarRoleta);
    
    // Botão reiniciar
    document.getElementById('btn-reiniciar').addEventListener('click', reiniciarSistema);
    
    // Modal de erro
    document.getElementById('btn-fechar-erro').addEventListener('click', fecharModalErro);
}

// === GERENCIAMENTO DE TELAS ===
function mostrarTela(nomeTela) {
    // Ocultar todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('active');
    });
    
    // Mostrar tela específica
    document.getElementById(nomeTela).classList.add('active');
}

// === CADASTRO DO USUÁRIO ===
async function handleCadastroUsuario(event) {
    event.preventDefault();
    
    const loading = document.getElementById('loading-usuario');
    const form = document.getElementById('form-usuario');
    
    try {
        // Mostrar loading
        form.style.display = 'none';
        loading.classList.remove('hidden');
        
        // Coletar dados do formulário
        const formData = new FormData(form);
        const dadosUsuario = {
            nome: formData.get('nome').trim(),
            email: formData.get('email').trim(),
            telefone: formData.get('telefone').trim()
        };
        
        // Enviar para API
        const response = await fetch(`${API_BASE}/cadastrar-usuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.erro || 'Erro no cadastro');
        }
        
        // Salvar dados do cadastrador
        dadosCadastrador = result.cadastrador;
        
        // Atualizar interface
        document.getElementById('nome-referencia').textContent = dadosCadastrador.nome;
        
        // Ir para próxima tela
        mostrarTela('tela-leads');
        console.log('✅ Usuário cadastrado:', dadosCadastrador);
        
    } catch (error) {
        console.error('❌ Erro no cadastro do usuário:', error);
        mostrarErro(error.message);
        
        // Restaurar formulário
        form.style.display = 'block';
        loading.classList.add('hidden');
    }
}

// === GERENCIAMENTO DE LEADS ===
function criarCamposLeads(quantidade) {
    const container = document.getElementById('container-leads');
    container.innerHTML = '';
    
    for (let i = 1; i <= quantidade; i++) {
        criarCampoLead(i);
    }
    
    atualizarContadorLeads();
}

function criarCampoLead(numero) {
    const container = document.getElementById('container-leads');
    
    const leadGroup = document.createElement('div');
    leadGroup.className = 'lead-group';
    leadGroup.dataset.leadNumber = numero;
    
    leadGroup.innerHTML = `
        <h3>
            Lead ${numero}
            ${numero > 3 ? `<button type="button" class="btn-remover" onclick="removerLead(${numero})">×</button>` : ''}
        </h3>
        
        <div class="form-group">
            <label for="nome-lead-${numero}">Nome:</label>
            <input type="text" id="nome-lead-${numero}" name="nome-lead-${numero}" required>
        </div>
        
        <div class="form-group">
            <label for="email-lead-${numero}">E-mail:</label>
            <input type="email" id="email-lead-${numero}" name="email-lead-${numero}" required>
        </div>
        
        <div class="form-group">
            <label for="telefone-lead-${numero}">Telefone:</label>
            <input type="tel" id="telefone-lead-${numero}" name="telefone-lead-${numero}" required placeholder="(11) 99999-9999">
        </div>
    `;
    
    container.appendChild(leadGroup);
}

function adicionarLead() {
    if (leadsCount >= 5) {
        mostrarErro('Máximo de 5 leads permitidos');
        return;
    }
    
    leadsCount++;
    criarCampoLead(leadsCount);
    atualizarContadorLeads();
    atualizarBotaoAdicionar();
}

function removerLead(numero) {
    const leadGroup = document.querySelector(`[data-lead-number="${numero}"]`);
    if (leadGroup) {
        leadGroup.remove();
        leadsCount--;
        renumerarLeads();
        atualizarContadorLeads();
        atualizarBotaoAdicionar();
    }
}

function renumerarLeads() {
    const leadGroups = document.querySelectorAll('.lead-group');
    leadGroups.forEach((group, index) => {
        const novoNumero = index + 1;
        group.dataset.leadNumber = novoNumero;
        
        // Atualizar título
        const titulo = group.querySelector('h3');
        const botaoRemover = titulo.querySelector('.btn-remover');
        titulo.innerHTML = `Lead ${novoNumero}`;
        
        if (novoNumero > 3 && botaoRemover) {
            titulo.appendChild(botaoRemover);
            botaoRemover.setAttribute('onclick', `removerLead(${novoNumero})`);
        }
        
        // Atualizar IDs e names dos inputs
        const inputs = group.querySelectorAll('input');
        inputs.forEach(input => {
            const tipo = input.type === 'email' ? 'email' : (input.type === 'tel' ? 'telefone' : 'nome');
            input.id = `${tipo}-lead-${novoNumero}`;
            input.name = `${tipo}-lead-${novoNumero}`;
        });
        
        // Atualizar labels
        const labels = group.querySelectorAll('label');
        labels.forEach(label => {
            const input = label.nextElementSibling;
            label.setAttribute('for', input.id);
        });
    });
}

function atualizarContadorLeads() {
    document.getElementById('contador-leads').textContent = leadsCount;
}

function atualizarBotaoAdicionar() {
    const btnAdicionar = document.getElementById('btn-adicionar-lead');
    btnAdicionar.style.display = leadsCount >= 5 ? 'none' : 'inline-block';
}

// === CADASTRO DOS LEADS ===
async function handleCadastroLeads(event) {
    event.preventDefault();
    
    const loading = document.getElementById('loading-leads');
    const form = document.getElementById('form-leads');
    
    try {
        // Mostrar loading
        form.style.display = 'none';
        loading.classList.remove('hidden');
        
        // Coletar dados dos leads
        const leads = [];
        
        for (let i = 1; i <= leadsCount; i++) {
            const nome = document.getElementById(`nome-lead-${i}`).value.trim();
            const email = document.getElementById(`email-lead-${i}`).value.trim();
            const telefone = document.getElementById(`telefone-lead-${i}`).value.trim();
            
            if (nome && email && telefone) {
                leads.push({ nome, email, telefone });
            }
        }
        
        // Validar quantidade mínima
        if (leads.length < 3) {
            throw new Error('É necessário cadastrar pelo menos 3 leads');
        }
        
        // Enviar para API
        const response = await fetch(`${API_BASE}/cadastrar-leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                leads: leads,
                referencia: dadosCadastrador.nome
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.erro || 'Erro no cadastro dos leads');
        }
        
        // Ir para tela da roleta
        mostrarTela('tela-roleta');
        
        
        console.log('✅ Leads cadastrados:', result.leads_salvos);
        
    } catch (error) {
        console.error('❌ Erro no cadastro dos leads:', error);
        mostrarErro(error.message);
        
        // Restaurar formulário
        form.style.display = 'block';
        loading.classList.add('hidden');
    }
}

// === ROLETA DE PRÊMIOS ===
async function carregarPremios() {
    try {
        const response = await fetch(`${API_BASE}/premios`);
        const result = await response.json();
        
        if (response.ok) {
            premiosDisponiveis = result.premios;
            criarRoleta();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar prêmios:', error);
        // Usar prêmios padrão
        premiosDisponiveis = ['Desconto 50%', 'Frete Grátis', 'Produto Grátis', 'Cashback 20%'];
        criarRoleta();
    }
}

function criarRoleta() {
    const roleta = document.getElementById('roleta');
    roleta.innerHTML = '';
    
    // Criar múltiplas cópias dos prêmios para dar efeito de roleta contínua
    const premiosExtendidos = [];
    for (let i = 0; i < 5; i++) {
        premiosExtendidos.push(...premiosDisponiveis);
    }
    
    premiosExtendidos.forEach((premio, index) => {
        const premioItem = document.createElement('div');
        premioItem.className = 'premio-item';
        premioItem.textContent = premio;
        premioItem.dataset.premio = premio;
        premioItem.dataset.index = index;
        roleta.appendChild(premioItem);
    });
}

async function girarRoleta() {
    const btnGirar = document.getElementById('btn-girar');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const roleta = document.getElementById('roleta');
    const resultadoDiv = document.getElementById('resultado-premio');
    
    try {
        // Desabilitar botão
        btnGirar.disabled = true;
        btnGirar.textContent = '🎲 Girando...';
        
        // Solicitar prêmio ao backend
        const response = await fetch(`${API_BASE}/sortear-premio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.erro || 'Erro no sorteio');
        }
        
        const premioSorteado = result.premio;
        
        // Adicionar animação
        roleta.classList.add('girando');
        
        // Aguardar animação e mostrar resultado
        setTimeout(() => {
            roleta.classList.remove('girando');
            destacarPremio(premioSorteado);
            mostrarResultado(premioSorteado);
            
            // Mostrar botão reiniciar
            btnGirar.classList.add('hidden');
            btnReiniciar.classList.remove('hidden');
        }, 3000);
        
        console.log('🎊 Prêmio sorteado:', premioSorteado);
        
    } catch (error) {
        console.error('❌ Erro no sorteio:', error);
        mostrarErro(error.message);
        
        // Restaurar botão
        btnGirar.disabled = false;
        btnGirar.textContent = '🎲 Girar Roleta';
    }
}

function destacarPremio(premio) {
    // Remover destaque anterior
    document.querySelectorAll('.premio-item.destacado').forEach(item => {
        item.classList.remove('destacado');
    });
    
    // Destacar prêmio sorteado
    const premioItems = document.querySelectorAll('.premio-item');
    const itemCentral = Math.floor(premioItems.length / 2);
    
    // Encontrar item próximo ao centro com o prêmio correto
    for (let i = itemCentral - 2; i <= itemCentral + 2; i++) {
        if (premioItems[i] && premioItems[i].dataset.premio === premio) {
            premioItems[i].classList.add('destacado');
            break;
        }
    }
}

function mostrarResultado(premio) {
    const resultadoDiv = document.getElementById('resultado-premio');
    const textoPremio = document.getElementById('texto-premio');
    
    textoPremio.textContent = premio;
    resultadoDiv.classList.remove('hidden');
}


// === UTILITÁRIOS ===
function mostrarErro(mensagem) {
    const modal = document.getElementById('modal-erro');
    const texto = document.getElementById('texto-erro');
    
    texto.textContent = mensagem;
    modal.classList.remove('hidden');
}

function fecharModalErro() {
    document.getElementById('modal-erro').classList.add('hidden');
}

function reiniciarSistema() {
    // Resetar variáveis
    dadosCadastrador = null;
    leadsCount = 3;
    
    // Limpar formulários
    document.getElementById('form-usuario').reset();
    document.getElementById('form-leads').reset();
    
    // Restaurar botões
    document.getElementById('btn-girar').classList.remove('hidden');
    document.getElementById('btn-girar').disabled = false;
    document.getElementById('btn-girar').textContent = '🎲 Girar Roleta';
    document.getElementById('btn-reiniciar').classList.add('hidden');
    
    // Ocultar resultado
    document.getElementById('resultado-premio').classList.add('hidden');
    
    // Restaurar displays
    document.getElementById('form-usuario').style.display = 'block';
    document.getElementById('loading-usuario').classList.add('hidden');
    document.getElementById('form-leads').style.display = 'block';
    document.getElementById('loading-leads').classList.add('hidden');
    
    // Recriar campos de leads
    criarCamposLeads(3);
    
    // Recriar roleta
    criarRoleta();
    
    // Voltar para primeira tela
    mostrarTela('tela-usuario');
    
    console.log('🔄 Sistema reiniciado');
}

// === VALIDAÇÕES E FORMATAÇÕES ===
document.addEventListener('input', function(event) {
    // Formatação de telefone
    if (event.target.type === 'tel') {
        let valor = event.target.value.replace(/\D/g, '');
        
        if (valor.length <= 11) {
            valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            event.target.value = valor;
        }
    }
});

// === DEBUG ===
window.debugSistema = {
    dadosCadastrador: () => dadosCadastrador,
    premiosDisponiveis: () => premiosDisponiveis,
    leadsCount: () => leadsCount,
    reiniciarSistema
};

console.log('🚀 Sistema de Cadastro de Leads carregado!');
console.log('💡 Use window.debugSistema para debugging');
