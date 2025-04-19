# Chat com Ollama LLM

Este projeto é um sistema web para chat com modelos LLM (Large Language Models) utilizando o Ollama como backend.

## Funcionalidades

- Seleção dinâmica de modelos LLM instalados localmente.
- Histórico de conversas com possibilidade de apagar sessões específicas.
- Importação e exportação de conversas em formato JSON.
- Interface moderna e responsiva com Tailwind CSS, Prism.js para destaque de código e Font Awesome para ícones.

## Requisitos

- Node.js (versão 14 ou superior recomendada)
- Ollama instalado e configurado na máquina
- Navegador moderno para acessar a interface web

## Instalação

1. Clone este repositório:

```bash
git clone https://github.com/ADFservice/blackboxai-1745033218450
cd blackboxai-1745033218450
```

2. Instale as dependências do Node.js:

```bash
npm install
```

3. Certifique-se de que o Ollama está instalado e configurado corretamente. Você pode verificar os modelos instalados com:

```bash
ollama list
```

## Configuração

- O servidor backend está configurado para rodar na porta 3000 por padrão. Você pode alterar a porta definindo a variável de ambiente `PORT`:

```bash
export PORT=3000
```

- O servidor serve os arquivos estáticos da pasta `public` e expõe os endpoints da API para listar modelos e conversar com a LLM.

## Como executar

1. Inicie o servidor Node.js:

```bash
node server.js
```

2. Abra o navegador e acesse:

```
http://localhost:3000 
```

3. Na interface web, selecione o modelo LLM desejado e comece a conversar.

## Uso

- Use o seletor para escolher o modelo LLM.
- O histórico de conversas aparece na barra lateral, onde você pode abrir, apagar ou importar conversas.
- Para importar uma conversa, clique no botão "Importar" e selecione um arquivo JSON válido.
- Para apagar uma conversa, clique no ícone de lixeira ao lado da conversa no histórico.
- Você pode exportar uma conversa para arquivo JSON (funcionalidade disponível no código).

## Tecnologias utilizadas

- Node.js com Express para o backend
- Ollama para interação com modelos LLM
- Tailwind CSS para estilização
- Prism.js para destaque de sintaxe em blocos de código
- Font Awesome para ícones
- LocalStorage para persistência do histórico de conversas no frontend

## Observações

- O servidor backend está configurado para rodar localmente e aceitar conexões apenas do localhost.
- Para acesso remoto, é necessário configurar o servidor para escutar em todas as interfaces e ajustar regras de firewall.

## Contato

Para dúvidas ou contribuições, entre em contato.

---
