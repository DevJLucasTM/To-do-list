/* ==========================================================================
   To-do list com filtros e localStorage

   A ideia geral é simples:
   1. Todas as tarefas ficam num array (o "estado").
   2. Toda vez que algo muda, a gente salva no localStorage e redesenha a tela.
   3. A tela NUNCA é a fonte da verdade: ela só mostra o que está no array.

   Isso evita aquela bagunça de ficar mexendo no HTML em vários lugares e
   esquecer de atualizar algum.
   ========================================================================== */

const CHAVE_TAREFAS = "todo:tarefas";
const CHAVE_FILTRO = "todo:filtro";

// Cada filtro é só uma função que diz se a tarefa entra ou não
const FILTROS = {
  todas: () => true,
  pendentes: (tarefa) => !tarefa.feita,
  feitas: (tarefa) => tarefa.feita,
};

let tarefas = carregarTarefas();
let filtroAtual = carregarFiltro();
let idRecemCriado = null; // pra animar só a tarefa nova

// ---------------------------------------------------------------- elementos
const form = document.getElementById("form-nova");
const campoNova = document.getElementById("campo-nova");
const lista = document.getElementById("lista");
const molde = document.getElementById("molde-tarefa");
const vazio = document.getElementById("vazio");
const resumo = document.getElementById("resumo");
const botaoLimpar = document.getElementById("limpar-feitas");
const barraProgresso = document.getElementById("barra-progresso");
const botoesFiltro = document.querySelectorAll(".filtro");

/* ==========================================================================
   localStorage
   O localStorage só guarda texto, por isso o JSON.stringify / JSON.parse.
   ========================================================================== */

function carregarTarefas() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_TAREFAS));
    return Array.isArray(salvo) ? salvo : [];
  } catch {
    // JSON corrompido ou localStorage bloqueado (aba anônima, por exemplo)
    return [];
  }
}

function carregarFiltro() {
  // Se tiver filtro no endereço (#pendentes), ele ganha. Assim dá pra mandar o link
  const doEndereco = location.hash.slice(1);
  if (doEndereco in FILTROS) return doEndereco;
  try {
    const salvo = localStorage.getItem(CHAVE_FILTRO);
    return salvo in FILTROS ? salvo : "todas";
  } catch {
    return "todas";
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
    localStorage.setItem(CHAVE_FILTRO, filtroAtual);
  } catch {
    console.warn("Não deu pra salvar no localStorage. As tarefas vão sumir ao recarregar.");
  }
}

/* ==========================================================================
   Ações: cada uma muda o array e chama atualizar()
   ========================================================================== */

function adicionarTarefa(texto) {
  texto = texto.trim();
  if (!texto) return;

  const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random()); // fallback pra navegador antigo
  idRecemCriado = id;
  tarefas.unshift({
    id,
    texto,
    feita: false,
    criadaEm: Date.now(),
  });

  // Se o filtro estiver em "feitas", a tarefa nova nem apareceria. Volta pra "todas"
  if (filtroAtual === "feitas") filtroAtual = "todas";
  atualizar();
}

function alternarTarefa(id) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (tarefa) tarefa.feita = !tarefa.feita;
  atualizar();
}

function editarTarefa(id, novoTexto) {
  novoTexto = novoTexto.trim();
  // Apagou todo o texto? Então a pessoa quer apagar a tarefa
  if (!novoTexto) return apagarTarefa(id);
  const tarefa = tarefas.find((t) => t.id === id);
  if (tarefa) tarefa.texto = novoTexto;
  atualizar();
}

function apagarTarefa(id) {
  tarefas = tarefas.filter((t) => t.id !== id);
  atualizar();
}

function limparFeitas() {
  const quantas = tarefas.filter(FILTROS.feitas).length;
  if (!quantas) return;
  if (!confirm(`Apagar ${quantas} tarefa(s) feita(s)?`)) return;
  tarefas = tarefas.filter(FILTROS.pendentes);
  atualizar();
}

function trocarFiltro(filtro) {
  filtroAtual = filtro;
  history.replaceState(null, "", "#" + filtro); // atualiza o endereço sem recarregar
  atualizar();
}

/* ==========================================================================
   Desenhar a tela
   ========================================================================== */

function atualizar() {
  salvar();
  desenhar();
}

function desenhar() {
  const visiveis = tarefas.filter(FILTROS[filtroAtual]);

  lista.replaceChildren(...visiveis.map(criarItem));
  idRecemCriado = null;

  // Contadores nos botões de filtro
  const total = tarefas.length;
  const feitas = tarefas.filter(FILTROS.feitas).length;
  const pendentes = total - feitas;
  document.getElementById("cont-todas").textContent = total;
  document.getElementById("cont-pendentes").textContent = pendentes;
  document.getElementById("cont-feitas").textContent = feitas;

  botoesFiltro.forEach((botao) => {
    const ativo = botao.dataset.filtro === filtroAtual;
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", ativo);
  });

  barraProgresso.style.width = total ? `${(feitas / total) * 100}%` : "0";

  resumo.textContent =
    total === 0 ? "" :
    pendentes === 0 ? "Tudo feito! 🎉" :
    `${pendentes} ${pendentes === 1 ? "tarefa pendente" : "tarefas pendentes"}`;

  botaoLimpar.disabled = feitas === 0;

  // Mensagem quando a lista está vazia, diferente pra cada situação
  vazio.hidden = visiveis.length > 0;
  vazio.textContent =
    total === 0 ? "Nenhuma tarefa ainda. Que tal começar por uma?" :
    filtroAtual === "pendentes" ? "Nada pendente. Pode descansar!" :
    "Nenhuma tarefa feita ainda. Bora!";
}

function criarItem(tarefa) {
  const item = molde.content.firstElementChild.cloneNode(true);
  item.dataset.id = tarefa.id;
  item.classList.toggle("feita", tarefa.feita);
  item.classList.toggle("nova", tarefa.id === idRecemCriado);
  item.querySelector("input[type=checkbox]").checked = tarefa.feita;
  // textContent (e não innerHTML) pra ninguém conseguir injetar HTML digitando <script>
  item.querySelector(".tarefa__texto").textContent = tarefa.texto;
  return item;
}

/* ==========================================================================
   Edição inline (duplo clique no texto)
   ========================================================================== */

function iniciarEdicao(item) {
  const texto = item.querySelector(".tarefa__texto");
  const campo = item.querySelector(".tarefa__edicao");
  texto.hidden = true;
  campo.hidden = false;
  campo.value = texto.textContent;
  campo.focus();
  campo.select();

  let terminou = false;
  const terminar = (salvarEdicao) => {
    if (terminou) return; // evita rodar duas vezes (Enter + blur)
    terminou = true;
    if (salvarEdicao) editarTarefa(item.dataset.id, campo.value);
    else desenhar(); // Esc: só redesenha e descarta
  };

  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") terminar(true);
    if (e.key === "Escape") terminar(false);
  });
  campo.addEventListener("blur", () => terminar(true));
}

/* ==========================================================================
   Eventos
   Em vez de colocar um listener em cada tarefa, a gente coloca UM na lista
   e descobre em qual item foi o clique (isso se chama delegação de eventos).
   Funciona até pras tarefas que ainda vão ser criadas.
   ========================================================================== */

form.addEventListener("submit", (e) => {
  e.preventDefault(); // sem isso a página recarrega
  adicionarTarefa(campoNova.value);
  campoNova.value = "";
  campoNova.focus();
});

lista.addEventListener("change", (e) => {
  if (e.target.matches("input[type=checkbox]")) {
    alternarTarefa(e.target.closest(".tarefa").dataset.id);
  }
});

lista.addEventListener("click", (e) => {
  if (e.target.matches(".tarefa__apagar")) {
    apagarTarefa(e.target.closest(".tarefa").dataset.id);
  }
});

lista.addEventListener("dblclick", (e) => {
  if (e.target.matches(".tarefa__texto")) iniciarEdicao(e.target.closest(".tarefa"));
});

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => trocarFiltro(botao.dataset.filtro));
});

botaoLimpar.addEventListener("click", limparFeitas);

// Se a lista mudar em OUTRA aba, esta aba se atualiza sozinha
window.addEventListener("storage", (e) => {
  if (e.key === CHAVE_TAREFAS) {
    tarefas = carregarTarefas();
    desenhar();
  }
});

// Data bonitinha no topo: "terça-feira, 10 de novembro"
document.getElementById("data-hoje").textContent = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

desenhar();
