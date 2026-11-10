# ✅ Minhas Tarefas

Lista de tarefas feita com **HTML, CSS e JavaScript puro**, sem framework e sem
biblioteca nenhuma. As tarefas ficam salvas no **localStorage** do navegador,
então continuam lá depois de fechar a aba.


## ✨ Funcionalidades

- Adicionar, concluir e apagar tarefas
- **Editar com duplo clique** (Enter salva, Esc cancela, texto vazio apaga)
- **Filtros:** todas, pendentes e feitas, com contador em cada um
- Barra de progresso e resumo de pendentes
- Botão para limpar todas as feitas de uma vez
- Tudo salvo no `localStorage`, inclusive o filtro escolhido
- O filtro vai para o endereço (`#pendentes`), então dá para compartilhar o link já filtrado
- Sincroniza entre abas: mudou numa, a outra atualiza sozinha
- **Modo escuro** automático, seguindo o sistema
- Responsivo (funciona bem no celular)
- Acessível: navegação por teclado, foco visível e rótulos para leitores de tela

## 🚀 Como rodar

Não precisa instalar nada. Baixe o projeto e abra o `index.html` no navegador.

```bash
git clone https://github.com/SEU-USUARIO/todo-list.git
cd todo-list
# abra o index.html (duplo clique já funciona)
```

## 🧠 O que eu pratiquei

**Estado como fonte da verdade.** Todas as tarefas vivem num array. Qualquer
ação (adicionar, marcar, apagar) altera o array, salva no `localStorage` e
redesenha a lista. A tela nunca é lida para descobrir o estado, o que evita a
interface e os dados ficarem dessincronizados.

```js
function atualizar() {
  salvar();   // array -> localStorage
  desenhar(); // array -> tela
}
```

**Filtros como funções.** Cada filtro é só uma função, então adicionar um novo
é uma linha:

```js
const FILTROS = {
  todas: () => true,
  pendentes: (tarefa) => !tarefa.feita,
  feitas: (tarefa) => tarefa.feita,
};
```

**Outras técnicas:**

- **Delegação de eventos.** Um listener só na lista, em vez de um por tarefa.
  Funciona até para itens criados depois.
- **`<template>`.** O HTML de cada item fica no `index.html` e o JS só clona e preenche.
- **Segurança.** O texto é inserido com `textContent`, nunca com `innerHTML`.
  Digitar `<script>` ou `<img onerror=...>` vira texto comum (sem XSS).
- **localStorage com `try/catch`.** Se o JSON estiver corrompido ou o
  navegador bloquear o armazenamento, o app continua funcionando.
- **Variáveis CSS.** As cores ficam num lugar só, e o modo escuro é apenas um
  `@media (prefers-color-scheme: dark)` trocando essas variáveis.

## 🌐 Publicando no GitHub Pages

1. Suba o projeto para um repositório chamado `todo-list`.
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`. Salve.
4. Em um ou dois minutos o site estará em `https://SEU-USUARIO.github.io/todo-list/`.
5. Troque o `SEU-USUARIO` deste README pelo seu usuário.

## 📁 Estrutura

```
todo-list/
├── index.html      # estrutura da página e o <template> de cada tarefa
├── style.css       # visual, modo escuro e responsividade
├── script.js       # estado, localStorage, filtros e eventos
└── screenshot.png  # imagem usada neste README
```

## 🛣️ Ideias para depois

- [ ] Arrastar e soltar para reordenar
- [ ] Data de entrega e destaque para tarefas atrasadas
- [ ] Categorias ou etiquetas com cores
- [ ] Exportar e importar as tarefas em JSON

