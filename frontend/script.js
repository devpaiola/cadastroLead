// Variáveis globais
let currentScreen = 'tela-cadastro';
let rubCount = 0;
const maxRubs = 5;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando app...');
    initializeApp();
});

function initializeApp() {
    console.log('Inicializando aplicação...');
    
    // Event listeners
    const formIndicacoes = document.getElementById('form-indicacoes');
    console.log('Formulário encontrado:', formIndicacoes);
    
    if (formIndicacoes) {
        formIndicacoes.addEventListener('submit', handleFormSubmit);
        console.log('Event listener adicionado ao formulário');
    }
    
    // Máscara para telefone
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', formatTelefone);
    });
    
    // Interação com a lâmpada
    const interactiveLamp = document.getElementById('interactive-lamp');
    if (interactiveLamp) {
        interactiveLamp.addEventListener('mouseover', handleLampHover);
        interactiveLamp.addEventListener('click', handleLampClick);
    }
    
    // Prize options
    const prizeOptions = document.querySelectorAll('.prize-option');
    prizeOptions.forEach(option => {
        option.addEventListener('click', () => selectPrize(option.dataset.prize));
    });
}

// Formatação de telefone
function formatTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    
    e.target.value = value;
}

// Validação do formulário
function validateForm() {
    const requiredFields = document.querySelectorAll('#form-indicacoes input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ff4757';
        } else {
            field.style.borderColor = 'transparent';
        }
    });
    
    return isValid;
}

// Submissão do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Coleta os dados do formulário
    const formData = new FormData(e.target);
    const dados = {
        indicacoes: [
            {
                nome: formData.get('nome1'),
                telefone: formData.get('telefone1')
            },
            {
                nome: formData.get('nome2'),
                telefone: formData.get('telefone2')
            },
            {
                nome: formData.get('nome3'),
                telefone: formData.get('telefone3')
            }
        ]
    };
    
    try {
        // Simula envio para o backend
        showLoading(true);
        await simulateApiCall(dados);
        
        // Decide o resultado (70% chance de sucesso)
        const isSuccess = Math.random() > 0.3;
        
        if (isSuccess) {
            showScreen('tela-lampada');
        } else {
            showScreen('tela-negativo');
        }
        
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        showNotification('Erro ao processar sua solicitação. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// Simulação de chamada API
function simulateApiCall(dados) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Dados enviados:', dados);
            resolve();
        }, 2000);
    });
}

// Interação com a lâmpada
function handleLampHover(e) {
    const lamp = e.target;
    lamp.style.transform = 'scale(1.05) rotate(' + (Math.random() * 10 - 5) + 'deg)';
    
    // Adiciona efeito de partículas
    createSparkles(lamp);
}

function handleLampClick(e) {
    rubCount++;
    
    const lamp = e.target;
    lamp.style.transform = 'scale(1.1) rotate(' + (Math.random() * 20 - 10) + 'deg)';
    
    // Efeito visual mais intenso
    createMagicEffect(lamp);
    
    if (rubCount >= maxRubs) {
        setTimeout(() => {
            revealPrize();
        }, 1000);
    }
}

// Criação de efeitos visuais
function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #FFD700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            animation: sparkleFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
}

function createMagicEffect(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'magic-particle';
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #00D4AA;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            animation: magicBurst 1.5s ease-out forwards;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
}

// Revelação do prêmio
function revealPrize() {
    const prizes = ['10% DE DESCONTO', 'NÃO FOI DESSA VEZ', 'UMA CANETA'];
    const weights = [0.3, 0.4, 0.3]; // Probabilidades
    
    const randomPrize = getWeightedRandom(prizes, weights);
    selectPrize(randomPrize);
}

function getWeightedRandom(items, weights) {
    const random = Math.random();
    let weightSum = 0;
    
    for (let i = 0; i < items.length; i++) {
        weightSum += weights[i];
        if (random <= weightSum) {
            return items[i];
        }
    }
    
    return items[items.length - 1];
}

// Seleção de prêmio
function selectPrize(prize) {
    let title, message, icon;
    
    switch (prize) {
        case '10% DE DESCONTO':
            title = 'Parabéns!';
            message = 'Você ganhou 10% de desconto na adesão!';
            icon = '🎉';
            break;
        case 'UMA CANETA':
            title = 'Parabéns!';
            message = 'Você ganhou uma caneta exclusiva!';
            icon = '✏️';
            break;
        default:
            title = 'Que pena!';
            message = 'Não foi dessa vez, mas continue tentando!';
            icon = '😔';
    }
    
    showModal(title, message, icon);
}

// Navegação entre telas
function showScreen(screenId) {
    console.log('Mudando para tela:', screenId);
    
    // Esconde todas as telas
    const telas = document.querySelectorAll('.tela');
    telas.forEach(tela => {
        tela.classList.remove('active');
    });
    
    // Mostra a tela selecionada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        console.log('Tela ativa:', screenId);
    } else {
        console.error('Tela não encontrada:', screenId);
    }
}

// Torna a função global
window.showScreen = showScreen;

function voltarInicio() {
    showScreen('tela-cadastro');
    resetForm();
}

function resetForm() {
    const form = document.getElementById('form-indicacoes');
    if (form) {
        form.reset();
    }
    rubCount = 0;
}

// Modal
function showModal(title, message, icon = '🎉') {
    const modal = document.getElementById('modal-resultado');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalIcon = modal.querySelector('.modal-icon');
    
    if (modal && modalTitle && modalText && modalIcon) {
        modalTitle.textContent = title;
        modalText.textContent = message;
        modalIcon.textContent = icon;
        modal.classList.remove('hidden');
    }
}

function fecharModal() {
    const modal = document.getElementById('modal-resultado');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Volta para o início após fechar o modal
    setTimeout(() => {
        voltarInicio();
    }, 500);
}

// Loading
function showLoading(show) {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        if (show) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Faça seu pedido!';
        }
    }
}

// Notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ff4757' : '#00D4AA'};
        color: white;
        border-radius: 8px;
        z-index: 2000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Animações CSS dinâmicas
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px) scale(0);
        }
    }
    
    @keyframes magicBurst {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateX(${Math.random() * 200 - 100}px) translateY(${Math.random() * 200 - 100}px) scale(0);
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
