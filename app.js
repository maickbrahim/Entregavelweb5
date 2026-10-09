/* =====================================================
   FUNÇÕES AUXILIARES (usadas nas partes 2 e 3)
   ===================================================== */

// Mostra uma mensagem de status. tipo: "", "carregando" ou "erro"
function setStatus(elemento, mensagem, tipo = "") {
  elemento.textContent = mensagem;
  elemento.className = "status " + tipo;
}

/* =====================================================
   PARTE 1 — MANIPULAÇÃO E VALIDAÇÃO DE DADOS
   ===================================================== */

const pedidos = [
  { id: 1, cliente: "Bia",  valor: 120,   status: "pago" },
  { id: 2, cliente: "",     valor: 50,    status: "pago" },      // inválido: cliente vazio
  { id: 3, cliente: "Caio", valor: -10,   status: "pago" },      // inválido: valor <= 0
  { id: 4, cliente: "Dani", valor: 200.5, status: "pendente" },  // válido, mas não pago
  { id: 5, cliente: "Edu",  valor: 80,    status: "pago" },
  { id: 6, cliente: "Fê",   valor: "abc", status: "pago" },      // inválido: valor não numérico
];

// 1) Validação: cliente não vazio e valor numérico > 0
function pedidoValido(pedido) {
  const clienteOk =
    typeof pedido.cliente === "string" && pedido.cliente.trim() !== "";
  const valorOk =
    typeof pedido.valor === "number" &&
    Number.isFinite(pedido.valor) &&
    pedido.valor > 0;
  return clienteOk && valorOk;
}

const pedidosValidos = pedidos.filter(pedidoValido);

// 2) Apenas os pagos
const pedidosPagos = pedidosValidos.filter((p) => p.status === "pago");

// 3) Total faturado com reduce
const totalFaturado = pedidosPagos.reduce((acc, p) => acc + p.valor, 0);

// 4) Textos no formato "Bia — R$ 120.00"
const textosPedidos = pedidosPagos.map(
  (p) => `${p.cliente} — R$ ${p.valor.toFixed(2)}`
);

console.log("Pedidos válidos:", pedidosValidos);
console.log("Pedidos pagos:", pedidosPagos);
console.log("Total faturado:", `R$ ${totalFaturado.toFixed(2)}`);
console.log("Textos:", textosPedidos);

// Mostrar na página (sem innerHTML)
document.getElementById("total-faturado").textContent =
  `R$ ${totalFaturado.toFixed(2)}`;

const listaPedidos = document.getElementById("lista-pedidos");
textosPedidos.forEach((texto) => {
  const li = document.createElement("li");
  li.textContent = texto;
  listaPedidos.appendChild(li);
});

/* =====================================================
   PARTE 2 — BUSCADOR DE CEP
   ===================================================== */

const formCep = document.getElementById("form-cep");
const inputCep = document.getElementById("cep");
const btnCep = document.getElementById("btn-cep");
const statusCep = document.getElementById("status-cep");
const resultadoCep = document.getElementById("resultado-cep");
const historicoCepUl = document.getElementById("historico-cep");

// Bônus: histórico em array de objetos
const historicoCeps = [];

// Limpa (trim) e remove hífen/pontos opcionais; depois valida com regex
function limparCep(valor) {
  return valor.trim().replace(/[-.\s]/g, "");
}

function cepValido(cep) {
  return /^\d{8}$/.test(cep); // apenas dígitos e exatamente 8
}

function mostrarEnderecoCep(dados) {
  resultadoCep.replaceChildren(); // limpa o resultado anterior

  const campos = [
    ["Rua", dados.logradouro],
    ["Bairro", dados.bairro],
    ["Cidade", dados.localidade],
    ["UF", dados.uf],
  ];

  campos.forEach(([rotulo, valor]) => {
    const dt = document.createElement("dt");
    dt.textContent = rotulo;
    const dd = document.createElement("dd");
    dd.textContent = valor || "—"; // alguns CEPs não têm rua/bairro
    resultadoCep.append(dt, dd);
  });
}

function renderizarHistorico() {
  historicoCepUl.replaceChildren();
  historicoCeps.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.cep} — ${item.resumo}`;
    historicoCepUl.appendChild(li);
  });
}

async function buscarCep(cep) {
  // ESTADO: carregando
  setStatus(statusCep, "Buscando...", "carregando");
  btnCep.disabled = true;
  resultadoCep.replaceChildren();

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000), // desafio extra: timeout de 5s
    });

    // fetch NÃO rejeita em erro HTTP, então checamos manualmente
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const dados = await response.json();

    // ESTADO: vazio / não encontrado (a ViaCEP responde 200 com { erro: true })
    if (dados.erro) {
      setStatus(statusCep, "CEP não encontrado");
      historicoCeps.push({ cep, resumo: "não encontrado" });
      renderizarHistorico();
      return;
    }

    // ESTADO: sucesso
    mostrarEnderecoCep(dados);
    setStatus(statusCep, ""); // limpa o aviso
    historicoCeps.push({
      cep,
      resumo: `${dados.localidade}/${dados.uf}`,
    });
    renderizarHistorico();
  } catch (erro) {
    // ESTADO: erro (rede, timeout ou HTTP)
    console.error(erro);
    if (erro.name === "TimeoutError") {
      setStatus(statusCep, "A busca demorou demais. Tente novamente.", "erro");
    } else {
      setStatus(
        statusCep,
        "Falha na conexão. Verifique sua internet e tente novamente.",
        "erro"
      );
    }
  } finally {
    btnCep.disabled = false; // sempre reabilita o botão
  }
}

formCep.addEventListener("submit", (e) => {
  e.preventDefault(); // evita recarregar a página

  const cep = limparCep(inputCep.value);

  if (!cepValido(cep)) {
    resultadoCep.replaceChildren();
    setStatus(statusCep, "CEP inválido: digite exatamente 8 números.", "erro");
    return;
  }

  buscarCep(cep);
});

/* =====================================================
   PARTE 3 — DESAFIO MINI POKÉDEX
   ===================================================== */

const formPokemon = document.getElementById("form-pokemon");
const inputPokemon = document.getElementById("pokemon");
const btnPokemon = document.getElementById("btn-pokemon");
const statusPokemon = document.getElementById("status-pokemon");
const resultadoPokemon = document.getElementById("pokemon-resultado");

function mostrarPokemon(dados) {
  resultadoPokemon.replaceChildren();

  const nome = document.createElement("h3");
  nome.textContent = dados.name;

  const img = document.createElement("img");
  img.src = dados.sprites.front_default || "";
  img.alt = `Imagem do Pokémon ${dados.name}`;

  const tipos = document.createElement("p");
  const listaTipos = dados.types.map((t) => t.type.name).join(", ");
  tipos.textContent = `Tipos: ${listaTipos}`;

  resultadoPokemon.append(nome, img, tipos);
}

async function buscarPokemon(nome) {
  // ESTADO: carregando
  setStatus(statusPokemon, "Buscando...", "carregando");
  btnPokemon.disabled = true;
  resultadoPokemon.replaceChildren();

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    // ESTADO: vazio (404 = Pokémon não existe)
    if (response.status === 404) {
      setStatus(statusPokemon, "Pokémon não encontrado");
      return;
    }

    // Outros erros HTTP (500, 503...)
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const dados = await response.json();

    // ESTADO: sucesso
    mostrarPokemon(dados);
    setStatus(statusPokemon, "");
  } catch (erro) {
    // ESTADO: erro (rede, timeout ou HTTP)
    console.error(erro);
    setStatus(
      statusPokemon,
      "Falha na conexão. Tente novamente em instantes.",
      "erro"
    );
  } finally {
    btnPokemon.disabled = false;
  }
}

formPokemon.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = inputPokemon.value.trim().toLowerCase();

  if (nome === "") {
    resultadoPokemon.replaceChildren();
    setStatus(statusPokemon, "Digite o nome de um Pokémon.", "erro");
    return;
  }

  buscarPokemon(nome);
});
