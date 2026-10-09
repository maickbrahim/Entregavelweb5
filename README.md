# Mini Projeto — Consumo de APIs e DOM Dinâmico

Projeto do Curso TechX com JavaScript assíncrono (Promises, `async/await`, Fetch API) e manipulação dinâmica do DOM.

## Conteúdo

- **Parte 1:** validação, filtro e soma de pedidos (`filter`, `reduce`, `toFixed`).
- **Parte 2:** Buscador de CEP com a API ViaCEP, tratando os 4 estados da tela (Carregando, Erro, Vazio, Sucesso), com histórico de buscas e timeout de 5s (`AbortSignal.timeout`).
- **Parte 3:** Mini Pokédex com a PokéAPI (nome, imagem e tipos), também com os 4 estados.

## Como executar

1. Baixe ou clone o repositório.
2. Abra o `index.html` no navegador (ou use a extensão Live Server do VS Code).
3. Abra o console (F12) para ver os resultados da Parte 1.

## Parte 4 — Reflexão

**Por que `Promise.all` pode ser mais rápido que vários `await` seguidos?**

Com `await` em sequência, o código espera a primeira Promise resolver antes de iniciar a próxima. Se cada requisição leva 1 segundo, três requisições levam cerca de 3 segundos no total.

Com `Promise.all`, todas as requisições são disparadas ao mesmo tempo (em paralelo) e o código espera todas terminarem juntas. O tempo total fica próximo ao da requisição mais lenta (cerca de 1 segundo no exemplo), aproveitando melhor o tempo de rede.

```js
// Sequencial: ~3s
const a = await fetch(urlA);
const b = await fetch(urlB);
const c = await fetch(urlC);

// Paralelo: ~1s
const [a, b, c] = await Promise.all([fetch(urlA), fetch(urlB), fetch(urlC)]);
```

> Observação: só vale usar `Promise.all` quando as requisições são **independentes** (uma não precisa do resultado da outra).

## Boas práticas aplicadas

- `e.preventDefault()` nos formulários.
- Verificação de `response.ok` (o `fetch` não rejeita em erros HTTP).
- `createElement` + `textContent` em vez de `innerHTML` (evita XSS).
- `finally` para reabilitar o botão em qualquer cenário.
