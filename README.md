# Monitor Parlamentar Federal Web

Versao web do projeto, estruturada para subir sem build pesado em Cloudflare Pages.

## Estrutura

- `index.html`: interface principal
- `styles.css`: visual da aplicacao
- `app.js`: comportamento do frontend
- `functions/api/buscar.js`: endpoint serverless
- `functions/_lib/legislativo.js`: logica de consulta em Camara e Senado

## O que esse MVP web ja faz

- busca por nome de deputado e/ou senador;
- busca por tema e palavras-chave;
- busca global na Camara sem informar nome;
- filtros por sigla, UF, periodo, autoria principal e modo de busca;
- ordenacao client-side dos resultados;
- paginacao client-side;
- painel lateral de detalhe para o item selecionado;
- buscas salvas no navegador;
- favoritos persistidos no navegador;
- comparacao entre dois parlamentares usando o mesmo recorte;
- painel analitico com indicadores por status, tipo e temas recorrentes;
- graficos leves por grupo comparado, respeitando o modo de favoritos;
- exportacao CSV no navegador.

## Como publicar gratis no Cloudflare Pages

1. Suba a pasta `web` para um repositorio GitHub.
2. No Cloudflare Pages, crie um projeto novo a partir desse repositorio.
3. Use estas configuracoes:
   - Framework preset: `None`
   - Build command: deixe vazio
   - Build output directory: `.`
   - Root directory: `monitor_parlamentar_federal/web` se o repositorio for a pasta maior
4. Finalize o deploy. O site e a funcao `/api/buscar` sobem juntos.

## Observacoes

- A busca global sem nome esta implementada para a Camara.
- No Senado, o recorte tematico funciona quando voce informa o parlamentar.
- O limite padrao no web e menor que no script PowerShell para evitar respostas muito pesadas em ambiente serverless.
