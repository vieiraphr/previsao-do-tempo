import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.env.PORT || 3000;
const KEY = process.env.OPENWEATHER_KEY;

if (!KEY) {
  console.error('Defina OPENWEATHER_KEY no arquivo .env');
  process.exit(1);
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const TIMEOUT_MS = 8000;
const cache = new Map();

const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// O front abre via index.html (origem "null"), então liberamos CORS em desenvolvimento.
// Em produção, troque por: cors({ origin: 'https://seu-front.com' })
app.use(cors());
app.use(express.static(projectRoot));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function buscarJson(url) {
  let resp;
  try {
    resp = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new ApiError(504, 'O serviço de clima demorou demais para responder');
    }
    throw new ApiError(502, 'Não foi possível conectar ao serviço de clima');
  }

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const mensagens = {
      401: 'Chave da API inválida ou ainda não ativada',
      429: 'Limite de requisições da API excedido',
    };
    throw new ApiError(resp.status, mensagens[resp.status] || dados.message || 'Erro na API de clima');
  }
  return dados;
}

app.get('/api/clima', async (req, res) => {
  const cidade = String(req.query.cidade || '').trim();

  if (!cidade) {
    return res.status(400).json({ erro: 'Informe a cidade: /api/clima?cidade=Curitiba' });
  }
  if (cidade.length > 100) {
    return res.status(400).json({ erro: 'O nome da cidade deve ter no máximo 100 caracteres' });
  }

  const chaveCache = cidade.toLowerCase();
  const emCache = cache.get(chaveCache);
  if (emCache && Date.now() - emCache.quando < CACHE_TTL_MS) {
    return res.json(emCache.dados);
  }

  try {
    // 1) Cidade -> coordenadas (Geocoding API)
    const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
    geoUrl.search = new URLSearchParams({ q: cidade, limit: 1, appid: KEY });
    const locais = await buscarJson(geoUrl);

    if (locais.length === 0) {
      return res.status(404).json({ erro: 'Cidade não encontrada' });
    }
    const { lat, lon, name, state, country } = locais[0];

    // 2) Coordenadas -> clima atual
    const climaUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    climaUrl.search = new URLSearchParams({
      lat,
      lon,
      appid: KEY,
      units: 'metric',
      lang: 'pt_br',
    });
    const c = await buscarJson(climaUrl);

    // 3) Monta o JSON que o front consome (vento em km/h, como no README do front)
    const resultado = {
      cidade: name,
      estado: state ?? null,
      pais: country,
      temperatura: Math.round(c.main.temp * 10) / 10,
      sensacao: Math.round(c.main.feels_like * 10) / 10,
      umidade: c.main.humidity,
      vento: Math.round(c.wind.speed * 3.6 * 10) / 10,
      descricao: c.weather[0].description,
      icone: `https://openweathermap.org/img/wn/${c.weather[0].icon}@2x.png`,
    };

    cache.set(chaveCache, { dados: resultado, quando: Date.now() });
    res.json(resultado);
  } catch (err) {
    console.error(`Erro ao buscar clima de "${cidade}":`, err.message);
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`API de clima rodando em http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. O backend pode já estar rodando; acesse http://localhost:${PORT} ou altere PORT no arquivo .env.`);
    process.exitCode = 1;
    return;
  }

  console.error('Não foi possível iniciar o servidor:', err.message);
  process.exitCode = 1;
});
