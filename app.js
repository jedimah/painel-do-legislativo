const STORAGE_KEYS = {
  draft: "monitor-parlamentar-web",
  savedSearches: "monitor-parlamentar-web:saved-searches",
  favorites: "monitor-parlamentar-web:favorites"
};

const form = document.querySelector("#search-form");
const submitButton = document.querySelector("#submit-button");
const saveSearchButton = document.querySelector("#save-search-button");
const clearButton = document.querySelector("#clear-button");
const exportButton = document.querySelector("#export-button");
const reportPdfButton = document.querySelector("#report-pdf-button");
const advancedToggleButton = document.querySelector("#advanced-toggle");
const favoritesFilterButton = document.querySelector("#favorites-filter-button");
const statusBanner = document.querySelector("#status-banner");
const warningStack = document.querySelector("#warning-stack");
const assistantPanel = document.querySelector("#assistant-panel");
const resultsBody = document.querySelector("#results-body");
const activeQuery = document.querySelector("#active-query");
const summaryTotal = document.querySelector("#summary-total");
const summaryCamara = document.querySelector("#summary-camara");
const summarySenado = document.querySelector("#summary-senado");
const summaryStatus = document.querySelector("#summary-status");
const resultsMeta = document.querySelector("#results-meta");
const detailPanel = document.querySelector("#detail-panel");
const sortSelect = document.querySelector("#sort-select");
const pageSizeSelect = document.querySelector("#page-size-select");
const prevPageButton = document.querySelector("#prev-page-button");
const nextPageButton = document.querySelector("#next-page-button");
const paginationInfo = document.querySelector("#pagination-info");
const comparisonPanel = document.querySelector("#comparison-panel");
const comparisonGrid = document.querySelector("#comparison-grid");
const analyticsPanel = document.querySelector("#analytics-panel");
const analyticsKpiGrid = document.querySelector("#analytics-kpi-grid");
const analyticsStatusGroups = document.querySelector("#analytics-status-groups");
const analyticsTypeGroups = document.querySelector("#analytics-type-groups");
const analyticsThemeGroups = document.querySelector("#analytics-theme-groups");
const savedSearchesList = document.querySelector("#saved-searches-list");
const savedSearchesCount = document.querySelector("#saved-searches-count");
const favoritesList = document.querySelector("#favorites-list");
const favoritesCount = document.querySelector("#favorites-count");
const exampleButtons = document.querySelectorAll("[data-example]");
const quickFillButtons = document.querySelectorAll("[data-quick-fill]");
const siglaPicker = document.querySelector("#sigla-picker");
const siglaPickerTitle = document.querySelector("#sigla-picker-title");
const siglaPickerMeta = document.querySelector("#sigla-picker-meta");
const siglaCommonList = document.querySelector("#sigla-common-list");
const siglaExtraList = document.querySelector("#sigla-extra-list");
const siglaSelectCommonButton = document.querySelector("#sigla-select-common");
const siglaSelectAllButton = document.querySelector("#sigla-select-all");
const siglaClearAllButton = document.querySelector("#sigla-clear-all");

const DEFAULT_FORM_VALUES = {
  nome: "",
  compararNome: "",
  busca: "",
  casa: "Ambas",
  modoBusca: "Todas",
  siglas: "",
  uf: "",
  anoInicial: "",
  anoFinal: "",
  limite: "50",
  somenteAutorPrincipal: false,
  semDetalhes: false
};

const EXAMPLES = {
  sargento: {
    nome: "Sargento Portugal",
    compararNome: "",
    busca: "seguranca publica",
    casa: "Ambas",
    siglas: "",
    limite: "50",
    modoBusca: "Todas",
    uf: "",
    anoInicial: "",
    anoFinal: "",
    somenteAutorPrincipal: false,
    semDetalhes: false
  },
  tema: {
    nome: "",
    compararNome: "",
    busca: "seguranca publica",
    casa: "Ambas",
    siglas: "",
    limite: "50",
    modoBusca: "Qualquer",
    uf: "",
    anoInicial: "",
    anoFinal: "",
    somenteAutorPrincipal: false,
    semDetalhes: false
  }
};

const SIGLA_COMMON_TYPES = [
  { code: "PEC", label: "Proposta de Emenda a Constituicao" },
  { code: "PLP", label: "Projeto de Lei Complementar" },
  { code: "PL", label: "Projeto de Lei" },
  { code: "MPV", label: "Medida Provisoria" },
  { code: "PLV", label: "Projeto de Lei de Conversao" },
  { code: "PDL", label: "Projeto de Decreto Legislativo" },
  { code: "PRC", label: "Projeto de Resolucao" },
  { code: "REQ", label: "Requerimento" },
  { code: "RIC", label: "Requerimento de Informacao" },
  { code: "RCP", label: "Requerimento de Instituicao de CPI" },
  { code: "MSC", label: "Mensagem" },
  { code: "INC", label: "Indicacao" }
];

const SIGLA_OTHER_TYPES = [
  { code: "AA", label: "Autografo" },
  { code: "ADD", label: "Adendo" },
  { code: "AJECN", label: "Ajuste de Emenda Orcamentaria (CN)" },
  { code: "ANEXO", label: "Anexo" },
  { code: "APJ", label: "Anteprojeto" },
  { code: "ATACN", label: "Ata (CN)" },
  { code: "ATC", label: "Ato Convocatorio" },
  { code: "AV", label: "Aviso" },
  { code: "AVN", label: "Aviso (CN)" },
  { code: "CAC", label: "Comunicado de Alteracao do Controle Societario" },
  { code: "CAE", label: "Relatorio do CAE" },
  { code: "CCN", label: "Consulta do Congresso Nacional" },
  { code: "CFIS", label: "Relatorio de Atividades do Comite de Avaliacao, Fiscalizacao e Controle de Execucao Orcamentaria" },
  { code: "CMC", label: "Comunicacao de Medida Cautelar" },
  { code: "COI", label: "Relatorio do COI" },
  { code: "CON", label: "Consulta" },
  { code: "CVO", label: "Complementacao de Voto" },
  { code: "CVR", label: "Contestacao ao Voto do Relator" },
  { code: "DCR", label: "Denuncia por Crime de Responsabilidade" },
  { code: "DEC", label: "Decisao" },
  { code: "DEN", label: "Denuncia" },
  { code: "DOC", label: "Oficio da Primeira-Secretaria" },
  { code: "DOCCPI", label: "Documento de CPI" },
  { code: "DTN", label: "Destaque (CN)" },
  { code: "DTQ", label: "Destaque" },
  { code: "DVT", label: "Declaracao de Voto" },
  { code: "ECN", label: "Emenda (CN)" },
  { code: "EMA", label: "Emenda Aglutinativa" },
  { code: "EMC", label: "Emenda na Comissao" },
  { code: "EMC-A", label: "Emenda Adotada pela Comissao" },
  { code: "EMD", label: "Emenda" },
  { code: "EML", label: "Emenda a LDO" },
  { code: "EMO", label: "Emenda ao Orcamento" },
  { code: "EMP", label: "Emenda de Plenario" },
  { code: "EMPV", label: "Emenda a Medida Provisoria (CN)" },
  { code: "EMR", label: "Emenda de Relator" },
  { code: "EMRP", label: "Emenda de Relator Parcial" },
  { code: "EMS", label: "Emenda/Substitutivo do Senado" },
  { code: "EPP", label: "Emenda ao Plano Plurianual" },
  { code: "ERD", label: "Emenda de Redacao" },
  { code: "ERD-A", label: "Emenda de Redacao Adotada" },
  { code: "ERR", label: "Errata" },
  { code: "ESB", label: "Emenda ao Substitutivo" },
  { code: "ESP", label: "Emenda Substitutiva de Plenario" },
  { code: "INA", label: "Indicacao de Autoridade" },
  { code: "MAD", label: "Manifestacao do(a) Denunciado(a)" },
  { code: "MCN", label: "Mensagem (CN)" },
  { code: "MIP", label: "Minuta de Proposicao Legislativa" },
  { code: "MMP", label: "Mensagem (MPU)" },
  { code: "MSF", label: "Mensagem (SF)" },
  { code: "MSG", label: "Mensagem (SF)" },
  { code: "MST", label: "Mensagem (STF)" },
  { code: "MTC", label: "Mensagem (TCU)" },
  { code: "NIC", label: "Norma Interna" },
  { code: "OBJ", label: "Objeto de Deliberacao" },
  { code: "OF", label: "Oficio Externo" },
  { code: "OFM", label: "Oficio a Mesa" },
  { code: "OFN", label: "Oficio (CN)" },
  { code: "OFS", label: "Oficio do Senado Federal" },
  { code: "PAR", label: "Parecer de Comissao" },
  { code: "PARF", label: "Parecer de Comissao para Redacao Final" },
  { code: "PDN", label: "Projeto de Decreto Legislativo (CN)" },
  { code: "PDS", label: "Projeto de Decreto Legislativo (SF)" },
  { code: "PEP", label: "Parecer as Emendas de Plenario" },
  { code: "PES", label: "Parecer as Emendas Apresentadas ao Substitutivo do Relator" },
  { code: "PET", label: "Peticao" },
  { code: "PFC", label: "Proposta de Fiscalizacao e Controle" },
  { code: "PIN", label: "Proposta de Instrucao Normativa" },
  { code: "PLC", label: "Projeto de Lei da Camara dos Deputados (SF)" },
  { code: "PLN", label: "Projeto de Lei (CN)" },
  { code: "PLS", label: "Projeto de Lei do Senado Federal" },
  { code: "PPP", label: "Parecer Proferido em Plenario" },
  { code: "PPR", label: "Parecer Reformulado de Plenario" },
  { code: "PRF", label: "Projeto de Resolucao do Senado Federal" },
  { code: "PRL", label: "Parecer do Relator" },
  { code: "PRLE", label: "Parecer Preliminar as Emendas de Plenario" },
  { code: "PRLP", label: "Parecer Preliminar de Plenario" },
  { code: "PRN", label: "Projeto de Resolucao do Congresso Nacional" },
  { code: "PRO", label: "Proposta" },
  { code: "PRP", label: "Parecer do Relator Parcial" },
  { code: "PRR", label: "Parecer Reformulado" },
  { code: "PRST", label: "Parecer a Redacao para o Segundo Turno" },
  { code: "PRV", label: "Parecer Vencedor" },
  { code: "PRVP", label: "Proposta de Redacao do Vencido em Primeiro Turno" },
  { code: "PSS", label: "Parecer as Emendas ou ao Substitutivo do Senado" },
  { code: "QO", label: "Questao de Ordem" },
  { code: "R.C", label: "Recurso do Congresso Nacional" },
  { code: "RAT", label: "Relatorio Setorial" },
  { code: "RCEL", label: "Relatorio de Comissao de Estudo Legislativo" },
  { code: "RCEX", label: "Relatorio de Comissao Externa" },
  { code: "RDF", label: "Redacao Final" },
  { code: "RDV", label: "Redacao do Vencido" },
  { code: "REC", label: "Recurso" },
  { code: "REL", label: "Relatorio" },
  { code: "REL-A", label: "Relatorio Adotado pela Comissao" },
  { code: "REM", label: "Reclamacao" },
  { code: "REP", label: "Representacao" },
  { code: "RGT", label: "Relatorio de Grupo de Trabalho" },
  { code: "RIN", label: "Requerimento de Resolucao Interna" },
  { code: "RLF", label: "Relatorio Final" },
  { code: "RLP", label: "Relatorio Previo" },
  { code: "RLP(R)", label: "Relatorio Previo Reformulado" },
  { code: "RLP(V)", label: "Relatorio Previo Vencedor" },
  { code: "RPA", label: "Relatorio Parcial" },
  { code: "RPD", label: "Requerimento Procedimental de Sessao/Reuniao" },
  { code: "RPDR", label: "Votacao Nominal do Requerimento Procedimental Generico" },
  { code: "RPL", label: "Relatorio Preliminar" },
  { code: "RPLE", label: "Relatorio Preliminar Apresentado com Emendas" },
  { code: "RPLOA", label: "Relatorio Preliminar" },
  { code: "RRC", label: "Relatorio de Receita" },
  { code: "RRL", label: "Relatorio do Relator (CMO)" },
  { code: "RRR", label: "Relatorio Reformulado" },
  { code: "RST", label: "Redacao para o Segundo Turno" },
  { code: "RVC", label: "Relatorio Vencedor" },
  { code: "SAP", label: "Sustacao de Andamento de Acao Penal" },
  { code: "SBE", label: "Subemenda" },
  { code: "SBE-A", label: "Subemenda Adotada pela Comissao" },
  { code: "SBR", label: "Subemenda de Relator" },
  { code: "SBT", label: "Substitutivo" },
  { code: "SBT-A", label: "Substitutivo adotado pela Comissao" },
  { code: "SIP", label: "Solicitacao para instauracao de processo" },
  { code: "SIT", label: "Solicitacao de Informacao ao TCU" },
  { code: "SLD", label: "Sugestao de Emenda a LDO - Comissoes" },
  { code: "SOR", label: "Sugestao de Emenda ao Orcamento - Comissoes" },
  { code: "SPP", label: "Sugestao de Emenda ao PPA - Comissoes" },
  { code: "SPP-R", label: "Sugestao de Emenda ao PPA - revisao (Comissoes)" },
  { code: "SRL", label: "Sugestao de Emenda a Relatorio" },
  { code: "SSP", label: "Subemenda Substitutiva de Plenario" },
  { code: "SUC", label: "Sugestao a Projeto de Consolidacao de Leis" },
  { code: "SUG", label: "Sugestao" },
  { code: "SUM", label: "Sumula" },
  { code: "TER", label: "Termo de Implementacao" },
  { code: "TVR", label: "Ato de Concessao e Renovacao de Concessao de Emissora de Radio e Televisao" },
  { code: "VTS", label: "Voto em Separado" }
];

const ALL_SIGLA_TYPES = [...SIGLA_COMMON_TYPES, ...SIGLA_OTHER_TYPES];
const SIGLA_LABELS = new Map(ALL_SIGLA_TYPES.map((item) => [item.code, item.label]));

const ADVANCED_FIELDS = [
  "compararNome",
  "siglas",
  "uf",
  "anoInicial",
  "anoFinal",
  "limite",
  "somenteAutorPrincipal",
  "semDetalhes"
];

const THEME_STOPWORDS = new Set([
  "ante",
  "apos",
  "artigo",
  "artigos",
  "autoria",
  "autoriza",
  "camara",
  "codigo",
  "comissao",
  "comissoes",
  "contra",
  "correlatas",
  "cria",
  "criam",
  "criar",
  "da",
  "das",
  "de",
  "delibera",
  "deputada",
  "deputadas",
  "deputado",
  "deputados",
  "dispoe",
  "dos",
  "e",
  "ela",
  "elas",
  "ele",
  "eles",
  "em",
  "entre",
  "estabelece",
  "esta",
  "este",
  "fica",
  "ficam",
  "forma",
  "federal",
  "institui",
  "materia",
  "materias",
  "medida",
  "medidas",
  "nacional",
  "normas",
  "nos",
  "nova",
  "novo",
  "outras",
  "para",
  "pelas",
  "pelos",
  "pela",
  "pelo",
  "permite",
  "poder",
  "prevista",
  "previstas",
  "previsto",
  "previstos",
  "projeto",
  "proposicao",
  "proposicoes",
  "providencia",
  "providencias",
  "publica",
  "que",
  "regulamenta",
  "republica",
  "senado",
  "senador",
  "senadora",
  "sobre",
  "suas",
  "seus",
  "tera",
  "tramitacao",
  "uma",
  "umas",
  "uns"
]);

let lastPayload = null;
let uiState = {
  sort: sortSelect.value,
  pageSize: Number(pageSizeSelect.value),
  currentPage: 1,
  selectedKey: null,
  showFavoritesOnly: false
};

function setStatus(message, hidden = false) {
  statusBanner.textContent = message;
  statusBanner.classList.toggle("is-hidden", hidden);
}

function clearWarnings() {
  warningStack.innerHTML = "";
}

function getApiUnavailableMessage() {
  if (window.location.protocol === "file:") {
    return "A busca precisa do endpoint /api/buscar ativo. Esse HTML aberto direto do computador nao consegue chamar a pasta functions sozinho.";
  }

  return "Nao consegui falar com /api/buscar. Se a interface abriu mas a busca nao roda, o deploy pode estar sem a pasta functions ou sem suporte a Pages Functions.";
}

function renderWarnings(warnings = []) {
  clearWarnings();
  warnings.forEach((warning) => {
    const item = document.createElement("div");
    item.className = "warning-item";
    item.textContent = warning;
    warningStack.appendChild(item);
  });
}

function buildAssistantActions(payload) {
  const query = payload?.query || {};
  const actions = [];
  const hasRestrictiveFilters = Boolean(
    query.siglas?.length ||
    query.siglas ||
    query.uf ||
    query.anoInicial ||
    query.anoFinal ||
    query.somenteAutorPrincipal
  );

  if (query.nome && query.casa === "Ambas") {
    actions.push({ id: "house-camara", label: "Tentar so Camara" });
    actions.push({ id: "house-senado", label: "Tentar so Senado" });
  }

  if (query.busca && query.modoBusca !== "Qualquer") {
    actions.push({ id: "mode-any", label: "Buscar com qualquer palavra" });
  }

  if (query.anoInicial || query.anoFinal) {
    actions.push({ id: "clear-years", label: "Ampliar periodo" });
  }

  if (hasRestrictiveFilters) {
    actions.push({ id: "clear-filters", label: "Limpar filtros pesados" });
  }

  if (!query.nome && query.busca && query.casa !== "Ambas") {
    actions.push({ id: "house-ambas", label: "Buscar nas duas casas" });
  }

  return actions.slice(0, 3);
}

function renderAssistantPanel(payload) {
  if (!assistantPanel) {
    return;
  }

  const query = payload?.query || {};
  const hasQuery = Boolean(query.nome || query.busca);
  const total = payload?.total || 0;
  const hasRestrictiveFilters = Boolean(
    query.siglas?.length ||
    query.siglas ||
    query.uf ||
    query.anoInicial ||
    query.anoFinal ||
    query.somenteAutorPrincipal
  );
  const shouldShow = hasQuery && (total === 0 || (total <= 2 && hasRestrictiveFilters));

  if (!shouldShow) {
    assistantPanel.classList.add("is-hidden");
    assistantPanel.innerHTML = "";
    return;
  }

  const actions = buildAssistantActions(payload);
  const title = total === 0
    ? "Nada apareceu nesse recorte ainda."
    : "Esse recorte pode estar fechado demais.";
  const copy = total === 0
    ? "A busca continua muito fechada para esse tema. Tente um dos atalhos abaixo antes de desistir do recorte."
    : `Encontramos ${total} item(ns), mas alguns filtros podem estar cortando projetos relevantes. Vale ampliar antes de concluir a analise.`;
  const warningMarkup = (payload?.warnings || []).slice(0, 2).map((warning) => `
    <li>${escapeHtml(warning)}</li>
  `).join("");

  assistantPanel.classList.remove("is-hidden");
  assistantPanel.innerHTML = `
    <div class="assistant-card">
      <div class="assistant-copy">
        <p class="eyebrow">Ajuste rapido</p>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(copy)}</p>
        ${warningMarkup ? `<ul class="assistant-notes">${warningMarkup}</ul>` : ""}
      </div>
      <div class="assistant-actions">
        ${actions.map((action) => `
          <button class="mini-button assistant-button" type="button" data-assistant-action="${escapeHtml(action.id)}">
            ${escapeHtml(action.label)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function updateSummary(payload) {
  summaryTotal.textContent = payload.total ?? 0;
  summaryCamara.textContent = payload.counts?.Camara ?? 0;
  summarySenado.textContent = payload.counts?.Senado ?? 0;
  summaryStatus.textContent = payload.counts?.comStatus ?? 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncate(value, maxLength = 180) {
  if (!value) {
    return "";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function normalizeMatchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(value, terms) {
  const haystack = normalizeMatchText(value);
  return terms.some((term) => haystack.includes(normalizeMatchText(term)));
}

function getStatusSummary(item) {
  const status = item.situacaoAtual || "";
  const andamento = item.ultimoAndamento || "";
  const local = item.localAtual || "";

  if (includesAny(status, ["pronta para pauta", "ordem do dia", "pronto para pauta"])) {
    return {
      phase: "Pronta para votacao",
      note: "Boa para comunicar como pauta madura, porque ja passou da etapa inicial e pode entrar em deliberacao."
    };
  }

  if (includesAny(status, ["aguardando parecer", "designacao de relator", "relator"])) {
    return {
      phase: "Em comissao ou relatoria",
      note: "Boa para briefing legislativo: o projeto esta andando, mas ainda depende de parecer ou relatoria."
    };
  }

  if (includesAny(status, ["aguardando despacho", "recebimento", "apresentacao"])) {
    return {
      phase: "Fase inicial",
      note: "Material de apresentacao: o projeto existe e tem protocolo, mas ainda esta no comeco da tramitacao."
    };
  }

  if (includesAny(status, ["tramitando em conjunto", "apensad"])) {
    return {
      phase: "Tramitacao conjunta",
      note: "Pede leitura cuidadosa: o projeto segue junto de outros textos e o impacto politico pode estar diluido."
    };
  }

  if (includesAny(status, ["devolvida", "arquivad", "encerrad"])) {
    return {
      phase: "Andamento travado ou encerrado",
      note: "Melhor usar como historico ou contexto, nao como pauta quente do momento."
    };
  }

  if (includesAny(andamento, ["parecer", "relator"]) || includesAny(local, ["ccj", "comissao", "plenario"])) {
    return {
      phase: "Andamento relevante",
      note: "Ha sinal de tramitacao institucional, o que ajuda a sustentar um recorte de acompanhamento."
    };
  }

  return {
    phase: "Sem leitura automatica forte",
    note: "Vale abrir o andamento oficial para confirmar o melhor angulo de comunicacao."
  };
}

function getActionGuide(item) {
  const status = item.situacaoAtual || "";
  const andamento = item.ultimoAndamento || "";
  const local = item.localAtual || "";
  const combined = [status, andamento, local].filter(Boolean).join(" ");

  if (!combined.trim()) {
    return {
      stage: "Sem sinal automatico forte",
      next: "Abra a tramitacao oficial para confirmar qual foi o ultimo movimento relevante.",
      who: "A cobranca deve mirar o orgao em que o texto aparece agora e quem pauta essa etapa.",
      action: "Use o painel como triagem e confirme no link oficial o ponto exato de pressao."
    };
  }

  if (includesAny(combined, ["arquivad", "encerrad", "prejudicad", "devolvid", "retirad"])) {
    return {
      stage: "Andamento encerrado ou travado",
      next: "Hoje nao aparece uma etapa decisiva ativa para esse texto.",
      who: "Se a ideia for retomar o tema, a pressao costuma migrar para desarquivamento, reapresentacao ou um novo projeto.",
      action: "Vale usar este item como historico, contexto politico ou base para comparar narrativas."
    };
  }

  if (includesAny(combined, ["sancao", "promulgad", "veto", "norma gerada", "lei"])) {
    return {
      stage: "Fase final ou pos-aprovacao",
      next: "A parte legislativa principal parece superada ou muito avancada.",
      who: "A cobranca faz mais sentido na sancao, na regulamentacao, na implementacao ou na resposta a eventual veto.",
      action: "Bom recorte para comunicar resultado concreto e o que ainda falta para virar efeito pratico."
    };
  }

  if (includesAny(combined, ["apensad", "tramitando em conjunto", "tramita em conjunto"])) {
    return {
      stage: "Tramitacao conjunta",
      next: "O avanco depende do texto principal ao qual esta materia foi anexada ou vinculada.",
      who: "A cobranca precisa mirar a relatoria, a presidencia do colegiado e a pauta do projeto principal.",
      action: "Antes de cobrar, vale abrir a tramitacao oficial e identificar qual proposicao passou a comandar o rito."
    };
  }

  if (includesAny(combined, ["ordem do dia", "pronta para pauta", "pronto para pauta", "plenario", "plen"])) {
    return {
      stage: "Perto de votacao",
      next: "Falta entrar em pauta e ser votado no colegiado ou no plenario correspondente.",
      who: "A cobranca pesa mais na presidencia que pauta, nas liderancas e nos parlamentares que votam essa fase.",
      action: "Aqui a pressao funciona melhor em quem define agenda e em quem decide o voto."
    };
  }

  if (includesAny(combined, ["relator", "relatoria", "parecer", "comissao", "ccj", "cas", "cae", "csp", "ce", "cct", "ci", "cdh", "ccdd", "cre", "cra", "cma", "ceesp"])) {
    return {
      stage: "Etapa de comissao ou relatoria",
      next: "O texto ainda precisa de parecer, leitura em colegiado e/ou votacao na comissao em que esta parado.",
      who: "A cobranca deve olhar para relatoria, presidencia da comissao e membros do colegiado que votam essa fase.",
      action: "Se o local atual estiver identificado, use esse colegiado como referencia para orientar a pressao."
    };
  }

  if (includesAny(combined, ["aguardando despacho", "apresentad", "recebiment", "protocolo", "distribuicao"])) {
    return {
      stage: "Fase inicial",
      next: "O projeto ainda precisa de distribuicao, despacho e definicao do rito inicial.",
      who: "Nessa fase, a cobranca pesa mais sobre a conducao da Casa e a definicao da etapa seguinte.",
      action: "Bom para mostrar que o texto existe, mas ainda nao virou pauta madura de votacao."
    };
  }

  return {
    stage: "Tramitacao em andamento",
    next: "Ha movimentacao registrada, mas vale abrir a tramitacao oficial para confirmar o proximo passo institucional.",
    who: "A cobranca deve mirar o orgao em que a materia aparece agora e quem pauta ou relata essa fase.",
    action: "Use o painel como leitura rapida e confirme o ponto exato de pressao no andamento oficial."
  };
}

function formatDateHuman(value) {
  if (!value) {
    return "Nao informada";
  }

  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function statusMarkup(value) {
  if (!value) {
    return '<span class="status-pill">Sem detalhamento</span>';
  }

  return `<span class="status-pill">${escapeHtml(value)}</span>`;
}

function parseDateValue(value) {
  if (!value) {
    return 0;
  }

  const normalized = String(value).replace(" ", "T");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getActivityTimestamp(item) {
  return (
    parseDateValue(item.dataSituacao) ||
    parseDateValue(item.dataUltimoAndamento) ||
    parseDateValue(item.dataApresentacao) ||
    0
  );
}

function compareText(left, right) {
  return String(left ?? "").localeCompare(String(right ?? ""), "pt-BR", {
    sensitivity: "base",
    numeric: true
  });
}

function safeJsonParse(raw, fallback) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getSavedSearches() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.savedSearches), []);
}

function setSavedSearches(entries) {
  localStorage.setItem(STORAGE_KEYS.savedSearches, JSON.stringify(entries));
}

function getFavoritesMap() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.favorites), {});
}

function setFavoritesMap(map) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(map));
}

function getFavoriteId(item) {
  return item.linkApi || item.link || item._key;
}

function getItemKey(item, index) {
  return item.linkApi || item.link || `${item.casa || "item"}-${item.identificacao || item.tipo || "sem-id"}-${index}`;
}

function computeCounts(items = []) {
  return {
    Camara: items.filter((item) => item.casa === "Camara").length,
    Senado: items.filter((item) => item.casa === "Senado").length,
    comStatus: items.filter((item) => item.situacaoAtual).length,
    autorPrincipal: items.filter((item) => item.autorPrincipal === true).length
  };
}

function formatShare(count, total) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function incrementCount(counter, key) {
  if (!key) {
    return;
  }

  counter.set(key, (counter.get(key) || 0) + 1);
}

function rememberLabel(labels, key, label) {
  if (!key || labels.has(key)) {
    return;
  }

  labels.set(key, label);
}

function sortCounter(counter, labels = new Map()) {
  return [...counter.entries()]
    .map(([key, count]) => ({
      key,
      label: labels.get(key) || key,
      count
    }))
    .sort((left, right) => right.count - left.count || compareText(left.label, right.label));
}

function buildDistribution(items = [], pickLabel, { limit = 5, fallbackLabel = "" } = {}) {
  const counter = new Map();

  items.forEach((item) => {
    const rawLabel = pickLabel(item);
    const label = String(rawLabel ?? "").trim() || fallbackLabel;
    if (!label) {
      return;
    }

    incrementCount(counter, label);
  });

  return sortCounter(counter).slice(0, limit);
}

function normalizeThemeKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokenizeThemeText(value) {
  const rawTokens = String(value ?? "").toLowerCase().match(/[0-9A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [];

  return rawTokens
    .map((raw) => ({
      raw,
      key: normalizeThemeKey(raw)
    }))
    .filter(({ key }) =>
      key &&
      key.length >= 4 &&
      !THEME_STOPWORDS.has(key) &&
      !/^\d+$/.test(key)
    );
}

function buildThemeDistribution(items = [], limit = 6) {
  const phraseCounter = new Map();
  const phraseLabels = new Map();
  const termCounter = new Map();
  const termLabels = new Map();

  items.forEach((item) => {
    const text = [
      item.ementa,
      item.ultimoAndamento,
      item.situacaoAtual,
      item.tipoDescricao
    ].filter(Boolean).join(" ");

    const tokens = tokenizeThemeText(text);
    if (!tokens.length) {
      return;
    }

    const uniqueTerms = new Set();
    tokens.forEach((token) => {
      uniqueTerms.add(token.key);
      rememberLabel(termLabels, token.key, token.raw);
    });
    uniqueTerms.forEach((termKey) => incrementCount(termCounter, termKey));

    const uniquePhrases = new Set();
    for (let index = 0; index < tokens.length - 1; index += 1) {
      const current = tokens[index];
      const next = tokens[index + 1];
      const phraseKey = `${current.key} ${next.key}`;
      const phraseLabel = `${current.raw} ${next.raw}`;
      uniquePhrases.add(phraseKey);
      rememberLabel(phraseLabels, phraseKey, phraseLabel);
    }
    uniquePhrases.forEach((phraseKey) => incrementCount(phraseCounter, phraseKey));
  });

  const themes = [];
  sortCounter(phraseCounter, phraseLabels)
    .filter((entry) => entry.count >= 2)
    .forEach((entry) => {
      if (themes.length < limit) {
        themes.push(entry);
      }
    });

  const used = new Set(themes.map((entry) => entry.key));
  sortCounter(termCounter, termLabels).forEach((entry) => {
    if (themes.length >= limit || used.has(entry.key)) {
      return;
    }

    themes.push(entry);
  });

  return themes.slice(0, limit);
}

function getLeadingEntry(entries, fallbackLabel) {
  return entries[0] || { key: fallbackLabel, label: fallbackLabel, count: 0 };
}

function buildSourceAnalytics(label, items = []) {
  const counts = computeCounts(items);
  const statuses = buildDistribution(items, (item) => item.situacaoAtual, {
    limit: 5,
    fallbackLabel: "Sem detalhamento"
  });
  const types = buildDistribution(items, (item) => item.tipo || item.tipoDescricao, {
    limit: 5,
    fallbackLabel: "Sem tipo identificado"
  });
  const themes = buildThemeDistribution(items, 6);

  return {
    label,
    total: items.length,
    counts,
    statuses,
    types,
    themes,
    leadStatus: getLeadingEntry(statuses, "Sem detalhamento"),
    leadType: getLeadingEntry(types, "Sem tipo identificado"),
    leadTheme: getLeadingEntry(themes, "Sem tema recorrente")
  };
}

function buildAnalytics(items = [], sourceMeta = []) {
  const grouped = new Map();
  sourceMeta
    .map((source) => source.label)
    .filter(Boolean)
    .forEach((label) => grouped.set(label, []));

  items.forEach((item) => {
    const label = item._sourceLabel || item.parlamentar || "Consulta";
    if (!grouped.has(label)) {
      grouped.set(label, []);
    }

    grouped.get(label).push(item);
  });

  if (!grouped.size && items.length) {
    grouped.set("Recorte atual", items);
  }

  const sources = [...grouped.entries()].map(([label, sourceItems]) => buildSourceAnalytics(label, sourceItems));
  const activeSources = sources.filter((source) => source.total > 0);
  const overallLabel = activeSources.length > 1
    ? "Recorte combinado"
    : (sources[0]?.label || "Recorte atual");
  const overall = buildSourceAnalytics(overallLabel, items);
  const highlights = [];

  if (activeSources.length > 1) {
    const volumeLeader = [...activeSources].sort((left, right) =>
      right.total - left.total || compareText(left.label, right.label)
    )[0];

    highlights.push({
      label: "Mais volume",
      value: volumeLeader ? truncate(volumeLeader.label, 34) : "Sem dados",
      meta: volumeLeader ? `${volumeLeader.total} item(ns) no recorte visivel` : "Sem grupos comparaveis"
    });
  } else {
    highlights.push({
      label: "Cobertura de status",
      value: formatShare(overall.counts.comStatus, overall.total),
      meta: overall.total
        ? `${overall.counts.comStatus} item(ns) com situacao atual`
        : "Sem itens visiveis"
    });
  }

  highlights.push({
    label: "Status lider",
    value: truncate(overall.leadStatus.label, 34),
    meta: overall.leadStatus.count
      ? `${overall.leadStatus.count} item(ns) concentrados aqui`
      : "Sem status recorrente"
  });

  highlights.push({
    label: "Tipo lider",
    value: truncate(overall.leadType.label, 28),
    meta: overall.leadType.count
      ? `${overall.leadType.count} item(ns) neste formato`
      : "Sem tipo dominante"
  });

  highlights.push({
    label: "Tema quente",
    value: truncate(overall.leadTheme.label, 34),
    meta: overall.leadTheme.count
      ? `${overall.leadTheme.count} item(ns) repetem esse tema`
      : "Sem tema recorrente nas ementas"
  });

  return {
    overall,
    sources,
    highlights
  };
}

function buildSearchLabel(payload) {
  const pieces = [];
  if (payload.nome) {
    pieces.push(payload.nome);
  }
  if (payload.compararNome) {
    pieces.push(`x ${payload.compararNome}`);
  }
  if (payload.busca) {
    pieces.push(payload.busca);
  }
  if (payload.casa) {
    pieces.push(payload.casa);
  }
  return pieces.filter(Boolean).join(" | ") || "Busca sem titulo";
}

function getPrimarySearchLabel(payload) {
  if (payload.nome) {
    return payload.nome;
  }

  if (payload.casa === "Senado") {
    return "Busca ampla no Senado";
  }

  if (payload.casa === "Camara") {
    return "Busca ampla na Camara";
  }

  return "Busca ampla na Camara e no Senado";
}

function normalizeSiglaList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => normalizeSiglaList(item)))];
  }

  return [...new Set(
    String(value)
      .split(/[,;\s]+/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
  )];
}

function normalizePayload(payload) {
  const siglas = normalizeSiglaList(payload.siglas).join(", ");
  return {
    nome: payload.nome?.trim() || "",
    compararNome: payload.compararNome?.trim() || "",
    busca: payload.busca?.trim() || "",
    casa: payload.casa || "Ambas",
    modoBusca: payload.modoBusca || "Todas",
    siglas,
    uf: payload.uf?.trim().toUpperCase() || "",
    anoInicial: payload.anoInicial?.trim?.() ?? payload.anoInicial ?? "",
    anoFinal: payload.anoFinal?.trim?.() ?? payload.anoFinal ?? "",
    limite: payload.limite?.trim?.() ?? payload.limite ?? "50",
    somenteAutorPrincipal: Boolean(payload.somenteAutorPrincipal),
    semDetalhes: Boolean(payload.semDetalhes)
  };
}

function getSiglaOptionId(code) {
  return `sigla-option-${String(code).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function renderSiglaOptions(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items.map((item) => `
    <label class="sigla-option" for="${getSiglaOptionId(item.code)}">
      <input type="checkbox" id="${getSiglaOptionId(item.code)}" value="${item.code}" data-sigla-option />
      <span class="sigla-option-copy">
        <strong>${item.code}</strong>
        <small>${item.label}</small>
      </span>
    </label>
  `).join("");
}

function getSiglaCheckboxes() {
  return [...document.querySelectorAll("[data-sigla-option]")];
}

function getSelectedSiglas() {
  return getSiglaCheckboxes()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function syncSiglaPickerUi() {
  const selected = getSelectedSiglas();
  if (form?.elements?.siglas) {
    form.elements.siglas.value = selected.join(", ");
  }

  if (!siglaPickerTitle || !siglaPickerMeta) {
    return;
  }

  if (selected.length === 0) {
    siglaPickerTitle.textContent = "Todos os tipos";
    siglaPickerMeta.textContent = "Nenhum tipo marcado. O painel vai considerar todas as siglas.";
    return;
  }

  const visibleCodes = selected.slice(0, 4);
  const suffix = selected.length > 4 ? ` +${selected.length - 4}` : "";
  siglaPickerTitle.textContent = selected.length === 1
    ? `${selected[0]} - ${SIGLA_LABELS.get(selected[0]) || "Tipo selecionado"}`
    : `${selected.length} tipos selecionados`;
  siglaPickerMeta.textContent = `${visibleCodes.join(", ")}${suffix}`;
}

function setSelectedSiglas(value) {
  const selected = new Set(normalizeSiglaList(value));
  getSiglaCheckboxes().forEach((checkbox) => {
    checkbox.checked = selected.has(checkbox.value);
  });
  syncSiglaPickerUi();
}

function renderSiglaPicker() {
  renderSiglaOptions(siglaCommonList, SIGLA_COMMON_TYPES);
  renderSiglaOptions(siglaExtraList, SIGLA_OTHER_TYPES);
  setSelectedSiglas("");
}

function hasAdvancedValues(payload) {
  return ADVANCED_FIELDS.some((field) => {
    const value = payload[field];
    if (typeof value === "boolean") {
      return value;
    }

    if (field === "limite") {
      return String(value || "") !== "50";
    }

    return String(value || "").trim() !== "";
  });
}

function syncAdvancedToggle(payload = getFormPayload()) {
  if (!advancedToggleButton) {
    return;
  }

  const expanded = hasAdvancedValues(payload) || form.classList.contains("is-advanced");
  form.classList.toggle("is-advanced", expanded);
  advancedToggleButton.setAttribute("aria-expanded", String(expanded));
  advancedToggleButton.textContent = expanded
    ? "Esconder comparacao e filtros avancados"
    : "Mostrar comparacao e filtros avancados";
}

function getFormPayload() {
  syncSiglaPickerUi();
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());
  payload.somenteAutorPrincipal = form.elements.somenteAutorPrincipal.checked;
  payload.semDetalhes = form.elements.semDetalhes.checked;
  return normalizePayload(payload);
}

function applyPayloadToForm(payload) {
  const normalized = normalizePayload(payload);
  Object.entries(normalized).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) {
      return;
    }

    if ("checked" in field) {
      field.checked = Boolean(value);
    } else {
      field.value = value ?? "";
    }
  });

  setSelectedSiglas(normalized.siglas);
  syncAdvancedToggle(normalized);
}

function saveDraft(payload) {
  void payload;
}

function loadDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
  applyPayloadToForm(DEFAULT_FORM_VALUES);
}

function syncFavoriteFlags(items = []) {
  const favorites = getFavoritesMap();
  items.forEach((item) => {
    item._favoriteId = getFavoriteId(item);
    item._isFavorite = Boolean(favorites[item._favoriteId]);
  });
}

function enrichItems(items = [], sourceLabel) {
  const enriched = items.map((item, index) => ({
    ...item,
    _key: getItemKey(item, index),
    _sourceLabel: sourceLabel || item.parlamentar || "Consulta"
  }));

  syncFavoriteFlags(enriched);
  return enriched;
}

function sortItems(items, mode) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    switch (mode) {
      case "atividade-asc":
        return getActivityTimestamp(left) - getActivityTimestamp(right) ||
          compareText(left.parlamentar, right.parlamentar);
      case "ano-desc":
        return (Number(right.ano) || 0) - (Number(left.ano) || 0) ||
          (Number(right.numero) || 0) - (Number(left.numero) || 0);
      case "ano-asc":
        return (Number(left.ano) || 0) - (Number(right.ano) || 0) ||
          (Number(left.numero) || 0) - (Number(right.numero) || 0);
      case "parlamentar-asc":
        return compareText(left.parlamentar, right.parlamentar) ||
          ((Number(right.ano) || 0) - (Number(left.ano) || 0));
      case "status-asc":
        return compareText(left.situacaoAtual, right.situacaoAtual) ||
          (getActivityTimestamp(right) - getActivityTimestamp(left));
      case "atividade-desc":
      default:
        return getActivityTimestamp(right) - getActivityTimestamp(left) ||
          compareText(left.parlamentar, right.parlamentar);
    }
  });

  return sorted;
}

function renderQueryChips(payload) {
  activeQuery.innerHTML = "";
  const query = payload.query || {};

  const chips = [
    query.nome ? `Parlamentar: ${query.nome}` : null,
    query.compararNome ? `Comparar: ${query.compararNome}` : null,
    query.busca ? `Tema: ${query.busca}` : null,
    query.casa ? `Casa: ${query.casa}` : null,
    query.siglas?.length ? `Siglas: ${query.siglas.join(", ")}` : (query.siglas ? `Siglas: ${query.siglas}` : null),
    query.uf ? `UF: ${query.uf}` : null,
    query.anoInicial ? `Ano inicial: ${query.anoInicial}` : null,
    query.anoFinal ? `Ano final: ${query.anoFinal}` : null,
    query.modoBusca ? `Modo: ${query.modoBusca}` : null,
    query.somenteAutorPrincipal ? "Somente autor principal" : null,
    query.semDetalhes ? "Sem detalhamento" : null
  ].filter(Boolean);

  chips.forEach((label) => {
    const chip = document.createElement("div");
    chip.className = "query-chip";
    chip.textContent = label;
    activeQuery.appendChild(chip);
  });
}

function renderResultsMeta(totalItems, visibleItems, totalPages) {
  if (!totalItems) {
    resultsMeta.textContent = "0 resultados";
    paginationInfo.textContent = "Pagina 1 de 1";
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    return;
  }

  const start = (uiState.currentPage - 1) * uiState.pageSize + 1;
  const end = start + visibleItems.length - 1;
  resultsMeta.textContent = `Mostrando ${start}-${end} de ${totalItems} item(ns)`;
  paginationInfo.textContent = `Pagina ${uiState.currentPage} de ${totalPages}`;
  prevPageButton.disabled = uiState.currentPage <= 1;
  nextPageButton.disabled = uiState.currentPage >= totalPages;
}

function renderComparisonPanel(payload) {
  const sources = payload?.sources || [];
  if (sources.length <= 1) {
    comparisonPanel.classList.add("is-hidden");
    comparisonGrid.innerHTML = "";
    return;
  }

  comparisonPanel.classList.remove("is-hidden");
  comparisonGrid.innerHTML = sources.map((source) => `
    <article class="comparison-card">
      <div>
        <h4>${escapeHtml(source.label)}</h4>
        <small>${escapeHtml(source.subtitle || "Mesmo recorte de tema e filtros")}</small>
      </div>
      <div class="comparison-meta">
        <div class="comparison-metric">
          <span>Total</span>
          <strong>${escapeHtml(source.total)}</strong>
        </div>
        <div class="comparison-metric">
          <span>Camara</span>
          <strong>${escapeHtml(source.counts.Camara)}</strong>
        </div>
        <div class="comparison-metric">
          <span>Senado</span>
          <strong>${escapeHtml(source.counts.Senado)}</strong>
        </div>
        <div class="comparison-metric">
          <span>Com status</span>
          <strong>${escapeHtml(source.counts.comStatus)}</strong>
        </div>
      </div>
    </article>
  `).join("");
}

function renderDistributionRows(entries, total, tone) {
  if (!entries.length || !total) {
    return '<p class="analytics-empty">Sem dados suficientes para montar este grafico.</p>';
  }

  return entries.map((entry) => {
    const share = Math.max(0, Math.round((entry.count / total) * 100));
    const barSize = Math.max(entry.count ? 10 : 0, share);
    return `
      <div class="analytics-bar-row">
        <div class="analytics-bar-meta">
          <strong>${escapeHtml(entry.label)}</strong>
          <span>${escapeHtml(entry.count)} item(ns) • ${escapeHtml(share)}%</span>
        </div>
        <div class="analytics-bar-track">
          <span class="analytics-bar-fill ${escapeHtml(tone)}" style="--bar-size: ${barSize}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function renderDistributionGroups(sources, key, tone) {
  return sources.map((source) => {
    const entries = source[key] || [];
    const badge = source.total
      ? `${entries[0]?.count || 0} no topo`
      : "Sem dados";
    const description = key === "statuses"
      ? `${formatShare(source.counts.comStatus, source.total)} com situacao atual`
      : `${source.total} item(ns) analisados`;

    return `
      <section class="analytics-group">
        <div class="analytics-group-head">
          <div>
            <h5>${escapeHtml(source.label)}</h5>
            <small>${escapeHtml(source.total ? description : "Nenhum item visivel neste grupo.")}</small>
          </div>
          <div class="analytics-group-badge">${escapeHtml(badge)}</div>
        </div>
        ${source.total
          ? `<div class="analytics-bars">${renderDistributionRows(entries, source.total, tone)}</div>`
          : '<p class="analytics-empty">Nenhum item visivel neste grupo para montar o grafico.</p>'}
      </section>
    `;
  }).join("");
}

function renderThemeGroups(sources) {
  return sources.map((source) => `
    <section class="analytics-group">
      <div class="analytics-group-head">
        <div>
          <h5>${escapeHtml(source.label)}</h5>
          <small>${escapeHtml(source.total ? `${source.total} item(ns) no recorte visivel` : "Nenhum item visivel neste grupo.")}</small>
        </div>
        <div class="analytics-group-badge">${escapeHtml(source.leadTheme.count ? `${source.leadTheme.count} em destaque` : "Sem repeticao")}</div>
      </div>
      ${source.themes.length
        ? `
          <div class="theme-chip-list">
            ${source.themes.map((theme) => `
              <span class="theme-chip">${escapeHtml(theme.label)} <small>${escapeHtml(theme.count)}</small></span>
            `).join("")}
          </div>
        `
        : '<p class="analytics-empty">As ementas deste grupo ainda nao repetem termos suficientes para sugerir um tema dominante.</p>'}
    </section>
  `).join("");
}

function renderAnalyticsPanel(items = [], sourceMeta = []) {
  if (!items.length) {
    analyticsPanel.classList.add("is-hidden");
    analyticsKpiGrid.innerHTML = "";
    analyticsStatusGroups.innerHTML = "";
    analyticsTypeGroups.innerHTML = "";
    analyticsThemeGroups.innerHTML = "";
    return;
  }

  const analytics = buildAnalytics(items, sourceMeta);
  analyticsPanel.classList.remove("is-hidden");
  analyticsKpiGrid.innerHTML = analytics.highlights.map((card) => `
    <article class="analytics-kpi">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.meta)}</small>
    </article>
  `).join("");
  analyticsStatusGroups.innerHTML = renderDistributionGroups(analytics.sources, "statuses", "status");
  analyticsTypeGroups.innerHTML = renderDistributionGroups(analytics.sources, "types", "type");
  analyticsThemeGroups.innerHTML = renderThemeGroups(analytics.sources);
}

function renderSavedSearches() {
  if (!savedSearchesList || !savedSearchesCount) {
    return;
  }

  const entries = getSavedSearches();
  savedSearchesCount.textContent = String(entries.length);

  if (!entries.length) {
    savedSearchesList.className = "mini-list empty-state";
    savedSearchesList.textContent = "Salve um recorte para reaplicar depois com um clique.";
    return;
  }

  savedSearchesList.className = "mini-list";
  savedSearchesList.innerHTML = entries.map((entry) => `
    <article class="mini-item">
      <div class="mini-item-head">
        <div>
          <strong>${escapeHtml(entry.label)}</strong>
          <small>${escapeHtml(entry.meta || "")}</small>
        </div>
      </div>
      <div class="mini-actions">
        <button class="mini-button" type="button" data-apply-search="${escapeHtml(entry.id)}">Aplicar</button>
        <button class="mini-button delete" type="button" data-delete-search="${escapeHtml(entry.id)}">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderFavoritesList() {
  if (!favoritesList || !favoritesCount) {
    return;
  }

  const favorites = Object.values(getFavoritesMap()).sort((left, right) =>
    String(right.savedAt || "").localeCompare(String(left.savedAt || ""))
  );

  favoritesCount.textContent = String(favorites.length);

  if (!favorites.length) {
    favoritesList.className = "mini-list empty-state";
    favoritesList.textContent = "Marque itens importantes para montar sua shortlist.";
    return;
  }

  favoritesList.className = "mini-list";
  favoritesList.innerHTML = favorites.slice(0, 8).map((entry) => `
    <article class="mini-item">
      <div class="mini-item-head">
        <div>
          <strong>${escapeHtml(entry.identificacao || entry.tipo || "Item legislativo")}</strong>
          <small>${escapeHtml(entry.parlamentar || "")}</small>
        </div>
      </div>
      <small>${escapeHtml(truncate(entry.ementa || "", 120))}</small>
      <div class="mini-actions">
        <button class="mini-button" type="button" data-open-favorite="${escapeHtml(entry.favoriteId)}">Abrir</button>
        <a class="mini-button" href="${escapeHtml(entry.link || "#")}" target="_blank" rel="noreferrer">Link</a>
        ${entry.linkPdfOriginal ? `<a class="mini-button" href="${escapeHtml(entry.linkPdfOriginal)}" target="_blank" rel="noreferrer">Arquivo original</a>` : ""}
        <button class="mini-button delete" type="button" data-remove-favorite="${escapeHtml(entry.favoriteId)}">Remover</button>
      </div>
    </article>
  `).join("");
}

function renderDetail(item) {
  if (!item) {
    detailPanel.innerHTML = `
      <div class="detail-empty">
        <p class="eyebrow">Detalhe</p>
        <h3>Selecione um item para abrir o painel lateral.</h3>
        <p>
          Aqui mostramos ementa completa, ultimo andamento, o que falta acontecer, quem pode destravar e links oficiais.
        </p>
      </div>
    `;
    return;
  }

  const badges = [
    `<span class="badge ${escapeHtml((item.casa || "").toLowerCase())}">${escapeHtml(item.casa || "-")}</span>`,
    item.tipo ? `<span class="detail-chip strong">${escapeHtml(item.tipo)}</span>` : "",
    item.autorPrincipal === true ? '<span class="detail-chip warm">Autor principal</span>' : "",
    item.tramitando ? `<span class="detail-chip">${escapeHtml(item.tramitando)}</span>` : "",
    item._sourceLabel ? `<span class="detail-chip">${escapeHtml(item._sourceLabel)}</span>` : ""
  ].filter(Boolean).join("");
  const reading = getStatusSummary(item);
  const actionGuide = getActionGuide(item);

  detailPanel.innerHTML = `
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-badges">${badges}</div>
        <div class="mini-actions">
          <button class="favorite-trigger ${item._isFavorite ? "is-active" : ""}" type="button" data-detail-favorite="${escapeHtml(item._key)}" aria-label="Favoritar">
            ${item._isFavorite ? "★" : "☆"}
          </button>
        </div>
        <div>
          <h3 class="detail-title">${escapeHtml(item.identificacao || `${item.tipo || "-"} ${item.numero || "-"} / ${item.ano || "-"}`)}</h3>
          <p class="detail-subtitle">${escapeHtml(item.parlamentar || "Parlamentar nao identificado")}${item.partido ? ` • ${escapeHtml(item.partido)}` : ""}${item.uf ? ` / ${escapeHtml(item.uf)}` : ""}</p>
        </div>
        <p class="detail-summary">${escapeHtml(item.tipoDescricao || "Sem descricao de tipo.")}</p>
      </div>

      <section class="detail-section">
        <h4>Ementa</h4>
        <p class="detail-copy">${escapeHtml(item.ementa || "Sem ementa disponivel.")}</p>
      </section>

      <section class="detail-section">
        <h4>Leitura rapida</h4>
        <div class="detail-metrics">
          <div class="detail-metric">
            <span class="detail-meta-label">Situacao</span>
            <span class="detail-meta-value">${escapeHtml(item.situacaoAtual || "Sem detalhamento")}</span>
          </div>
          <div class="detail-metric">
            <span class="detail-meta-label">Local</span>
            <span class="detail-meta-value">${escapeHtml(item.localAtual || "Nao informado")}</span>
          </div>
          <div class="detail-metric">
            <span class="detail-meta-label">Apresentacao</span>
            <span class="detail-meta-value">${escapeHtml(item.dataApresentacao || "Nao informada")}</span>
          </div>
          <div class="detail-metric">
            <span class="detail-meta-label">Ultima data</span>
            <span class="detail-meta-value">${escapeHtml(item.dataUltimoAndamento || item.dataSituacao || "Nao informada")}</span>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h4>Autoria</h4>
        <p class="detail-copy">${escapeHtml(item.autores || item.parlamentar || "Nao informada")}</p>
      </section>

      <section class="detail-section">
        <h4>Ultimo andamento</h4>
        <p class="detail-copy">${escapeHtml(item.ultimoAndamento || "Sem andamento detalhado nesta consulta.")}</p>
      </section>

      <section class="detail-section">
        <h4>O que falta agora</h4>
        <p class="detail-copy"><strong>${escapeHtml(actionGuide.stage)}.</strong> ${escapeHtml(actionGuide.next)}</p>
      </section>

      <section class="detail-section">
        <h4>Quem pode destravar</h4>
        <p class="detail-copy">${escapeHtml(actionGuide.who)}</p>
        <p class="detail-copy">${escapeHtml(actionGuide.action)}</p>
      </section>

      <section class="detail-section">
        <h4>Leitura para comunicacao</h4>
        <p class="detail-copy"><strong>${escapeHtml(reading.phase)}.</strong> ${escapeHtml(reading.note)}</p>
      </section>

      <div class="detail-actions">
        <a class="detail-link" href="${escapeHtml(item.link || "#")}" target="_blank" rel="noreferrer">Abrir tramitacao</a>
        ${item.linkPdfOriginal ? `<a class="detail-link secondary" href="${escapeHtml(item.linkPdfOriginal)}" target="_blank" rel="noreferrer">Arquivo original</a>` : ""}
        ${item.linkApi ? `<a class="detail-link secondary" href="${escapeHtml(item.linkApi)}" target="_blank" rel="noreferrer">Abrir API</a>` : ""}
      </div>
    </div>
  `;
}

function renderResults(items, selectedKey) {
  if (!items.length) {
    resultsBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Nenhum resultado encontrado com esse recorte. Tente os atalhos de ajuste acima.</td>
      </tr>
    `;
    return;
  }

  resultsBody.innerHTML = items.map((item) => {
    const actionGuide = getActionGuide(item);
    const casaClass = item.casa?.toLowerCase() || "";
    const andamento = item.ultimoAndamento
      ? `
        <details>
          <summary>Ver andamento</summary>
          <p>${escapeHtml(item.ultimoAndamento)}</p>
        </details>
      `
      : "";
    const isSelected = item._key === selectedKey;

    return `
      <tr class="result-row ${isSelected ? "is-selected" : ""}" data-row-key="${escapeHtml(item._key)}" tabindex="0">
        <td>
          <span class="badge ${casaClass}">${escapeHtml(item.casa || "-")}</span>
        </td>
        <td>
          <div class="item-meta">
            <p class="item-title">${escapeHtml(item.parlamentar || "-")}</p>
            <small>${escapeHtml(item.partido || "--")}${item.uf ? ` / ${escapeHtml(item.uf)}` : ""}</small>
            ${item._sourceLabel && item._sourceLabel !== item.parlamentar ? `<small><strong>Grupo:</strong> ${escapeHtml(item._sourceLabel)}</small>` : ""}
            ${item.autores && item.autores !== item.parlamentar ? `<small><strong>Autores:</strong> ${escapeHtml(truncate(item.autores, 140))}</small>` : ""}
          </div>
        </td>
        <td>
          <div class="item-meta">
            <strong>${escapeHtml(item.tipo || "-")}</strong>
            <small>${escapeHtml(item.tipoDescricao || "")}</small>
          </div>
        </td>
        <td>
          <div class="item-meta">
            <strong>${escapeHtml(item.numero || "-")}/${escapeHtml(item.ano || "-")}</strong>
            <small>${escapeHtml(item.identificacao || "")}</small>
          </div>
        </td>
        <td>
          <div class="item-meta">
            ${statusMarkup(item.situacaoAtual)}
            <small>${escapeHtml(item.localAtual || "")}</small>
            <small>${escapeHtml(item.dataSituacao || item.dataUltimoAndamento || item.dataApresentacao || "")}</small>
            <small><strong>Falta:</strong> ${escapeHtml(truncate(actionGuide.next, 110))}</small>
          </div>
        </td>
        <td>
          <div class="item-copy">
            <small>${escapeHtml(item.ementa || "Sem ementa disponivel.")}</small>
            ${andamento}
          </div>
        </td>
        <td>
          <div class="item-links">
            <button class="favorite-trigger ${item._isFavorite ? "is-active" : ""}" type="button" data-favorite-key="${escapeHtml(item._key)}" aria-label="Favoritar">
              ${item._isFavorite ? "★" : "☆"}
            </button>
            <button class="detail-trigger" type="button" data-detail-key="${escapeHtml(item._key)}">Ver detalhe</button>
            <a href="${escapeHtml(item.link || "#")}" target="_blank" rel="noreferrer">Abrir tramitacao</a>
            ${item.linkPdfOriginal ? `<a href="${escapeHtml(item.linkPdfOriginal)}" target="_blank" rel="noreferrer">Arquivo original</a>` : ""}
            ${item.linkApi ? `<a href="${escapeHtml(item.linkApi)}" target="_blank" rel="noreferrer">Abrir API</a>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderDetailPublic(item) {
  if (!item) {
    detailPanel.innerHTML = `
      <div class="detail-empty">
        <p class="eyebrow">Detalhe</p>
        <h3>Selecione um item para abrir o painel lateral.</h3>
        <p>
          Aqui mostramos ementa completa, ultimo andamento, o que falta acontecer, quem pode destravar e links oficiais.
        </p>
      </div>
    `;
    return;
  }

  const badges = [
    `<span class="badge ${escapeHtml((item.casa || "").toLowerCase())}">${escapeHtml(item.casa || "-")}</span>`,
    item.tipo ? `<span class="detail-chip strong">${escapeHtml(item.tipo)}</span>` : "",
    item.autorPrincipal === true ? '<span class="detail-chip warm">Autor principal</span>' : "",
    item.tramitando ? `<span class="detail-chip">${escapeHtml(item.tramitando)}</span>` : "",
    item._sourceLabel ? `<span class="detail-chip">${escapeHtml(item._sourceLabel)}</span>` : ""
  ].filter(Boolean).join("");
  const reading = getStatusSummary(item);
  const actionGuide = getActionGuide(item);

  detailPanel.innerHTML = `
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-badges">${badges}</div>
        <div>
          <h3 class="detail-title">${escapeHtml(item.identificacao || `${item.tipo || "-"} ${item.numero || "-"} / ${item.ano || "-"}`)}</h3>
          <p class="detail-subtitle">${escapeHtml(item.parlamentar || "Parlamentar nao identificado")}${item.partido ? ` / ${escapeHtml(item.partido)}` : ""}${item.uf ? ` / ${escapeHtml(item.uf)}` : ""}</p>
        </div>
        <p class="detail-summary">${escapeHtml(item.tipoDescricao || "Sem descricao de tipo.")}</p>
      </div>

      <section class="detail-section">
        <h4>Ementa</h4>
        <p class="detail-copy">${escapeHtml(item.ementa || "Sem ementa disponivel.")}</p>
      </section>

      <section class="detail-section">
        <h4>Leitura rapida</h4>
        <div class="detail-metrics">
          <div class="detail-metric">
            <span class="detail-meta-label">Situacao</span>
            <span class="detail-meta-value">${escapeHtml(item.situacaoAtual || "Sem detalhamento")}</span>
          </div>
          <div class="detail-metric">
            <span class="detail-meta-label">Local</span>
            <span class="detail-meta-value">${escapeHtml(item.localAtual || "Nao informado")}</span>
          </div>
          <div class="detail-metric">
            <span class="detail-meta-label">Apresentacao</span>
            <span class="detail-meta-value">${escapeHtml(item.dataApresentacao || "Nao informada")}</span>
          </div>
          <div class="detail-metric">
            <span class="detail-meta-label">Ultima data</span>
            <span class="detail-meta-value">${escapeHtml(item.dataUltimoAndamento || item.dataSituacao || "Nao informada")}</span>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h4>Autoria</h4>
        <p class="detail-copy">${escapeHtml(item.autores || item.parlamentar || "Nao informada")}</p>
      </section>

      <section class="detail-section">
        <h4>Ultimo andamento</h4>
        <p class="detail-copy">${escapeHtml(item.ultimoAndamento || "Sem andamento detalhado nesta consulta.")}</p>
      </section>

      <section class="detail-section">
        <h4>O que falta agora</h4>
        <p class="detail-copy"><strong>${escapeHtml(actionGuide.stage)}.</strong> ${escapeHtml(actionGuide.next)}</p>
      </section>

      <section class="detail-section">
        <h4>Quem pode destravar</h4>
        <p class="detail-copy">${escapeHtml(actionGuide.who)}</p>
        <p class="detail-copy">${escapeHtml(actionGuide.action)}</p>
      </section>

      <section class="detail-section">
        <h4>Leitura para comunicacao</h4>
        <p class="detail-copy"><strong>${escapeHtml(reading.phase)}.</strong> ${escapeHtml(reading.note)}</p>
      </section>

      <div class="detail-actions">
        <a class="detail-link" href="${escapeHtml(item.link || "#")}" target="_blank" rel="noreferrer">Abrir tramitacao</a>
        ${item.linkPdfOriginal ? `<a class="detail-link secondary" href="${escapeHtml(item.linkPdfOriginal)}" target="_blank" rel="noreferrer">Arquivo original</a>` : ""}
        ${item.linkApi ? `<a class="detail-link secondary" href="${escapeHtml(item.linkApi)}" target="_blank" rel="noreferrer">Abrir API</a>` : ""}
      </div>
    </div>
  `;
}

function renderResultsPublic(items, selectedKey) {
  if (!items.length) {
    resultsBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Nenhum resultado encontrado com esse recorte. Tente os atalhos de ajuste acima.</td>
      </tr>
    `;
    return;
  }

  resultsBody.innerHTML = items.map((item) => {
    const actionGuide = getActionGuide(item);
    const casaClass = item.casa?.toLowerCase() || "";
    const andamento = item.ultimoAndamento
      ? `
        <details>
          <summary>Ver andamento</summary>
          <p>${escapeHtml(item.ultimoAndamento)}</p>
        </details>
      `
      : "";
    const isSelected = item._key === selectedKey;

    return `
      <tr class="result-row ${isSelected ? "is-selected" : ""}" data-row-key="${escapeHtml(item._key)}" tabindex="0">
        <td>
          <span class="badge ${casaClass}">${escapeHtml(item.casa || "-")}</span>
        </td>
        <td>
          <div class="item-meta">
            <p class="item-title">${escapeHtml(item.parlamentar || "-")}</p>
            <small>${escapeHtml(item.partido || "--")}${item.uf ? ` / ${escapeHtml(item.uf)}` : ""}</small>
            ${item._sourceLabel && item._sourceLabel !== item.parlamentar ? `<small><strong>Grupo:</strong> ${escapeHtml(item._sourceLabel)}</small>` : ""}
            ${item.autores && item.autores !== item.parlamentar ? `<small><strong>Autores:</strong> ${escapeHtml(truncate(item.autores, 140))}</small>` : ""}
          </div>
        </td>
        <td>
          <div class="item-meta">
            <strong>${escapeHtml(item.tipo || "-")}</strong>
            <small>${escapeHtml(item.tipoDescricao || "")}</small>
          </div>
        </td>
        <td>
          <div class="item-meta">
            <strong>${escapeHtml(item.numero || "-")}/${escapeHtml(item.ano || "-")}</strong>
            <small>${escapeHtml(item.identificacao || "")}</small>
          </div>
        </td>
        <td>
          <div class="item-meta">
            ${statusMarkup(item.situacaoAtual)}
            <small>${escapeHtml(item.localAtual || "")}</small>
            <small>${escapeHtml(item.dataSituacao || item.dataUltimoAndamento || item.dataApresentacao || "")}</small>
            <small><strong>Falta:</strong> ${escapeHtml(truncate(actionGuide.next, 110))}</small>
          </div>
        </td>
        <td>
          <div class="item-copy">
            <small>${escapeHtml(item.ementa || "Sem ementa disponivel.")}</small>
            ${andamento}
          </div>
        </td>
        <td>
          <div class="item-links">
            <button class="detail-trigger" type="button" data-detail-key="${escapeHtml(item._key)}">Ver detalhe</button>
            <a href="${escapeHtml(item.link || "#")}" target="_blank" rel="noreferrer">Abrir tramitacao</a>
            ${item.linkPdfOriginal ? `<a href="${escapeHtml(item.linkPdfOriginal)}" target="_blank" rel="noreferrer">Arquivo original</a>` : ""}
            ${item.linkApi ? `<a href="${escapeHtml(item.linkApi)}" target="_blank" rel="noreferrer">Abrir API</a>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function toCsvRow(values) {
  return values
    .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
    .join(",");
}

function exportCsv(items) {
  const headers = [
    "Casa",
    "Parlamentar",
    "UF",
    "Partido",
    "Tipo",
    "Numero",
    "Ano",
    "Identificacao",
    "AutorPrincipal",
    "Autores",
    "Tramitando",
    "SituacaoAtual",
    "LocalAtual",
    "UltimoAndamento",
    "Ementa",
    "LeituraResumo",
    "OQueFaltaAgora",
    "QuemPodeDestravar",
    "ComoCobrar",
    "LinkPdfOriginal",
    "Link"
  ];

  const lines = [
    toCsvRow(headers),
    ...items.map((item) => {
      const reading = getStatusSummary(item);
      const actionGuide = getActionGuide(item);
      return toCsvRow([
        item.casa,
        item.parlamentar,
        item.uf,
        item.partido,
        item.tipo,
        item.numero,
        item.ano,
        item.identificacao,
        item.autorPrincipal,
        item.autores,
        item.tramitando,
        item.situacaoAtual,
        item.localAtual,
        item.ultimoAndamento,
        item.ementa,
        `${reading.phase}. ${reading.note}`,
        `${actionGuide.stage}. ${actionGuide.next}`,
        actionGuide.who,
        actionGuide.action,
        item.linkPdfOriginal,
        item.link
      ]);
    })
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `monitor-parlamentar-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getReportItems() {
  return getSortedItems();
}

function buildReportHtml(items, payload) {
  const query = payload?.query || {};
  const generatedAt = new Date().toLocaleString("pt-BR");
  const queryParts = [
    query.nome ? `Parlamentar: ${query.nome}` : null,
    query.busca ? `Tema: ${query.busca}` : null,
    query.casa ? `Casa: ${query.casa}` : null,
    query.siglas?.length ? `Siglas: ${query.siglas.join(", ")}` : null,
    query.uf ? `UF: ${query.uf}` : null,
    query.anoInicial ? `Ano inicial: ${query.anoInicial}` : null,
    query.anoFinal ? `Ano final: ${query.anoFinal}` : null
  ].filter(Boolean);

  const cards = items.map((item, index) => {
    const reading = getStatusSummary(item);
    const actionGuide = getActionGuide(item);
    return `
      <article class="report-item">
        <div class="report-item-head">
          <div>
            <span class="report-badge">${escapeHtml(item.casa || "-")}</span>
            <h3>${escapeHtml(item.identificacao || `${item.tipo || "-"} ${item.numero || "-"} / ${item.ano || "-"}`)}</h3>
            <p class="report-subtitle">${escapeHtml(item.parlamentar || "Parlamentar nao identificado")}${item.partido ? ` • ${escapeHtml(item.partido)}` : ""}${item.uf ? ` / ${escapeHtml(item.uf)}` : ""}</p>
          </div>
          <strong>#${index + 1}</strong>
        </div>
        <p class="report-ementa">${escapeHtml(item.ementa || "Sem ementa disponivel.")}</p>
        <div class="report-grid">
          <div><span>Situacao</span><strong>${escapeHtml(item.situacaoAtual || "Sem detalhamento")}</strong></div>
          <div><span>Local atual</span><strong>${escapeHtml(item.localAtual || "Nao informado")}</strong></div>
          <div><span>Ultima data</span><strong>${escapeHtml(formatDateHuman(item.dataUltimoAndamento || item.dataSituacao || item.dataApresentacao))}</strong></div>
          <div><span>Leitura do andamento</span><strong>${escapeHtml(reading.phase)}</strong></div>
        </div>
        <section class="report-reading">
          <h4>Leitura para comunicacao</h4>
          <p>${escapeHtml(reading.note)}</p>
          <p><strong>Ultimo andamento:</strong> ${escapeHtml(item.ultimoAndamento || "Sem andamento detalhado nesta consulta.")}</p>
        </section>
        <section class="report-reading">
          <h4>O que falta acontecer</h4>
          <p><strong>${escapeHtml(actionGuide.stage)}.</strong> ${escapeHtml(actionGuide.next)}</p>
          <p><strong>Quem pode destravar:</strong> ${escapeHtml(actionGuide.who)}</p>
          <p><strong>Como orientar a cobranca:</strong> ${escapeHtml(actionGuide.action)}</p>
        </section>
        <div class="report-links">
          <a href="${escapeHtml(item.link || "#")}" target="_blank" rel="noreferrer">Tramitacao oficial</a>
          ${item.linkPdfOriginal ? `<a href="${escapeHtml(item.linkPdfOriginal)}" target="_blank" rel="noreferrer">Arquivo original oficial</a>` : ""}
        </div>
      </article>
    `;
  }).join("");

  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Relatorio legislativo</title>
      <style>
        body { font-family: Georgia, "Times New Roman", serif; margin: 0; color: #1f2a2c; background: #f4f0e8; }
        .report-shell { max-width: 980px; margin: 0 auto; padding: 32px 28px 56px; }
        .report-header { padding: 28px; border-radius: 24px; background: linear-gradient(135deg, #13373b, #284b4f); color: #f8f2e8; }
        .report-header h1 { margin: 10px 0 12px; font-size: 2.3rem; line-height: 0.95; }
        .report-header p { margin: 0; line-height: 1.65; max-width: 70ch; color: rgba(248, 242, 232, 0.86); }
        .report-kicker { letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.8rem; font-weight: 700; color: #f0c59f; }
        .report-query { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
        .report-chip { padding: 7px 11px; border-radius: 999px; background: rgba(248, 242, 232, 0.1); border: 1px solid rgba(248, 242, 232, 0.14); font-size: 0.85rem; }
        .report-meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 18px 0 24px; }
        .report-meta article { padding: 16px; border-radius: 18px; background: white; border: 1px solid rgba(19, 55, 59, 0.08); }
        .report-meta span { display: block; color: #5b7273; font-size: 0.84rem; }
        .report-meta strong { display: block; margin-top: 8px; font-size: 1.6rem; }
        .report-list { display: grid; gap: 16px; }
        .report-item { padding: 22px; border-radius: 22px; background: white; border: 1px solid rgba(19, 55, 59, 0.08); break-inside: avoid; }
        .report-item-head { display: flex; justify-content: space-between; gap: 16px; }
        .report-item-head h3 { margin: 10px 0 8px; font-size: 1.45rem; line-height: 1.05; }
        .report-badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: #edf6f4; color: #0a6a61; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; }
        .report-subtitle, .report-ementa, .report-reading p { color: #556c6e; line-height: 1.65; }
        .report-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
        .report-grid div { padding: 12px; border-radius: 14px; background: #f6f3ec; }
        .report-grid span { display: block; color: #6e8284; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .report-grid strong { display: block; margin-top: 6px; font-size: 0.96rem; }
        .report-reading { padding: 16px; border-radius: 16px; background: #f9f6ef; border: 1px solid rgba(19, 55, 59, 0.08); }
        .report-reading h4 { margin: 0 0 8px; font-size: 0.92rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6e8284; }
        .report-links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
        .report-links a { color: #0a6a61; font-weight: 700; text-decoration: none; }
        @media print {
          body { background: white; }
          .report-shell { max-width: none; padding: 0; }
          .report-header { border-radius: 0; }
          .report-item { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <main class="report-shell">
        <header class="report-header">
          <span class="report-kicker">Relatorio de acompanhamento legislativo</span>
          <h1>${escapeHtml(query.nome || query.busca || "Recorte legislativo")}</h1>
          <p>Gerado em ${escapeHtml(generatedAt)} com leitura automatica do andamento para apoiar briefing, post, pauta e comparacao interna.</p>
          <div class="report-query">
            ${queryParts.map((part) => `<span class="report-chip">${escapeHtml(part)}</span>`).join("")}
          </div>
        </header>
        <section class="report-meta">
          <article><span>Total</span><strong>${escapeHtml(items.length)}</strong></article>
          <article><span>Camara</span><strong>${escapeHtml(items.filter((item) => item.casa === "Camara").length)}</strong></article>
          <article><span>Senado</span><strong>${escapeHtml(items.filter((item) => item.casa === "Senado").length)}</strong></article>
          <article><span>Com status</span><strong>${escapeHtml(items.filter((item) => item.situacaoAtual).length)}</strong></article>
        </section>
        <section class="report-list">
          ${cards || "<p>Nenhum item encontrado neste recorte.</p>"}
        </section>
      </main>
      <script>
        window.onload = () => {
          setTimeout(() => window.print(), 250);
        };
      </script>
    </body>
  </html>`;
}

function exportReportPdf() {
  const items = getReportItems();
  if (!items.length || !lastPayload) {
    return;
  }

  const reportWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=900");
  if (!reportWindow) {
    setStatus("O navegador bloqueou a janela do PDF. Libere pop-ups e tente de novo.", false);
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(buildReportHtml(items, lastPayload));
  reportWindow.document.close();
}

function buildApiParams(payload, overrideNome = null) {
  const normalized = normalizePayload(payload);
  const params = new URLSearchParams();
  const requestPayload = {
    ...normalized,
    nome: overrideNome !== null ? overrideNome : normalized.nome,
    compararNome: ""
  };

  Object.entries(requestPayload).forEach(([key, value]) => {
    if (key === "compararNome") {
      return;
    }

    if (value === "" || value === false || value === null || value === undefined) {
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

async function fetchQuery(payload, sourceLabel, overrideNome = null) {
  const params = buildApiParams(payload, overrideNome);
  let response;

  try {
    response = await fetch(`/api/buscar?${params.toString()}`);
  } catch (error) {
    throw new Error(getApiUnavailableMessage());
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error("A API respondeu em um formato inesperado. Verifique o deploy do endpoint /api/buscar.");
    }
  }

  if (!response.ok) {
    throw new Error(data.error || "Falha ao consultar a API.");
  }

  data.items = enrichItems(data.items || [], sourceLabel);
  return data;
}

function combineResponses(responses, payload) {
  const items = responses.flatMap((response) => response.items || []);
  const warnings = responses.flatMap((response) => response.warnings || []);
  const query = {
    ...responses[0]?.query,
    compararNome: payload.compararNome || ""
  };

  return {
    generatedAt: new Date().toISOString(),
    query,
    warnings,
    total: items.length,
    counts: computeCounts(items),
    items,
    sources: responses.map((response, index) => ({
      id: `source-${index + 1}`,
      label: response._sourceLabel || response.query?.nome || "Consulta",
      subtitle: response.query?.busca ? `Tema: ${response.query.busca}` : "Sem tema adicional",
      total: response.items?.length || 0,
      counts: computeCounts(response.items || [])
    }))
  };
}

function getFilteredItems() {
  if (!lastPayload?.items?.length) {
    return [];
  }

  if (!uiState.showFavoritesOnly) {
    return lastPayload.items;
  }

  return lastPayload.items.filter((item) => item._isFavorite);
}

function getSortedItems() {
  return sortItems(getFilteredItems(), uiState.sort);
}

function getViewModel() {
  const sortedItems = getSortedItems();
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / uiState.pageSize));

  if (uiState.currentPage > totalPages) {
    uiState.currentPage = totalPages;
  }

  const start = (uiState.currentPage - 1) * uiState.pageSize;
  const visibleItems = sortedItems.slice(start, start + uiState.pageSize);

  if (!sortedItems.some((item) => item._key === uiState.selectedKey)) {
    uiState.selectedKey = visibleItems[0]?._key || sortedItems[0]?._key || null;
  }

  const selectedItem =
    sortedItems.find((item) => item._key === uiState.selectedKey) ||
    visibleItems[0] ||
    null;

  return {
    sortedItems,
    visibleItems,
    totalItems,
    totalPages,
    selectedItem
  };
}

function renderFavoritesFilterButton() {
  if (!favoritesFilterButton) {
    return;
  }

  favoritesFilterButton.classList.toggle("is-active", uiState.showFavoritesOnly);
  favoritesFilterButton.textContent = uiState.showFavoritesOnly
    ? "Voltando para todos"
    : "Mostrar so favoritos";
}

function renderApp({ selectFirstVisible = false } = {}) {
  const { sortedItems, visibleItems, totalItems, totalPages } = getViewModel();

  if (selectFirstVisible && visibleItems[0]) {
    uiState.selectedKey = visibleItems[0]._key;
  }

  const nextSelected =
    sortedItems.find((item) => item._key === uiState.selectedKey) ||
    visibleItems[0] ||
    null;

  renderResultsPublic(visibleItems, uiState.selectedKey);
  renderResultsMeta(totalItems, visibleItems, totalPages);
  renderAssistantPanel(lastPayload);
  renderDetailPublic(nextSelected);
  renderAnalyticsPanel(sortedItems, lastPayload?.sources || []);
  renderFavoritesFilterButton();
}

function saveCurrentSearch() {
  const payload = getFormPayload();
  if (payload.compararNome && !payload.nome) {
    setStatus("Preencha o primeiro nome antes de salvar uma comparacao.", false);
    return;
  }

  const generatedLabel = buildSearchLabel(payload);
  const label = window.prompt("Nome da busca salva:", generatedLabel);
  if (label === null) {
    return;
  }

  const trimmed = label.trim() || generatedLabel;
  const entries = getSavedSearches();
  entries.unshift({
    id: `saved-${Date.now()}`,
    label: trimmed,
    meta: payload.busca ? `Tema: ${payload.busca}` : (payload.casa || "Ambas"),
    payload,
    createdAt: new Date().toISOString()
  });

  setSavedSearches(entries.slice(0, 12));
  renderSavedSearches();
  setStatus(`Busca salva: ${trimmed}`, false);
}

function removeSavedSearch(id) {
  const nextEntries = getSavedSearches().filter((entry) => entry.id !== id);
  setSavedSearches(nextEntries);
  renderSavedSearches();
}

function findCurrentItemByKey(itemKey) {
  return lastPayload?.items?.find((item) => item._key === itemKey) || null;
}

function toggleFavoriteByKey(itemKey) {
  const item = findCurrentItemByKey(itemKey);
  if (!item) {
    return;
  }

  const favorites = getFavoritesMap();
  const favoriteId = item._favoriteId || getFavoriteId(item);

  if (favorites[favoriteId]) {
    delete favorites[favoriteId];
  } else {
    favorites[favoriteId] = {
      favoriteId,
      savedAt: new Date().toISOString(),
      identificacao: item.identificacao,
      tipo: item.tipo,
      parlamentar: item.parlamentar,
      ementa: item.ementa,
      link: item.link,
      linkApi: item.linkApi,
      linkPdfOriginal: item.linkPdfOriginal
    };
  }

  setFavoritesMap(favorites);
  syncFavoriteFlags(lastPayload?.items || []);
  renderFavoritesList();
  renderApp();
}

function openFavorite(favoriteId) {
  const currentItem = lastPayload?.items?.find((item) => item._favoriteId === favoriteId);
  if (currentItem) {
    uiState.selectedKey = currentItem._key;
    renderApp();
    detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const favorite = getFavoritesMap()[favoriteId];
  if (favorite?.link) {
    window.open(favorite.link, "_blank", "noopener,noreferrer");
  }
}

function removeFavorite(favoriteId) {
  const favorites = getFavoritesMap();
  delete favorites[favoriteId];
  setFavoritesMap(favorites);
  syncFavoriteFlags(lastPayload?.items || []);
  renderFavoritesList();
  renderApp();
}

function patchCurrentForm(partial) {
  const payload = {
    ...getFormPayload(),
    ...partial
  };

  applyPayloadToForm(payload);
  saveDraft(payload);
}

async function runAssistantAction(actionId) {
  switch (actionId) {
    case "house-camara":
      patchCurrentForm({ casa: "Camara" });
      break;
    case "house-senado":
      patchCurrentForm({ casa: "Senado" });
      break;
    case "house-ambas":
      patchCurrentForm({ casa: "Ambas" });
      break;
    case "mode-any":
      patchCurrentForm({ modoBusca: "Qualquer" });
      break;
    case "clear-years":
      patchCurrentForm({ anoInicial: "", anoFinal: "" });
      break;
    case "clear-filters":
      patchCurrentForm({
        siglas: "",
        uf: "",
        anoInicial: "",
        anoFinal: "",
        somenteAutorPrincipal: false
      });
      break;
    default:
      return;
  }

  await submitSearch();
}

async function submitSearch() {
  const payload = getFormPayload();
  saveDraft(payload);

  submitButton.disabled = true;
  exportButton.disabled = true;
  reportPdfButton.disabled = true;
  if (saveSearchButton) {
    saveSearchButton.disabled = true;
  }
  setStatus(payload.compararNome ? "Montando comparacao e puxando os projetos..." : "Buscando projetos e organizando o recorte...", false);
  renderWarnings([]);

  try {
    if (payload.compararNome && !payload.nome) {
      throw new Error("Preencha o primeiro nome antes de usar a comparacao.");
    }

    if (!payload.nome && !payload.busca) {
      throw new Error("Sem marcar nenhuma sigla, o painel entende 'todos os tipos'. Mesmo assim, informe ao menos um nome, um tema ou os dois para montar o recorte.");
    }

    const compareName =
      payload.compararNome && compareText(payload.compararNome, payload.nome) !== 0
        ? payload.compararNome
        : "";

    const responses = [];

    const primaryLabel = getPrimarySearchLabel(payload);
    responses.push(await fetchQuery(payload, primaryLabel, payload.nome || null));

    if (compareName) {
      responses.push(await fetchQuery(payload, compareName, compareName));
    }

    responses.forEach((response, index) => {
      response._sourceLabel = index === 0 ? primaryLabel : compareName;
    });

    lastPayload = combineResponses(responses, { ...payload, compararNome: compareName });
    syncFavoriteFlags(lastPayload.items);
    uiState.currentPage = 1;
    uiState.selectedKey = lastPayload.items[0]?._key || null;

    updateSummary(lastPayload);
    renderWarnings(lastPayload.warnings || []);
    renderQueryChips(lastPayload);
    renderComparisonPanel(lastPayload);
    renderFavoritesList();
    renderApp({ selectFirstVisible: true });
    exportButton.disabled = !(lastPayload.items || []).length;
    reportPdfButton.disabled = !(getReportItems().length);
    setStatus(
      lastPayload.total > 0
        ? `Consulta concluida: ${lastPayload.total} item(ns) encontrados.`
        : "Nao apareceu resultado nesse recorte. Use os atalhos de ajuste logo abaixo.",
      false
    );
  } catch (error) {
    lastPayload = null;
    uiState.currentPage = 1;
    uiState.selectedKey = null;
    updateSummary({ total: 0, counts: { Camara: 0, Senado: 0, comStatus: 0 } });
    renderWarnings([]);
    renderQueryChips({ query: {} });
    renderComparisonPanel({ sources: [] });
    renderApp();
    reportPdfButton.disabled = true;
    setStatus(error.message || "Falha inesperada ao consultar os dados.", false);
  } finally {
    submitButton.disabled = false;
    if (saveSearchButton) {
      saveSearchButton.disabled = false;
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitSearch();
});

advancedToggleButton?.addEventListener("click", () => {
  const nextExpanded = !form.classList.contains("is-advanced");
  form.classList.toggle("is-advanced", nextExpanded);
  syncAdvancedToggle(getFormPayload());
});

saveSearchButton?.addEventListener("click", () => {
  saveCurrentSearch();
});

clearButton.addEventListener("click", () => {
  form.reset();
  applyPayloadToForm(DEFAULT_FORM_VALUES);
  localStorage.removeItem(STORAGE_KEYS.draft);
  lastPayload = null;
  uiState.currentPage = 1;
  uiState.selectedKey = null;
  uiState.showFavoritesOnly = false;
  renderWarnings([]);
  renderQueryChips({ query: {} });
  renderComparisonPanel({ sources: [] });
  updateSummary({ total: 0, counts: { Camara: 0, Senado: 0, comStatus: 0 } });
  exportButton.disabled = true;
  reportPdfButton.disabled = true;
  syncAdvancedToggle();
  renderApp();
  setStatus("Campos limpos. Monte um novo recorte para pesquisar.", false);
});

exportButton.addEventListener("click", () => {
  if (lastPayload?.items?.length) {
    exportCsv(lastPayload.items);
  }
});

reportPdfButton.addEventListener("click", () => {
  if (getReportItems().length && lastPayload) {
    exportReportPdf();
  }
});

favoritesFilterButton?.addEventListener("click", () => {
  uiState.showFavoritesOnly = !uiState.showFavoritesOnly;
  uiState.currentPage = 1;
  renderQueryChips(lastPayload || { query: {} });
  renderApp({ selectFirstVisible: true });
});

sortSelect.addEventListener("change", () => {
  uiState.sort = sortSelect.value;
  uiState.currentPage = 1;
  renderApp({ selectFirstVisible: true });
});

pageSizeSelect.addEventListener("change", () => {
  uiState.pageSize = Number(pageSizeSelect.value);
  uiState.currentPage = 1;
  renderApp({ selectFirstVisible: true });
});

prevPageButton.addEventListener("click", () => {
  if (uiState.currentPage <= 1) {
    return;
  }

  uiState.currentPage -= 1;
  renderApp({ selectFirstVisible: true });
});

nextPageButton.addEventListener("click", () => {
  const totalItems = getFilteredItems().length;
  const totalPages = Math.max(1, Math.ceil(totalItems / uiState.pageSize));
  if (uiState.currentPage >= totalPages) {
    return;
  }

  uiState.currentPage += 1;
  renderApp({ selectFirstVisible: true });
});

resultsBody.addEventListener("click", (event) => {
  if (event.target.closest("summary, details")) {
    return;
  }

  if (event.target.closest("a")) {
    return;
  }

  const favoriteButton = event.target.closest("[data-favorite-key]");
  if (favoriteButton) {
    toggleFavoriteByKey(favoriteButton.dataset.favoriteKey);
    return;
  }

  const detailButton = event.target.closest("[data-detail-key]");
  if (detailButton) {
    uiState.selectedKey = detailButton.dataset.detailKey;
    renderApp();
    return;
  }

  const row = event.target.closest("[data-row-key]");
  if (row) {
    uiState.selectedKey = row.dataset.rowKey;
    renderApp();
  }
});

resultsBody.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  if (event.target.closest("summary, details, a, button, input, select, textarea")) {
    return;
  }

  const row = event.target.closest("[data-row-key]");
  if (!row) {
    return;
  }

  event.preventDefault();
  uiState.selectedKey = row.dataset.rowKey;
  renderApp();
});

detailPanel.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-detail-favorite]");
  if (!favoriteButton) {
    return;
  }

  toggleFavoriteByKey(favoriteButton.dataset.detailFavorite);
});

assistantPanel?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-assistant-action]");
  if (!button) {
    return;
  }

  await runAssistantAction(button.dataset.assistantAction);
});

savedSearchesList?.addEventListener("click", async (event) => {
  const applyButton = event.target.closest("[data-apply-search]");
  if (applyButton) {
    const entry = getSavedSearches().find((item) => item.id === applyButton.dataset.applySearch);
    if (!entry) {
      return;
    }

    applyPayloadToForm(entry.payload);
    await submitSearch();
    return;
  }

  const deleteButton = event.target.closest("[data-delete-search]");
  if (deleteButton) {
    removeSavedSearch(deleteButton.dataset.deleteSearch);
  }
});

favoritesList?.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-favorite]");
  if (openButton) {
    openFavorite(openButton.dataset.openFavorite);
    return;
  }

  const removeButton = event.target.closest("[data-remove-favorite]");
  if (removeButton) {
    removeFavorite(removeButton.dataset.removeFavorite);
  }
});

exampleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const preset = EXAMPLES[button.dataset.example];
    if (!preset) {
      return;
    }

    applyPayloadToForm(preset);
    await submitSearch();
  });
});

quickFillButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    form.elements.busca.value = button.dataset.quickFill || "";
    saveDraft(getFormPayload());
    setStatus("Tema preenchido. Rodando a busca com o recorte atual...", false);
    await submitSearch();
  });
});

siglaPicker?.addEventListener("change", (event) => {
  if (!event.target.matches("[data-sigla-option]")) {
    return;
  }

  syncSiglaPickerUi();
  saveDraft(getFormPayload());
  syncAdvancedToggle();
});

siglaSelectCommonButton?.addEventListener("click", () => {
  setSelectedSiglas(SIGLA_COMMON_TYPES.map((item) => item.code));
  saveDraft(getFormPayload());
  syncAdvancedToggle();
});

siglaSelectAllButton?.addEventListener("click", () => {
  setSelectedSiglas(ALL_SIGLA_TYPES.map((item) => item.code));
  saveDraft(getFormPayload());
  syncAdvancedToggle();
});

siglaClearAllButton?.addEventListener("click", () => {
  setSelectedSiglas([]);
  saveDraft(getFormPayload());
  syncAdvancedToggle();
});

renderSiglaPicker();
loadDraft();
renderSavedSearches();
renderFavoritesList();
renderComparisonPanel({ sources: [] });
renderApp();
if (window.location.protocol === "file:") {
  setStatus("Interface carregada. Para a busca funcionar, abra o projeto por um servidor ou pelo deploy com /api/buscar ativo.", false);
} else {
  setStatus("Pronto para pesquisar. Comece so com nome, tema ou os dois e abra os filtros avancados apenas se precisar.", false);
}
