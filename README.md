# Painel do Legislativo Web

Versao web do projeto, estruturada para subir sem build pesado em Cloudflare Pages.
Esta pasta `web` e a fonte de verdade do frontend publicado.

## Estrutura

- `index.html`: interface principal
- `styles.css`: visual da aplicacao
- `app.js`: comportamento do frontend
- `functions/api/buscar.js`: endpoint serverless
- `functions/_lib/legislativo.js`: logica de consulta em Camara e Senado

## O que a versao web ja faz

- busca por nome de deputado e/ou senador;
- busca por tema e palavras-chave;
- busca global por tema na Camara e no Senado sem informar nome;
- filtros por sigla, UF, periodo, autoria principal e modo de busca;
- ordenacao client-side dos resultados;
- paginacao client-side;
- painel lateral de detalhe para o item selecionado;
- comparacao entre dois parlamentares usando o mesmo recorte;
- painel analitico com indicadores por status, tipo e temas recorrentes;
- leitura do andamento com resumo de "o que falta acontecer" e "quem pode destravar";
- exportacao CSV no navegador.
- geracao de relatorio em PDF pelo navegador;
- link para tramitacao oficial e para o arquivo original quando disponivel.

## Como publicar no Cloudflare Pages

1. Suba a pasta `web` para um repositorio GitHub.
2. No Cloudflare Pages, crie um projeto novo a partir desse repositorio.
3. Use estas configuracoes:
   - Framework preset: `None`
   - Build command: deixe vazio
   - Build output directory: `.`
   - Root directory: `monitor_parlamentar_federal/web` se o repositorio for a pasta maior
4. Finalize o deploy. O site e a funcao `/api/buscar` sobem juntos.

## Observacoes

- O deploy precisa incluir a pasta `functions`, porque e ela que atende o endpoint `/api/buscar`.
- Abrir o `index.html` direto em `file://` carrega a interface, mas nao executa a busca. Para pesquisar de verdade, use servidor local ou deploy.
- O limite padrao no web e `50`, para equilibrar amplitude de busca e tempo de resposta em ambiente serverless.
- A busca do Senado usa o endpoint oficial de `processo`, o que permite busca ampla por tema sem depender de informar nome.
