# Previsão do Tempo

Aplicação de previsão do tempo. O usuário pesquisa uma cidade e vê as condições atuais, consultadas pela API da OpenWeather.

## Funcionalidades

- Busca de cidade por campo de texto
- Exibição de cidade, estado e país
- Temperatura atual e sensação térmica
- Umidade e velocidade do vento
- Descrição do clima em português
- Mensagens de carregamento e de erro (cidade não encontrada ou falha de conexão)
- Layout responsivo

## Tecnologias

- HTML
- CSS
- JavaScript
- Node.js e Express
- OpenWeather API

## Estrutura do projeto

```
previsao-do-tempo/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Como executar

1. Instale o Node.js 18 ou superior.
2. Crie `backend/.env` e configure sua chave da OpenWeather:

   ```env
   OPENWEATHER_KEY=sua_chave_da_openweathermap
   ```
3. No terminal, acesse a pasta `backend` e instale as dependências:

   ```bash
   cd backend
   npm install
   ```

4. Inicie o servidor:

   ```bash
   npm start
   ```

5. Abra <http://localhost:3000> no navegador e pesquise uma cidade.

É necessário ter conexão com a internet para buscar os dados do clima.

## API

- `GET /api/clima?cidade=Curitiba` — retorna o clima atual da cidade.
- `GET /api/health` — verifica se a API está ativa.

## Unidades

| Dado        | Unidade |
|-------------|---------|
| Temperatura | °C      |
| Sensação    | °C      |
| Umidade     | %       |
| Vento       | km/h    |

## Equipe

| Nome            | Função    |
|-----------------|-----------|
| Pedro Vieira    | Front End |
| Caio Carbornar  | Back End  |
