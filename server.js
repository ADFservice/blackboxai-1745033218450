const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * Utilitário para formatar mensagens em prompt
 */
function formatPrompt(messages) {
  return messages.map(msg => {
    const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
    return `${role}: ${msg.content}`;
  }).join('\n') + '\nAssistente: ';
}

/**
 * Endpoint para listar modelos LLM instalados localmente
 */
app.get('/api/llms', (req, res) => {
  exec('ollama list', (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao listar LLMs:', stderr);
      return res.status(500).json({ error: 'Erro ao listar LLMs' });
    }

    // Extrair nomes dos modelos
    const llms = stdout
      .split('\n')
      .slice(1) // Ignora a linha de cabeçalho
      .map(line => line.split(/\s+/)[0]) // Pega o nome do modelo
      .filter(name => name); // Remove linhas vazias

    res.json({ llms });
  });
});

/**
 * Endpoint para conversar com um modelo LLM
 * Espera JSON: { llm: string, messages: [{ role: 'user'|'assistant', content: string }] }
 */
app.post('/api/chat', (req, res) => {
  const { llm, messages } = req.body;

  if (!llm || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const prompt = formatPrompt(messages);

  const ollama = spawn('ollama', ['run', llm]);

  let responseData = '';
  let errorData = '';

  ollama.stdout.on('data', (data) => {
    responseData += data.toString();
  });

  ollama.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  ollama.on('error', (err) => {
    console.error('Erro ao iniciar o processo Ollama:', err);
    return res.status(500).json({ error: 'Erro ao iniciar a LLM' });
  });

  ollama.on('close', (code) => {
    if (code !== 0) {
      console.error('Erro no Ollama:', errorData);
      return res.status(500).json({ error: 'Erro ao conversar com a LLM' });
    }
    res.json({ response: responseData.trim() });
  });

  // Envia o prompt
  ollama.stdin.write(prompt);
  ollama.stdin.end();
});

/**
 * Inicializa o servidor
 */
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
