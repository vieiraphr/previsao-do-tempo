# Previsão do Tempo

Site de previsão do tempo feito com HTML, CSS e JavaScript. O usuário digita o nome de uma cidade e vê o clima atual dela.

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

## Estrutura do projeto

```
previsao-do-tempo/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## Como executar

1. Instale o Node.js 18 ou superior.
2. Crie uma chave gratuita no [OpenWeather](https://openweathermap.org/api).
3. Na pasta `backend`, copie `.env.example` para `.env` e coloque sua chave em `OPENWEATHER_KEY`.
4. No terminal, entre na pasta `backend` e execute `npm install` (na primeira vez) e depois `npm start`.
5. Acesse <http://localhost:3000> no navegador.

O backend fornece `GET /api/clima?cidade=Curitiba` e `GET /api/health`. A chave da OpenWeather fica no servidor e não é exposta ao navegador. É necessário ter conexão com a internet para consultar o clima.

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
