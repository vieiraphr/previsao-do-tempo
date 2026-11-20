import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 3000;
const KEY = process.env.OPENWEATHER_KEY;

if (!KEY) {
  console.error('Defina OPENWEATHER_KEY no arquivo backend/.env');
  process.exit(1);
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 8000;
const cache = new Map();
const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
  let resposta;
  try {
    resposta = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (erro) {
    if (erro.name === 'TimeoutError') {
      throw new ApiError(504, 'O serviço de clima demorou demais para responder');
    }
    throw new ApiError(502, 'Não foi possível conectar ao serviço de clima');
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const mensagens = {
      401: 'Chave da API inválida ou ainda não ativada',
      429: 'Limite de requisições da API excedido',
    };
    throw new ApiError(
      resposta.status,
      mensagens[resposta.status] || dados.message || 'Erro na API de clima',
    );
  }
  return dados;
}

app.get('/api/clima', async (req, res) => {
  const cidade = String(req.query.cidade || '').trim();
  if (!cidade) {
    return res.status(400).json({ erro: 'Informe o nome da cidade' });
  }
  if (cidade.length > 100) {
    return res.status(400).json({ erro: 'O nome da cidade deve ter no máximo 100 caracteres' });
  }

  const chaveCache = cidade.toLocaleLowerCase('pt-BR');
  const itemCache = cache.get(chaveCache);
  if (itemCache && Date.now() - itemCache.quando < CACHE_TTL_MS) {
    return res.json(itemCache.dados);
  }

  try {
    const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
    geoUrl.search = new URLSearchParams({ q: cidade, limit: '1', appid: KEY });
    const locais = await buscarJson(geoUrl);
    if (!locais.length) {
      return res.status(404).json({ erro: 'Cidade não encontrada' });
    }

    const { lat, lon, name, state, country } = locais[0];
    const climaUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    climaUrl.search = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      appid: KEY,
      units: 'metric',
      lang: 'pt_br',
    });
    const clima = await buscarJson(climaUrl);
    const resultado = {
      cidade: name,
      estado: state ?? null,
      pais: country,
      temperatura: Math.round(clima.main.temp * 10) / 10,
      sensacao: Math.round(clima.main.feels_like * 10) / 10,
      umidade: clima.main.humidity,
      vento: Math.round(clima.wind.speed * 36) / 10,
      descricao: clima.weather[0].description,
    };

    cache.set(chaveCache, { dados: resultado, quando: Date.now() });
    return res.json(resultado);
  } catch (erro) {
    console.error(`Erro ao buscar o clima de "${cidade}":`, erro.message);
    return res.status(erro.status || 500).json({ erro: erro.message || 'Erro interno' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Site e API disponíveis em http://localhost:${PORT}`);
});

server.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Altere PORT no backend/.env ou encerre o outro servidor.`);
  } else {
    console.error('Não foi possível iniciar o servidor:', erro.message);
  }
  process.exitCode = 1;
});
