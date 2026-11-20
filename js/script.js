const formBusca = document.querySelector('#form-busca');
const campoCidade = document.querySelector('#campo-cidade');
const mensagem = document.querySelector('#mensagem');
const resultado = document.querySelector('#resultado');

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.hidden = !texto;
  mensagem.classList.toggle('erro', erro);
}

function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(valor);
}

formBusca.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const cidade = campoCidade.value.trim();
  if (!cidade) return;

  resultado.hidden = true;
  mostrarMensagem('Buscando previsão…');

  try {
    const resposta = await fetch(`/api/clima?cidade=${encodeURIComponent(cidade)}`);
    const dados = await resposta.json();
    if (!resposta.ok) {
      throw new Error(dados.erro || 'Não foi possível buscar o clima.');
    }

    document.querySelector('#cidade').textContent = dados.cidade;
    document.querySelector('#estado').textContent = dados.estado || '';
    document.querySelector('#pais').textContent = dados.pais;
    document.querySelector('#temperatura').textContent = formatarNumero(dados.temperatura);
    document.querySelector('#sensacao').textContent = formatarNumero(dados.sensacao);
    document.querySelector('#umidade').textContent = dados.umidade;
    document.querySelector('#vento').textContent = formatarNumero(dados.vento);
    document.querySelector('#descricao').textContent = dados.descricao;

    resultado.hidden = false;
    mostrarMensagem('');
  } catch (erro) {
    mostrarMensagem(
      erro.message || 'Não foi possível conectar ao backend. Verifique se ele está rodando.',
      true,
    );
  }
});
