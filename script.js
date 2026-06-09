// ===== JOGO DA HORTA =====
class JogoHorta {
    constructor() {
        this.moedas = 100;
        this.pontos = 0;
        this.colheitas = 0;
        this.saude = 100;
        this.sementeSelecionada = null;
        this.horta = Array(16).fill(null);
        this.tempos = {};
        this.carregarDados();
        this.inicializarHorta();
        this.atualizarUI();
    }

    plantas = {
        tomate: { nome: 'Tomate', emoji: '🍅', tempo: 30000, valor: 40, saude: 15, preco: 20 },
        alface: { nome: 'Alface', emoji: '🥬', tempo: 20000, valor: 25, saude: 10, preco: 15 },
        cenoura: { nome: 'Cenoura', emoji: '🥕', tempo: 25000, valor: 35, saude: 12, preco: 18 },
        abobora: { nome: 'Abóbora', emoji: '🎃', tempo: 40000, valor: 50, saude: 18, preco: 25 },
        melancia: { nome: 'Melancia', emoji: '🍉', tempo: 45000, valor: 60, saude: 20, preco: 30 },
        brocolos: { nome: 'Brócolis', emoji: '🥦', tempo: 35000, valor: 45, saude: 16, preco: 22 }
    };

    carregarDados() {
        const dados = localStorage.getItem('jogoHorta');
        if (dados) {
            const parsed = JSON.parse(dados);
            this.moedas = parsed.moedas;
            this.pontos = parsed.pontos;
            this.colheitas = parsed.colheitas;
            this.saude = parsed.saude;
            this.horta = parsed.horta;
            this.tempos = parsed.tempos || {};
        }
    }

    salvarDados() {
        localStorage.setItem('jogoHorta', JSON.stringify({
            moedas: this.moedas,
            pontos: this.pontos,
            colheitas: this.colheitas,
            saude: this.saude,
            horta: this.horta,
            tempos: this.tempos
        }));
    }

    inicializarHorta() {
        const grid = document.getElementById('hortaGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const celula = document.createElement('div');
            celula.className = 'celula';
            celula.id = `celula-${i}`;
            
            if (this.horta[i]) {
                celula.innerHTML = `${this.plantas[this.horta[i]].emoji}`;
                celula.classList.add('plantada');
                const progresso = this.tempos[i] || 0;
                if (progresso < 100) {
                    const progressBar = document.createElement('div');
                    progressBar.className = 'celula-progress';
                    progressBar.innerHTML = `<div class="celula-progress-bar" style="width: ${progresso}%"></div>`;
                    celula.appendChild(progressBar);
                }
            }
            
            celula.addEventListener('click', () => this.clicarCelula(i));
            grid.appendChild(celula);
        }
        
        this.atualizarProgresso();
    }

    atualizarProgresso() {
        for (let i = 0; i < 16; i++) {
            if (this.horta[i]) {
                const tempo = this.tempos[i] || 0;
                const celula = document.getElementById(`celula-${i}`);
                if (celula) {
                    const bar = celula.querySelector('.celula-progress-bar');
                    if (bar) {
                        bar.style.width = tempo + '%';
                    }
                }
            }
        }
    }

    selecionarSemente(tipo) {
        this.sementeSelecionada = tipo;
        document.querySelectorAll('.seed-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.seed-btn').classList.add('selected');
    }

    clicarCelula(indice) {
        if (this.horta[indice]) {
            this.colherPlanta(indice);
        } else if (this.sementeSelecionada) {
            this.plantarSemente(indice);
        }
    }

    plantarSemente(indice) {
        const tipo = this.sementeSelecionada;
        const preco = this.plantas[tipo].preco;
        
        if (this.moedas < preco) {
            alert('Moedas insuficientes!');
            return;
        }
        
        this.moedas -= preco;
        this.horta[indice] = tipo;
        this.tempos[indice] = 0;
        
        this.crescerPlanta(indice);
        this.atualizarUI();
        this.salvarDados();
        this.inicializarHorta();
    }

    crescerPlanta(indice) {
        const tipo = this.horta[indice];
        const tempoTotal = this.plantas[tipo].tempo;
        const intervalo = tempoTotal / 100;
        
        const timer = setInterval(() => {
            if (this.tempos[indice] < 100) {
                this.tempos[indice]++;
                this.atualizarProgresso();
                this.salvarDados();
            } else {
                clearInterval(timer);
            }
        }, intervalo);
    }

    colherPlanta(indice) {
        const tipo = this.horta[indice];
        const planta = this.plantas[tipo];
        
        if (this.tempos[indice] < 100) {
            alert(`${planta.nome} ainda não está pronta! Progresso: ${Math.floor(this.tempos[indice])}%`);
            return;
        }
        
        this.moedas += planta.valor;
        this.pontos += planta.valor;
        this.saude = Math.min(100, this.saude + planta.saude);
        this.colheitas++;
        
        this.horta[indice] = null;
        this.tempos[indice] = 0;
        
        this.atualizarUI();
        this.salvarDados();
        this.inicializarHorta();
        
        this.mostrarMensagem(`Colheu ${planta.emoji} ${planta.nome}! +${planta.valor}💰`);
    }

    regarTudo() {
        if (this.moedas < 5) {
            alert('Moedas insuficientes!');
            return;
        }
        
        this.moedas -= 5;
        for (let i = 0; i < 16; i++) {
            if (this.horta[i] && this.tempos[i] < 100) {
                this.tempos[i] = Math.min(100, this.tempos[i] + 20);
            }
        }
        
        this.atualizarUI();
        this.salvarDados();
        this.atualizarProgresso();
        this.mostrarMensagem('Regou todas as plantas! 💧');
    }

    fertilizarTudo() {
        if (this.moedas < 10) {
            alert('Moedas insuficientes!');
            return;
        }
        
        this.moedas -= 10;
        for (let i = 0; i < 16; i++) {
            if (this.horta[i] && this.tempos[i] < 100) {
                this.tempos[i] = Math.min(100, this.tempos[i] + 35);
            }
        }
        
        this.atualizarUI();
        this.salvarDados();
        this.atualizarProgresso();
        this.mostrarMensagem('Fertilizou todas as plantas! 🧪');
    }

    limparHorta() {
        if (this.moedas < 3) {
            alert('Moedas insuficientes!');
            return;
        }
        
        this.moedas -= 3;
        this.atualizarUI();
        this.salvarDados();
        this.mostrarMensagem('Limpou as ervas daninhas! 🧹');
    }

    resetarHorta() {
        if (confirm('Tem certeza que deseja resetar a horta?')) {
            this.moedas = 100;
            this.pontos = 0;
            this.colheitas = 0;
            this.saude = 100;
            this.horta = Array(16).fill(null);
            this.tempos = {};
            this.sementeSelecionada = null;
            
            this.salvarDados();
            this.atualizarUI();
            this.inicializarHorta();
            this.mostrarMensagem('Horta resetada! 🔄');
        }
    }

    atualizarUI() {
        document.getElementById('moedas').textContent = this.moedas;
        document.getElementById('pontos').textContent = this.pontos;
        document.getElementById('colheitas').textContent = this.colheitas;
        document.getElementById('saude').textContent = this.saude + '%';
    }

    mostrarMensagem(texto) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        msg.textContent = texto;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msg.remove(), 300);
        }, 2000);
    }
}

// ===== MURAL DA EMPATIA =====
class MuralEmpatia {
    constructor() {
        this.mensagens = this.carregarMensagens();
        this.form = document.getElementById('mensagemForm');
        this.container = document.getElementById('mensagensContainer');

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.adicionarMensagem(e));
        }

        this.renderizarMensagens();
    }

    carregarMensagens() {
        const stored = localStorage.getItem('mensagensAgrinho');
        return stored ? JSON.parse(stored) : this.getMensagensDefault();
    }

    getMensagensDefault() {
        return [
            {
                id: 1,
                nome: 'Maria Silva',
                mensagem: 'A horta escolar mudou minha perspectiva sobre saúde!',
                categoria: 'inspiracao',
                data: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 2,
                nome: 'João Santos',
                mensagem: 'Que tal organizarmos um dia de plantio comunitário?',
                categoria: 'acao',
                data: new Date().toLocaleDateString('pt-BR')
            }
        ];
    }

    adicionarMensagem(event) {
        event.preventDefault();

        const nome = document.getElementById('nomeInput').value.trim();
        const mensagem = document.getElementById('mensagemInput').value.trim();
        const categoria = document.getElementById('categoriaInput').value;

        if (!nome || !mensagem || !categoria) {
            alert('Preencha todos os campos!');
            return;
        }

        const novaMensagem = {
            id: Date.now(),
            nome: nome,
            mensagem: mensagem,
            categoria: categoria,
            data: new Date().toLocaleDateString('pt-BR')
        };

        this.mensagens.unshift(novaMensagem);
        this.salvarMensagens();
        this.renderizarMensagens();
        this.form.reset();
        this.mostrarFeedback('Mensagem compartilhada! 🌱');
    }

    salvarMensagens() {
        localStorage.setItem('mensagensAgrinho', JSON.stringify(this.mensagens));
    }

    renderizarMensagens() {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (this.mensagens.length === 0) {
            this.container.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma mensagem ainda.</p>';
            return;
        }

        this.mensagens.forEach(msg => {
            const card = document.createElement('div');
            card.className = `mensagem-card ${msg.categoria}`;
            card.innerHTML = `
                <div class="mensagem-header">
                    <span class="mensagem-nome">${this.escaparHTML(msg.nome)}</span>
                    <span class="mensagem-categoria">${this.getCategoriaLabel(msg.categoria)}</span>
                </div>
                <p class="mensagem-texto">${this.escaparHTML(msg.mensagem)}</p>
                <small>${msg.data}</small>
            `;
            this.container.appendChild(card);
        });
    }

    getCategoriaLabel(categoria) {
        const labels = {
            'empatia': 'Empatia',
            'acao': 'Ação Comunitária',
            'inspiracao': 'Inspiração',
            'gratidao': 'Gratidão'
        };
        return labels[categoria] || categoria;
    }

    escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    mostrarFeedback(mensagem) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: #40916c;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        feedback.textContent = mensagem;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }
}

// ===== INICIALIZAÇÃO =====
let jogoHorta;
let mural;

document.addEventListener('DOMContentLoaded', function() {
    jogoHorta = new JogoHorta();
    mural = new MuralEmpatia();
});

// ===== ANIMAÇÕES CSS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);

console.log('✓ Agrinho 2026 - Jogo da Horta carregado com sucesso!');
