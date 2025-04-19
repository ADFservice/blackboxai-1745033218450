const llmSelect = document.getElementById('llm-select');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatHistoryList = document.getElementById('chat-history');
const btnNovaConversa = document.getElementById('btn-nova-conversa');
const btnImportarConversa = document.getElementById('btn-importar-conversa');
const inputImportarConversa = document.getElementById('input-importar-conversa');

let currentSessionId = null;
let sessions = {}; // { sessionId: { llm, messages: [{role, content}] } }

// Utilitário para gerar IDs únicos simples
function gerarId() {
  return 'sessao-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Salvar sessões no localStorage
function salvarSessoes() {
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
}

// Carregar sessões do localStorage
function carregarSessoes() {
  const data = localStorage.getItem('chatSessions');
  if (data) {
    sessions = JSON.parse(data);
  }
}

// Atualizar a lista de histórico de conversas na UI
function atualizarListaHistorico() {
  chatHistoryList.innerHTML = '';
  Object.entries(sessions).forEach(([id, session]) => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center cursor-pointer hover:bg-gray-200 rounded px-2 py-1';
    li.title = 'Clique para abrir esta conversa';

    const span = document.createElement('span');
    span.textContent = `${session.llm} - ${session.messages.length} mensagens`;
    span.addEventListener('click', () => {
      carregarSessao(id);
    });

    const btnDelete = document.createElement('button');
    btnDelete.className = 'text-red-500 hover:text-red-700';
    btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';
    btnDelete.title = 'Apagar conversa';
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      apagarSessao(id);
    });

    if (id === currentSessionId) {
      li.classList.add('bg-blue-100', 'font-semibold');
    }

    li.appendChild(span);
    li.appendChild(btnDelete);
    chatHistoryList.appendChild(li);
  });
}

// Carregar uma sessão na UI
function carregarSessao(sessionId) {
  currentSessionId = sessionId;
  atualizarListaHistorico();
  const session = sessions[sessionId];
  if (!session) return;

  // Atualizar seleção da LLM
  llmSelect.value = session.llm;

  // Mostrar mensagens no chat
  chatMessages.innerHTML = '';
  session.messages.forEach(msg => {
    adicionarMensagem(msg.role, msg.content);
  });
}

// Adicionar mensagem na UI
function adicionarMensagem(role, content) {
  const div = document.createElement('div');
  div.className = role === 'user' ? 'text-right' : 'text-left';
  const bubble = document.createElement('div');
  bubble.className =
    (role === 'user'
      ? 'inline-block bg-blue-600 text-white'
      : 'inline-block bg-gray-200 text-gray-800') +
    ' rounded-lg px-4 py-2 max-w-[70%] break-words';
  bubble.textContent = content;
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Iniciar nova sessão
function iniciarNovaSessao(llm) {
  const sessionId = gerarId();
  sessions[sessionId] = {
    llm,
    messages: [],
  };
  salvarSessoes();
  carregarSessao(sessionId);
  return sessionId;
}

// Enviar mensagem para backend e obter resposta
async function enviarMensagem(llm, messages) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ llm, messages }),
    });
    if (!response.ok) {
      throw new Error('Erro na comunicação com o servidor');
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error(error);
    return 'Erro ao obter resposta da LLM.';
  }
}

// Ao selecionar uma LLM
llmSelect.addEventListener('change', async () => {
  const llm = llmSelect.value;
  if (!llm) return;

  // Iniciar nova sessão
  currentSessionId = iniciarNovaSessao(llm);

  // Mensagem de apresentação da LLM
  const apresentacao = `Olá! Eu sou a LLM "${llm}". Estou pronta para ajudar você. Por favor, me faça perguntas ou diga como posso ajudar.`;

  sessions[currentSessionId].messages.push({ role: 'assistant', content: apresentacao });
  salvarSessoes();
  carregarSessao(currentSessionId);
});

// Ao enviar mensagem no chat
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto || !currentSessionId) return;

  // Adicionar mensagem do usuário
  sessions[currentSessionId].messages.push({ role: 'user', content: texto });
  adicionarMensagem('user', texto);
  chatInput.value = '';
  salvarSessoes();

  // Enviar para backend e obter resposta
  const llm = sessions[currentSessionId].llm;
  const messages = sessions[currentSessionId].messages;
  const resposta = await enviarMensagem(llm, messages);

  // Adicionar resposta da LLM
  sessions[currentSessionId].messages.push({ role: 'assistant', content: resposta });
  adicionarMensagem('assistant', resposta);
  salvarSessoes();
});

// Criar nova conversa ao clicar no botão
btnNovaConversa.addEventListener('click', () => {
  llmSelect.value = '';
  currentSessionId = null;
  chatMessages.innerHTML = '';
});

// Apagar uma sessão específica
function apagarSessao(sessionId) {
  if (confirm('Tem certeza que deseja apagar esta conversa?')) {
    delete sessions[sessionId];
    if (currentSessionId === sessionId) {
      currentSessionId = null;
      chatMessages.innerHTML = '';
    }
    salvarSessoes();
    atualizarListaHistorico();
  }
}

// Importar conversa
btnImportarConversa.addEventListener('click', () => {
  inputImportarConversa.click();
});

inputImportarConversa.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedSession = JSON.parse(e.target.result);
      if (!importedSession.llm || !Array.isArray(importedSession.messages)) {
        alert('Arquivo inválido: formato incorreto.');
        return;
      }
      const newSessionId = gerarId();
      sessions[newSessionId] = importedSession;
      salvarSessoes();
      atualizarListaHistorico();
      carregarSessao(newSessionId);
      alert('Conversa importada com sucesso!');
    } catch (error) {
      alert('Erro ao importar arquivo: JSON inválido.');
    }
  };
  reader.readAsText(file);
});
