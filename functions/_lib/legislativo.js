const STOPWORDS = new Set([
  "A", "AS", "O", "OS", "UM", "UMA", "UNS", "UMAS", "DE", "DA", "DO", "DAS", "DOS",
  "E", "EM", "NO", "NA", "NOS", "NAS", "POR", "PARA", "COM", "SEM", "SOBRE", "QUE",
  "SE", "AO", "AOS", "OU", "CONFORME", "TIPO", "TODOS", "TODAS", "TODO", "TODA",
  "DELAS", "DELES", "PELO", "PELA", "PELOS", "PELAS", "CAUSA", "TEMA", "ASSUNTO",
  "PROJETO", "PROJETOS", "LEI", "LEIS"
]);

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export function httpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return false;
  }

  return ["1", "true", "sim", "s", "yes", "y", "on"].includes(value.trim().toLowerCase());
}

function normalizeHouse(value) {
  const house = (value || "Ambas").trim();
  if (["Ambas", "Camara", "Senado"].includes(house)) {
    return house;
  }

  return "Ambas";
}

function normalizeMode(value) {
  const mode = (value || "Todas").trim();
  if (["Todas", "Qualquer"].includes(mode)) {
    return mode;
  }

  return "Todas";
}

function parseLimit(value) {
  if (value === null || value === undefined || value === "") {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_LIMIT;
  }

  if (parsed <= 0) {
    return 0;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function parseYear(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseSiglas(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => parseSiglas(item)))];
  }

  return [...new Set(
    String(value)
      .split(/[,;\s]+/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
  )];
}

function compressWhitespace(text) {
  if (!text) {
    return null;
  }

  return String(text).replace(/\s+/g, " ").trim() || null;
}

function firstNonEmpty(values) {
  for (const value of values) {
    const normalized = compressWhitespace(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function ensureArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeExternalUrl(url) {
  const normalized = compressWhitespace(url);
  if (!normalized) {
    return null;
  }

  return normalized.replace(/^http:\/\//i, "https://");
}

function normalizeText(text) {
  if (!text) {
    return "";
  }

  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(text) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  return [...new Set(
    normalized
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
  )];
}

function looseTokenMatch(searchToken, candidateToken) {
  if (!searchToken || !candidateToken) {
    return false;
  }

  if (searchToken === candidateToken) {
    return true;
  }

  const minLength = Math.min(searchToken.length, candidateToken.length);
  if (minLength < 4) {
    return false;
  }

  if (searchToken.includes(candidateToken) || candidateToken.includes(searchToken)) {
    return true;
  }

  const prefixLength = Math.min(minLength, 5);
  return searchToken.slice(0, prefixLength) === candidateToken.slice(0, prefixLength);
}

function testSearchMatch(text, params) {
  if (!params.buscaNormalizada) {
    return true;
  }

  const haystack = normalizeText(text);
  if (!haystack) {
    return false;
  }

  if (haystack.includes(params.buscaNormalizada)) {
    return true;
  }

  if (params.searchTokens.length === 0) {
    return true;
  }

  const haystackTokens = getSearchTokens(text);
  if (haystackTokens.length === 0) {
    return false;
  }

  let matchedCount = 0;

  for (const searchToken of params.searchTokens) {
    const matched = haystackTokens.some((candidate) => looseTokenMatch(searchToken, candidate));

    if (matched) {
      matchedCount += 1;
      if (params.modoBusca === "Qualquer") {
        return true;
      }
    } else if (params.modoBusca === "Todas") {
      return false;
    }
  }

  return params.modoBusca === "Todas" && matchedCount === params.searchTokens.length;
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).replace("T", " ");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return compressWhitespace(value);
  }

  const pad = (number) => String(number).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function normalizeQueryName(params) {
  if (params.nome && params.busca) {
    return `${params.nome} - ${params.busca}`;
  }

  return params.nome || params.busca || "consulta";
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "monitor-parlamentar-federal-web/1.0"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw httpError(response.status, `Falha ao consultar ${url}`, text.slice(0, 500));
  }

  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "monitor-parlamentar-federal-web/1.0"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw httpError(response.status, `Falha ao consultar ${url}`, text.slice(0, 500));
  }

  return response.json();
}

function buildParams(rawParams) {
  const nome = compressWhitespace(rawParams.nome);
  const busca = compressWhitespace(rawParams.busca);
  const casa = normalizeHouse(rawParams.casa);
  const modoBusca = normalizeMode(rawParams.modoBusca);
  const siglas = parseSiglas(rawParams.siglas);
  const uf = compressWhitespace(rawParams.uf)?.toUpperCase() || null;
  const anoInicial = parseYear(rawParams.anoInicial);
  const anoFinal = parseYear(rawParams.anoFinal);
  const limit = parseLimit(rawParams.limite);
  const somenteAutorPrincipal = normalizeBoolean(rawParams.somenteAutorPrincipal);
  const semDetalhes = normalizeBoolean(rawParams.semDetalhes);
  const buscaNormalizada = normalizeText(busca);
  const searchTokens = getSearchTokens(busca);
  const apiKeywordQuery = busca
    ? (searchTokens.length > 0 ? searchTokens.join(" ") : busca)
    : null;

  return {
    nome,
    busca,
    buscaNormalizada,
    modoBusca,
    casa,
    siglas,
    uf,
    anoInicial,
    anoFinal,
    limit,
    somenteAutorPrincipal,
    semDetalhes,
    searchTokens,
    apiKeywordQuery,
    queryLabel: normalizeQueryName({ nome, busca })
  };
}

function matterFilters({ sigla, ano, autorPrincipal, supportsAutorPrincipal }, params) {
  if (params.siglas.length > 0) {
    if (!sigla || !params.siglas.includes(String(sigla).toUpperCase())) {
      return false;
    }
  }

  if (params.anoInicial > 0 && Number(ano) < params.anoInicial) {
    return false;
  }

  if (params.anoFinal > 0 && Number(ano) > params.anoFinal) {
    return false;
  }

  if (params.somenteAutorPrincipal && supportsAutorPrincipal && autorPrincipal !== true) {
    return false;
  }

  return true;
}

function resolveCandidate(candidates, requestedName, uf, label) {
  let matches = [...candidates];

  if (uf) {
    matches = matches.filter((candidate) => candidate.uf === uf);
  }

  if (matches.length === 0) {
    throw httpError(404, `Nenhum ${label} encontrado para "${requestedName}".`);
  }

  const normalizedRequested = normalizeText(requestedName);
  const exact = matches.filter((candidate) => normalizeText(candidate.nome) === normalizedRequested);
  if (exact.length === 1) {
    return exact[0];
  }

  const contains = matches.filter((candidate) => {
    const normalizedCandidate = normalizeText(candidate.nome);
    return normalizedCandidate.includes(normalizedRequested) || normalizedRequested.includes(normalizedCandidate);
  });

  if (contains.length === 1) {
    return contains[0];
  }

  if (matches.length === 1) {
    return matches[0];
  }

  const options = matches
    .slice(0, 8)
    .map((candidate) => `${candidate.nome} (${candidate.uf || "--"}/${candidate.partido || "--"})`)
    .join("; ");

  throw httpError(409, `Mais de um ${label} corresponde a "${requestedName}". Refine com UF.`, options);
}

function getHouseLabel(casa) {
  return casa === "Senado" ? "Senado" : "Camara";
}

function buildHouseResolutionWarning(casa, requestedName, error) {
  const label = getHouseLabel(casa);

  if (!error?.status) {
    return `No ${label}, houve uma falha ao localizar "${requestedName}". A busca continuou com as demais fontes.`;
  }

  if (error.status === 404) {
    return `No ${label}, nao encontramos parlamentar ativo com o nome "${requestedName}". A busca continuou com as demais fontes.`;
  }

  if (error.status === 409) {
    return `No ${label}, o nome "${requestedName}" ficou ambiguo. A busca continuou com as demais fontes. Para incluir essa casa, informe a UF.`;
  }

  return `No ${label}, houve uma falha ao localizar "${requestedName}". A busca continuou com as demais fontes.`;
}

async function resolveParlamentares(params, warnings) {
  const houses = params.casa === "Ambas" ? ["Camara", "Senado"] : [params.casa];

  if (!params.nome) {
    return houses.map((house) => ({
      casa: house,
      codigo: null,
      nome: house === "Senado" ? "Busca global no Senado" : "Busca global na Camara",
      uf: null,
      partido: null,
      url: null
    }));
  }

  const resolved = [];
  const failures = [];

  for (const house of houses) {
    try {
      if (house === "Camara") {
        resolved.push(await getCamaraDeputado(params.nome, params.uf));
      } else {
        resolved.push(await getSenadoSenador(params.nome, params.uf));
      }
    } catch (error) {
      if (houses.length === 1) {
        throw error;
      }

      failures.push(error);
      warnings.push(buildHouseResolutionWarning(house, params.nome, error));
    }
  }

  if (resolved.length > 0) {
    return resolved;
  }

  throw failures[0] || httpError(404, `Nenhum parlamentar encontrado para "${params.nome}".`);
}

async function getCamaraDeputado(nome, uf) {
  const url = new URL("https://dadosabertos.camara.leg.br/api/v2/deputados");
  url.searchParams.set("nome", nome);
  url.searchParams.set("itens", "100");
  url.searchParams.set("ordem", "ASC");
  url.searchParams.set("ordenarPor", "nome");
  if (uf) {
    url.searchParams.set("siglaUf", uf);
  }

  const response = await fetchJson(url.toString());
  const candidates = (response.dados || []).map((item) => ({
    casa: "Camara",
    codigo: Number(item.id),
    nome: item.nome,
    uf: item.siglaUf || null,
    partido: item.siglaPartido || null,
    url: item.uri || null
  }));

  return resolveCandidate(candidates, nome, uf, "deputado");
}

async function getSenadoSenador(nome, uf) {
  const response = await fetchJson("https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json");
  const parlamentares = response.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || [];

  const candidates = parlamentares.map((item) => {
    const identificacao = item.IdentificacaoParlamentar || {};
    return {
      casa: "Senado",
      codigo: Number(identificacao.CodigoParlamentar),
      nome: identificacao.NomeParlamentar,
      uf: identificacao.UfParlamentar || null,
      partido: identificacao.SiglaPartidoParlamentar || null,
      url: identificacao.UrlPaginaParlamentar || null
    };
  });

  return resolveCandidate(candidates, nome, uf, "senador");
}

function getCamaraBaseSearchText(baseItem) {
  const portalSource = baseItem?.portalSource || {};
  const portalAuthors = ensureArray(portalSource.autores)
    .map((author) => author?.nome)
    .filter(Boolean)
    .join("; ");
  const portalThemes = ensureArray(portalSource.temaPortal).join("; ");
  const portalAutoThemes = ensureArray(portalSource.temaAutomatico)
    .map((theme) => theme?.tema)
    .filter(Boolean)
    .join("; ");
  const portalStates = ensureArray(portalSource.estados)
    .map((state) => firstNonEmpty([state?.descricaoExterna, state?.descricao, state?.apelido, state?.sigla]))
    .filter(Boolean)
    .join("; ");

  return [
    baseItem.siglaTipo,
    baseItem.numero,
    baseItem.ano,
    baseItem.ementa,
    portalSource.indexacao,
    portalSource.explicacaoEmenta,
    portalSource.situacaoAtual,
    portalSource.tipoSituacaoProposicao,
    portalSource.nomeOrgaoOrigem,
    portalAuthors,
    portalThemes,
    portalAutoThemes,
    portalStates
  ].filter(Boolean).join(" ");
}

function getSenadoBaseSearchText(baseItem) {
  if (!baseItem) {
    return "";
  }

  if (!baseItem.Materia) {
    return [
      baseItem.sigla,
      baseItem.numero,
      baseItem.ano,
      baseItem.identificacao,
      baseItem.ementa,
      baseItem.autoria,
      baseItem.tipoDocumento,
      baseItem.tipoConteudo
    ].filter(Boolean).join(" ");
  }

  return [
    baseItem.Materia?.Sigla,
    baseItem.Materia?.Numero,
    baseItem.Materia?.Ano,
    baseItem.Materia?.DescricaoIdentificacao,
    baseItem.Materia?.Ementa
  ].filter(Boolean).join(" ");
}

function getResultSearchText(item) {
  return [
    item.parlamentar,
    item.autores,
    item.tipo,
    item.tipoDescricao,
    item.identificacao,
    item.ementa,
    item.searchIndexText,
    item.situacaoAtual,
    item.ultimoAndamento,
    item.localAtual
  ].filter(Boolean).join(" ");
}

async function getCamaraBaseItemsByDeputado(parlamentar, params) {
  const items = [];
  let page = 1;
  const canStopEarly = !(params.somenteAutorPrincipal || params.busca);

  while (true) {
    const url = new URL("https://dadosabertos.camara.leg.br/api/v2/proposicoes");
    url.searchParams.set("idDeputadoAutor", String(parlamentar.codigo));
    url.searchParams.set("pagina", String(page));
    url.searchParams.set("itens", "100");
    url.searchParams.set("ordem", "DESC");
    url.searchParams.set("ordenarPor", "id");

    if (params.busca && params.apiKeywordQuery) {
      url.searchParams.set("keywords", params.apiKeywordQuery);
    }

    if (params.siglas.length === 1) {
      url.searchParams.set("siglaTipo", params.siglas[0]);
    }

    const response = await fetchJson(url.toString());
    const batch = response.dados || [];
    if (batch.length === 0) {
      break;
    }

    for (const item of batch) {
      const keep = matterFilters({
        sigla: item.siglaTipo,
        ano: Number(item.ano),
        autorPrincipal: false,
        supportsAutorPrincipal: false
      }, params) && testSearchMatch(getCamaraBaseSearchText(item), params);

      if (keep) {
        items.push(item);
        if (params.limit > 0 && canStopEarly && items.length >= params.limit) {
          return items.slice(0, params.limit);
        }
      }
    }

    const hasNext = (response.links || []).some((link) => link.rel === "next");
    if (!hasNext) {
      break;
    }

    page += 1;
  }

  return items;
}

function buildCamaraSearchApiPayload(params, page) {
  return {
    q: params.apiKeywordQuery,
    pagina: page,
    order: "relevancia"
  };
}

function mapCamaraPortalHit(hit) {
  const source = hit?._source || {};
  const id = Number(source.id || 0) || null;

  return {
    id,
    siglaTipo: firstNonEmpty([source.siglaProposicao]),
    numero: Number(source.numero || 0) || null,
    ano: Number(source.ano || source.anoApresentacao || 0) || null,
    ementa: compressWhitespace(source.ementa),
    dataApresentacao: firstNonEmpty([source.dataApresentacao, source.dataOrdenacao]),
    uri: id ? `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}` : null,
    portalSource: source
  };
}

function matchesCamaraPortalFilters(baseItem, params) {
  if (!params.uf) {
    return true;
  }

  const authors = ensureArray(baseItem?.portalSource?.autores);
  if (authors.length === 0) {
    return true;
  }

  return authors.some((author) => String(author?.siglaUF || "").toUpperCase() === params.uf);
}

async function getCamaraBaseItemsGlobalFromSearchApi(params) {
  if (!params.apiKeywordQuery) {
    throw httpError(400, "A busca global precisa de palavras-chave.");
  }

  const seen = new Set();
  const allItems = [];
  const pageSize = 20;
  const targetItems = params.limit > 0 ? Math.max(params.limit * 3, 60) : 200;
  const hardMaxPages = params.limit > 0 ? Math.max(Math.ceil(targetItems / pageSize) + 2, 6) : 25;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= hardMaxPages) {
    const response = await postJson(
      "https://www.camara.leg.br/busca-api/api/v1/busca/proposicoes/_search",
      buildCamaraSearchApiPayload(params, page)
    );
    const totalHits = Number(response?.hits?.total?.value || 0);
    const hits = ensureArray(response?.hits?.hits);

    totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
    if (hits.length === 0) {
      break;
    }

    for (const hit of hits) {
      const item = mapCamaraPortalHit(hit);
      if (!item.id || seen.has(item.id)) {
        continue;
      }

      seen.add(item.id);

      const keep = matterFilters({
        sigla: item.siglaTipo,
        ano: Number(item.ano),
        autorPrincipal: false,
        supportsAutorPrincipal: false
      }, params)
        && matchesCamaraPortalFilters(item, params)
        && testSearchMatch(getCamaraBaseSearchText(item), params);

      if (keep) {
        allItems.push(item);
      }
    }

    if (params.limit > 0 && allItems.length >= targetItems) {
      break;
    }

    page += 1;
  }

  return allItems;
}

async function getCamaraBaseItemsGlobal(params) {
  if (!params.apiKeywordQuery) {
    throw httpError(400, "A busca global precisa de palavras-chave.");
  }

  try {
    const officialItems = await getCamaraBaseItemsGlobalFromSearchApi(params);
    if (officialItems.length > 0) {
      return officialItems;
    }
  } catch (_) {
    // Fall back to Dados Abertos if the broader official search is unavailable.
  }

  // Tipos de proposição para busca ampla — igual ao site oficial da Câmara
  const SIGLAS = params.siglas.length > 0
    ? params.siglas
    : ["PL", "PEC", "PLP", "PDL", "MPV", "PLV", "PRC", "REQ", "INC", "MSC", "EMC", "SBT"];

  const seen = new Set();
  const allItems = [];

  // Busca em paralelo por cada tipo de proposição, pegando múltiplas páginas
  await Promise.allSettled(
    SIGLAS.map(async (sigla) => {
      let page = 1;
      const MAX_PAGES = 5; // 5 páginas × 100 itens = 500 por tipo

      while (page <= MAX_PAGES) {
        const url = new URL("https://dadosabertos.camara.leg.br/api/v2/proposicoes");
        url.searchParams.set("keywords", params.apiKeywordQuery);
        url.searchParams.set("siglaTipo", sigla);
        url.searchParams.set("pagina", String(page));
        url.searchParams.set("itens", "100");
        url.searchParams.set("ordem", "DESC");
        url.searchParams.set("ordenarPor", "id");

        // Filtro de ano só se o usuário preencheu explicitamente
        if (params.anoInicial > 0) {
          url.searchParams.set("dataInicio", `${params.anoInicial}-01-01`);
        }
        if (params.anoFinal > 0) {
          url.searchParams.set("dataFim", `${params.anoFinal}-12-31`);
        }

        let response;
        try {
          response = await fetchJson(url.toString());
        } catch (_) {
          break;
        }

        const batch = response.dados || [];
        if (batch.length === 0) break;

        for (const item of batch) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);

          const keep = matterFilters({
            sigla: item.siglaTipo,
            ano: Number(item.ano),
            autorPrincipal: false,
            supportsAutorPrincipal: false
          }, params) && testSearchMatch(getCamaraBaseSearchText(item), params);

          if (keep) allItems.push(item);
        }

        const hasNext = (response.links || []).some((l) => l.rel === "next");
        if (!hasNext) break;
        page += 1;
      }
    })
  );

  // Ordena do mais recente para o mais antigo (igual ao site oficial)
  allItems.sort((a, b) =>
    (Number(b.ano) || 0) - (Number(a.ano) || 0) ||
    (Number(b.numero) || 0) - (Number(a.numero) || 0)
  );

  return params.limit > 0 ? allItems.slice(0, params.limit) : allItems;
}

async function getSenadoBaseItems(parlamentar, params) {
  const response = await fetchJson(`https://legis.senado.leg.br/dadosabertos/senador/${parlamentar.codigo}/autorias.json`);
  const authorias = response.MateriasAutoriaParlamentar?.Parlamentar?.Autorias?.Autoria || [];

  return authorias.filter((item) => {
    const isPrimary = item.IndicadorAutorPrincipal === "Sim";
    return matterFilters({
      sigla: item.Materia?.Sigla,
      ano: Number(item.Materia?.Ano),
      autorPrincipal: isPrimary,
      supportsAutorPrincipal: true
    }, params) && testSearchMatch(getSenadoBaseSearchText(item), params);
  });
}

function getSenadoProcessResults(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return ensureArray(response?.Processo || response?.processo);
}

async function getSenadoBaseItemsGlobal(params) {
  if (!params.apiKeywordQuery) {
    throw httpError(400, "A busca global precisa de palavras-chave.");
  }

  const url = new URL("https://legis.senado.leg.br/dadosabertos/processo.json");
  url.searchParams.set("termo", params.apiKeywordQuery);

  if (params.siglas.length === 1) {
    url.searchParams.set("sigla", params.siglas[0]);
  }

  if (params.anoInicial > 0) {
    url.searchParams.set("dataInicioApresentacao", `${params.anoInicial}-01-01`);
  }

  if (params.anoFinal > 0) {
    url.searchParams.set("dataFimApresentacao", `${params.anoFinal}-12-31`);
  }

  const response = await fetchJson(url.toString());
  const baseItems = getSenadoProcessResults(response)
    .filter((item) =>
      matterFilters({
        sigla: item.sigla,
        ano: Number(item.ano),
        autorPrincipal: false,
        supportsAutorPrincipal: false
      }, params) && testSearchMatch(getSenadoBaseSearchText(item), params)
    )
    .sort((left, right) =>
      String(right.dataApresentacao || "").localeCompare(String(left.dataApresentacao || "")) ||
      Number(right.id || 0) - Number(left.id || 0)
    );

  return params.limit > 0 ? baseItems.slice(0, params.limit) : baseItems;
}

async function getSenadoProcessDetail(id) {
  return fetchJson(`https://legis.senado.leg.br/dadosabertos/processo/${id}.json`);
}

function summarizeSenadoProcessAuthors(baseItem, detail) {
  const detailAuthors = [...ensureArray(detail?.documento?.autoria)]
    .sort((left, right) => Number(left.ordem || 99999) - Number(right.ordem || 99999));

  if (detailAuthors.length > 0) {
    const primary = detailAuthors[0];
    const autores = firstNonEmpty([
      detail?.documento?.resumoAutoria,
      detailAuthors.map((author) => author.autor).filter(Boolean).join("; "),
      baseItem?.autoria
    ]);

    return {
      displayName: firstNonEmpty([primary.autor, autores, "Autoria nao informada"]),
      autores,
      partido: primary.siglaPartido || null,
      uf: primary.uf || null,
      codigoParlamentar: Number(primary.codigoParlamentar || 0) || null
    };
  }

  const autores = firstNonEmpty([detail?.documento?.resumoAutoria, baseItem?.autoria, "Autoria nao informada"]);
  return {
    displayName: compressWhitespace(String(autores).split(",")[0]) || autores,
    autores,
    partido: null,
    uf: null,
    codigoParlamentar: null
  };
}

function sortByDateDesc(items, getDate) {
  return [...items].sort((left, right) => String(getDate(right) || "").localeCompare(String(getDate(left) || "")));
}

function convertSenadoProcessResult(baseItem, parlamentar, detail) {
  const authorSummary = summarizeSenadoProcessAuthors(baseItem, detail);
  const autuacoes = ensureArray(detail?.autuacoes);
  const currentAutuacao = [...autuacoes].sort((left, right) => Number(right.numero || 0) - Number(left.numero || 0))[0];
  const situacoes = autuacoes.flatMap((autuacao) =>
    ensureArray(autuacao.situacoes).map((situacao) => ({ ...situacao, _autuacao: autuacao }))
  );
  const informes = autuacoes.flatMap((autuacao) =>
    ensureArray(autuacao.informesLegislativos).map((informe) => ({ ...informe, _autuacao: autuacao }))
  );
  const latestSituacao = sortByDateDesc(situacoes, (situacao) => situacao.fim || situacao.inicio)[0];
  const latestInforme = sortByDateDesc(informes, (informe) => informe.data)[0];
  const codigoMateria = detail?.codigoMateria || baseItem?.codigoMateria || null;
  const processId = detail?.id || baseItem?.id || null;

  return {
    casa: "Senado",
    parlamentar: authorSummary.displayName || parlamentar.nome,
    uf: authorSummary.uf || parlamentar.uf || null,
    partido: authorSummary.partido || parlamentar.partido || null,
    codigoParlamentar: authorSummary.codigoParlamentar || parlamentar.codigo || null,
    tipo: detail?.sigla || baseItem?.sigla || null,
    tipoDescricao: firstNonEmpty([detail?.descricaoSigla, detail?.conteudo?.tipo, baseItem?.tipoDocumento, baseItem?.tipoConteudo]),
    numero: Number(detail?.numero || baseItem?.numero || 0),
    ano: Number(detail?.ano || baseItem?.ano || 0),
    identificacao: firstNonEmpty([detail?.identificacao, baseItem?.identificacao]),
    dataApresentacao: formatDate(firstNonEmpty([detail?.documento?.dataApresentacao, detail?.documento?.data, baseItem?.dataApresentacao])),
    autorPrincipal: null,
    autorPrincipalNome: authorSummary.displayName || null,
    autores: authorSummary.autores,
    tramitando: firstNonEmpty([detail?.tramitando, baseItem?.tramitando]),
    situacaoAtual: firstNonEmpty([
      latestSituacao?.descricao,
      baseItem?.tramitando === "Sim" ? "Materia em tramitacao" : null
    ]),
    dataSituacao: formatDate(firstNonEmpty([latestSituacao?.fim, latestSituacao?.inicio])),
    localAtual: firstNonEmpty([
      currentAutuacao?.nomeColegiadoControleAtual,
      currentAutuacao?.siglaColegiadoControleAtual,
      latestSituacao?.colegiado?.nome,
      latestSituacao?.colegiado?.sigla,
      latestInforme?.colegiado?.nome,
      latestInforme?.colegiado?.sigla,
      detail?.siglaEnteIdentificador,
      baseItem?.enteIdentificador
    ]),
    ultimoAndamento: firstNonEmpty([latestInforme?.descricao]),
    dataUltimoAndamento: formatDate(latestInforme?.data),
    ementa: compressWhitespace(firstNonEmpty([detail?.conteudo?.ementa, baseItem?.ementa])),
    searchIndexText: getSenadoBaseSearchText(baseItem),
    link: codigoMateria ? `https://www25.senado.leg.br/web/atividade/materias/-/materia/${codigoMateria}` : null,
    linkApi: processId ? `https://legis.senado.leg.br/dadosabertos/processo/${processId}.json` : null,
    linkPdfOriginal: normalizeExternalUrl(firstNonEmpty([detail?.documento?.url, baseItem?.urlDocumento]))
  };
}

async function getCamaraDetail(id) {
  const response = await fetchJson(`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}`);
  return response.dados || null;
}

async function getCamaraAutores(id, uriAutores) {
  const url = uriAutores || `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}/autores`;
  const response = await fetchJson(url);
  return response.dados || [];
}

async function getSenadoMovimentacoes(codigo) {
  const response = await fetchJson(`https://legis.senado.leg.br/dadosabertos/materia/movimentacoes/${codigo}.json`);
  return response.MovimentacaoMateria?.Materia || null;
}

async function getSenadoTextos(codigo) {
  const response = await fetchJson(`https://legis.senado.leg.br/dadosabertos/materia/textos/${codigo}.json`);
  return ensureArray(response.TextoMateria?.Materia?.Textos?.Texto);
}

function pickSenadoOriginalText(textos) {
  const candidates = ensureArray(textos)
    .filter((texto) => compressWhitespace(texto?.UrlTexto))
    .map((texto) => {
      const type = String(texto?.DescricaoTipoTexto || "");
      const description = String(texto?.DescricaoTexto || "");
      const autoria = String(texto?.AutoriaTexto || "");
      const combined = `${type} ${description}`.toLowerCase();
      let score = 0;

      if (String(texto?.FormatoTexto || "").toLowerCase().includes("pdf")) {
        score += 4;
      }

      if (/(projeto|proposta|requerimento|indicacao|emenda|pec|medida provisoria|texto inicial|original)/i.test(combined)) {
        score += 10;
      }

      if (/avulso inicial/i.test(combined)) {
        score += 6;
      }

      if (autoria && !/senado federal/i.test(autoria)) {
        score += 5;
      }

      if (/(relatorio|parecer|oficio|mensagem|listagem|autografo|redacao final)/i.test(combined)) {
        score -= 8;
      }

      return {
        ...texto,
        _score: score,
        _date: String(texto?.DataTexto || "")
      };
    });

  if (!candidates.length) {
    return null;
  }

  return [...candidates].sort((left, right) => {
    if (right._score !== left._score) {
      return right._score - left._score;
    }

    return String(left._date).localeCompare(String(right._date));
  })[0];
}

function summarizeCamaraAuthors(authors, parlamentar) {
  const ordered = [...authors].sort((left, right) => {
    const diffProponente = Number(right.proponente || 0) - Number(left.proponente || 0);
    if (diffProponente !== 0) {
      return diffProponente;
    }

    return Number(left.ordemAssinatura || 99999) - Number(right.ordemAssinatura || 99999);
  });

  if (ordered.length === 0) {
    return {
      displayName: parlamentar?.nome || "Autor não identificado",
      queryIsPrimary: null,
      allNames: parlamentar?.nome || null,
      partido: parlamentar?.partido || null,
      uf: parlamentar?.uf || null,
      codigoParlamentar: parlamentar?.codigo || null
    };
  }

  const primary = ordered[0];
  const allNames = [...new Set(ordered.map((author) => author.nome).filter(Boolean))];
  let queryIsPrimary = null;

  if (parlamentar?.codigo) {
    const matched = ordered.find((author) => String(author.uri || "").endsWith(`/${parlamentar.codigo}`));
    if (matched) {
      queryIsPrimary = Number(matched.proponente || 0) === 1;
    }
  }

  return {
    displayName: primary.nome || parlamentar?.nome || "Autor não identificado",
    queryIsPrimary,
    allNames: allNames.join("; "),
    partido: firstNonEmpty([primary.siglaPartido]),
    uf: firstNonEmpty([primary.siglaUf, primary.siglaUF]),
    codigoParlamentar: Number(String(primary.uri || "").match(/(\d+)(?:\/)?$/)?.[1] || 0) || null
  };
}

function summarizeCamaraPortalAuthors(authors, parlamentar) {
  const ordered = ensureArray(authors).sort((left, right) =>
    Number(left?.numSequencial || 99999) - Number(right?.numSequencial || 99999)
  );

  if (ordered.length === 0) {
    return summarizeCamaraAuthors([], parlamentar);
  }

  const primary = ordered[0];
  const visible = ordered.filter((author) => author?.bolAutorExibir !== false && compressWhitespace(author?.nome));
  const roster = (visible.length > 0 ? visible : ordered)
    .map((author) => author?.nome)
    .filter(Boolean);

  return {
    displayName: firstNonEmpty([primary?.nome, parlamentar?.nome, "Autor nao identificado"]),
    queryIsPrimary: parlamentar?.codigo ? Number(primary?.codParlamentar || 0) === Number(parlamentar.codigo || 0) : null,
    allNames: [...new Set(roster)].join("; "),
    partido: firstNonEmpty([primary?.siglaPartido]),
    uf: firstNonEmpty([primary?.siglaUF]),
    codigoParlamentar: Number(primary?.codParlamentar || 0) || null
  };
}

function convertCamaraResult(baseItem, parlamentar, detail, authorSummary) {
  const status = detail?.statusProposicao || null;
  const portalSource = baseItem?.portalSource || {};
  const portalState = [...ensureArray(portalSource.estados)].sort((left, right) =>
    Number(right?.idEstadoProposicaoOrgao || 0) - Number(left?.idEstadoProposicaoOrgao || 0)
  )[0];
  const portalDespacho = [...ensureArray(portalSource.despachos)].sort((left, right) =>
    Number(right?.codTramitacao || 0) - Number(left?.codTramitacao || 0)
  )[0];
  const displayName = (!parlamentar?.codigo && authorSummary?.displayName)
    ? authorSummary.displayName
    : parlamentar.nome;

  return {
    casa: "Camara",
    parlamentar: displayName,
    uf: authorSummary?.uf || parlamentar.uf || null,
    partido: authorSummary?.partido || parlamentar.partido || null,
    codigoParlamentar: authorSummary?.codigoParlamentar || parlamentar.codigo || null,
    tipo: baseItem.siglaTipo || null,
    tipoDescricao: firstNonEmpty([detail?.descricaoTipo, portalSource.descricaoProposicao]),
    numero: Number(baseItem.numero || 0),
    ano: Number(baseItem.ano || 0),
    identificacao: `${baseItem.siglaTipo || ""} ${baseItem.numero || ""}/${baseItem.ano || ""}`.trim(),
    dataApresentacao: formatDate(baseItem.dataApresentacao),
    autorPrincipal: authorSummary?.queryIsPrimary ?? null,
    autorPrincipalNome: authorSummary?.displayName ?? null,
    autores: authorSummary?.allNames ?? parlamentar.nome ?? null,
    tramitando: firstNonEmpty([portalSource.emTramitacao]),
    situacaoAtual: firstNonEmpty([
      status?.descricaoSituacao,
      status?.descricaoTramitacao,
      portalSource.situacaoAtual,
      portalSource.tipoSituacaoProposicao,
      portalState?.descricaoExterna,
      portalState?.descricao
    ]),
    dataSituacao: formatDate(firstNonEmpty([status?.dataHora, portalSource.dataDaUltimaTramitacao])),
    localAtual: firstNonEmpty([status?.siglaOrgao, portalState?.sigla, portalState?.apelido, portalSource.siglaOrgaoOrigem]),
    ultimoAndamento: firstNonEmpty([status?.despacho, portalDespacho?.textoDespacho]),
    dataUltimoAndamento: formatDate(firstNonEmpty([status?.dataHora, portalSource.dataDaUltimaTramitacao])),
    ementa: compressWhitespace(baseItem.ementa),
    searchIndexText: getCamaraBaseSearchText(baseItem),
    link: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${baseItem.id}`,
    linkApi: baseItem.uri || `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${baseItem.id}`,
    linkPdfOriginal: firstNonEmpty([
      detail?.urlInteiroTeor,
      status?.url,
      portalSource.codArquivoTeor ? `https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=${portalSource.codArquivoTeor}` : null
    ])
  };
}

function convertSenadoResult(baseItem, parlamentar, movimentacao, textoOriginal) {
  const materia = baseItem.Materia || {};
  const autuacoes = ensureArray(movimentacao?.Autuacoes?.Autuacao);
  const latestAutuacao = [...autuacoes].sort((left, right) => Number(right.NumeroAutuacao || 0) - Number(left.NumeroAutuacao || 0))[0];
  const situacoes = ensureArray(latestAutuacao?.SituacoesAtuais?.SituacaoAtual);
  const situacaoAtual = [...situacoes].sort((left, right) => String(right.DataSituacao || "").localeCompare(String(left.DataSituacao || "")))[0];
  const informes = ensureArray(latestAutuacao?.InformesLegislativos?.InformeLegislativo);
  const ultimoInforme = [...informes].sort((left, right) => String(right.Data || "").localeCompare(String(left.Data || "")))[0];
  const identificacao = movimentacao?.IdentificacaoMateria || {};
  const isPrimary = baseItem.IndicadorAutorPrincipal === "Sim";

  return {
    casa: "Senado",
    parlamentar: parlamentar.nome,
    uf: parlamentar.uf || null,
    partido: parlamentar.partido || null,
    codigoParlamentar: parlamentar.codigo,
    tipo: materia.Sigla || null,
    tipoDescricao: firstNonEmpty([identificacao.DescricaoSubtipoMateria]),
    numero: Number(materia.Numero || 0),
    ano: Number(materia.Ano || 0),
    identificacao: firstNonEmpty([materia.DescricaoIdentificacao]),
    dataApresentacao: formatDate(materia.Data),
    autorPrincipal: isPrimary,
    autorPrincipalNome: isPrimary ? parlamentar.nome : null,
    autores: parlamentar.nome,
    tramitando: identificacao.IndicadorTramitando || null,
    situacaoAtual: firstNonEmpty([situacaoAtual?.DescricaoSituacao]),
    dataSituacao: formatDate(situacaoAtual?.DataSituacao),
    localAtual: firstNonEmpty([ultimoInforme?.Local?.NomeLocal, ultimoInforme?.Local?.SiglaLocal]),
    ultimoAndamento: firstNonEmpty([ultimoInforme?.Descricao]),
    dataUltimoAndamento: formatDate(ultimoInforme?.Data),
    ementa: compressWhitespace(materia.Ementa),
    searchIndexText: getSenadoBaseSearchText(baseItem),
    link: `https://www25.senado.leg.br/web/atividade/materias/-/materia/${materia.Codigo}`,
    linkApi: `https://legis.senado.leg.br/dadosabertos/materia/${materia.Codigo}.json`,
    linkPdfOriginal: normalizeExternalUrl(textoOriginal?.UrlTexto)
  };
}

function buildErrorItem({ casa, parlamentar, baseItem, errorMessage }) {
  if (casa === "Camara") {
    return {
      casa: "Camara",
      parlamentar: parlamentar?.nome || "Autor não identificado",
      uf: parlamentar?.uf || null,
      partido: parlamentar?.partido || null,
      codigoParlamentar: parlamentar?.codigo || null,
      tipo: baseItem.siglaTipo || null,
      tipoDescricao: null,
      numero: Number(baseItem.numero || 0),
      ano: Number(baseItem.ano || 0),
      identificacao: `${baseItem.siglaTipo || ""} ${baseItem.numero || ""}/${baseItem.ano || ""}`.trim(),
      dataApresentacao: formatDate(baseItem.dataApresentacao),
      autorPrincipal: null,
      autorPrincipalNome: null,
      autores: parlamentar?.nome || null,
      tramitando: null,
      situacaoAtual: "Erro ao consultar detalhe",
      dataSituacao: null,
      localAtual: null,
      ultimoAndamento: compressWhitespace(errorMessage),
      dataUltimoAndamento: null,
      ementa: compressWhitespace(baseItem.ementa),
      link: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${baseItem.id}`,
      linkApi: baseItem.uri || null,
      linkPdfOriginal: null
    };
  }

  if (!baseItem?.Materia) {
    return {
      casa: "Senado",
      parlamentar: compressWhitespace(String(baseItem?.autoria || "").split(",")[0]) || parlamentar.nome,
      uf: parlamentar?.uf || null,
      partido: parlamentar?.partido || null,
      codigoParlamentar: parlamentar?.codigo || null,
      tipo: baseItem?.sigla || null,
      tipoDescricao: firstNonEmpty([baseItem?.tipoDocumento, baseItem?.tipoConteudo]),
      numero: Number(baseItem?.numero || 0),
      ano: Number(baseItem?.ano || 0),
      identificacao: baseItem?.identificacao || null,
      dataApresentacao: formatDate(baseItem?.dataApresentacao),
      autorPrincipal: null,
      autorPrincipalNome: null,
      autores: compressWhitespace(baseItem?.autoria),
      tramitando: baseItem?.tramitando || null,
      situacaoAtual: "Erro ao consultar detalhe",
      dataSituacao: null,
      localAtual: baseItem?.enteIdentificador || null,
      ultimoAndamento: compressWhitespace(errorMessage),
      dataUltimoAndamento: null,
      ementa: compressWhitespace(baseItem?.ementa),
      link: baseItem?.codigoMateria ? `https://www25.senado.leg.br/web/atividade/materias/-/materia/${baseItem.codigoMateria}` : null,
      linkApi: baseItem?.id ? `https://legis.senado.leg.br/dadosabertos/processo/${baseItem.id}.json` : null,
      linkPdfOriginal: normalizeExternalUrl(baseItem?.urlDocumento)
    };
  }

  return {
    casa: "Senado",
    parlamentar: parlamentar.nome,
    uf: parlamentar.uf || null,
    partido: parlamentar.partido || null,
    codigoParlamentar: parlamentar.codigo,
    tipo: baseItem.Materia?.Sigla || null,
    tipoDescricao: null,
    numero: Number(baseItem.Materia?.Numero || 0),
    ano: Number(baseItem.Materia?.Ano || 0),
    identificacao: baseItem.Materia?.DescricaoIdentificacao || null,
    dataApresentacao: formatDate(baseItem.Materia?.Data),
    autorPrincipal: baseItem.IndicadorAutorPrincipal === "Sim",
    autorPrincipalNome: baseItem.IndicadorAutorPrincipal === "Sim" ? parlamentar.nome : null,
    autores: parlamentar.nome,
    tramitando: null,
    situacaoAtual: "Erro ao consultar detalhe",
    dataSituacao: null,
    localAtual: null,
    ultimoAndamento: compressWhitespace(errorMessage),
    dataUltimoAndamento: null,
    ementa: compressWhitespace(baseItem.Materia?.Ementa),
    link: `https://www25.senado.leg.br/web/atividade/materias/-/materia/${baseItem.Materia?.Codigo}`,
    linkApi: `https://legis.senado.leg.br/dadosabertos/materia/${baseItem.Materia?.Codigo}.json`,
    linkPdfOriginal: null
  };
}

function sortResults(items) {
  return [...items].sort((left, right) => {
    const rightTimestamp = Date.parse(String(
      right.dataSituacao ||
      right.dataUltimoAndamento ||
      right.dataApresentacao ||
      ""
    ).replace(" ", "T"));
    const leftTimestamp = Date.parse(String(
      left.dataSituacao ||
      left.dataUltimoAndamento ||
      left.dataApresentacao ||
      ""
    ).replace(" ", "T"));

    if ((Number.isNaN(rightTimestamp) ? 0 : rightTimestamp) !== (Number.isNaN(leftTimestamp) ? 0 : leftTimestamp)) {
      return (Number.isNaN(rightTimestamp) ? 0 : rightTimestamp) - (Number.isNaN(leftTimestamp) ? 0 : leftTimestamp);
    }

    if ((right.ano || 0) !== (left.ano || 0)) {
      return (right.ano || 0) - (left.ano || 0);
    }

    if ((right.numero || 0) !== (left.numero || 0)) {
      return (right.numero || 0) - (left.numero || 0);
    }

    return String(left.casa || "").localeCompare(String(right.casa || ""));
  });
}

function summarise(items) {
  const counts = {
    Camara: items.filter((item) => item.casa === "Camara").length,
    Senado: items.filter((item) => item.casa === "Senado").length,
    comStatus: items.filter((item) => item.situacaoAtual).length,
    autorPrincipal: items.filter((item) => item.autorPrincipal === true).length
  };

  return counts;
}

async function runCamaraSearch(parlamentar, params, warnings) {
  const baseItems = parlamentar.codigo
    ? await getCamaraBaseItemsByDeputado(parlamentar, params)
    : await getCamaraBaseItemsGlobal(params);

  const items = [];

  for (const baseItem of baseItems) {
    try {
      let detail = null;
      let authorSummary = null;

      if (!parlamentar.codigo || params.somenteAutorPrincipal) {
        if (!parlamentar.codigo && ensureArray(baseItem?.portalSource?.autores).length > 0) {
          authorSummary = summarizeCamaraPortalAuthors(baseItem.portalSource.autores, parlamentar);
        } else {
          const authors = await getCamaraAutores(baseItem.id, baseItem.uriAutores);
          authorSummary = summarizeCamaraAuthors(authors, parlamentar);
        }

        if (params.somenteAutorPrincipal && authorSummary.queryIsPrimary !== true) {
          continue;
        }
      }

      if (!params.semDetalhes) {
        detail = await getCamaraDetail(baseItem.id);
      }

      const item = convertCamaraResult(baseItem, parlamentar, detail, authorSummary);
      if (testSearchMatch(getResultSearchText(item), params)) {
        items.push(item);
      }
    } catch (error) {
      const item = buildErrorItem({
        casa: "Camara",
        parlamentar,
        baseItem,
        errorMessage: error.message
      });

      if (testSearchMatch(getResultSearchText(item), params)) {
        items.push(item);
      }
    }

    if (params.limit > 0 && items.length >= params.limit) {
      return items.slice(0, params.limit);
    }
  }

  if (!parlamentar.codigo && params.limit > 0 && items.length === 0) {
    warnings.push("Nenhum resultado temático foi encontrado na Câmara com o recorte informado.");
  }

  return items;
}

async function runSenadoSearch(parlamentar, params) {
  const baseItems = parlamentar.codigo
    ? await getSenadoBaseItems(parlamentar, params)
    : await getSenadoBaseItemsGlobal(params);
  const sliced = params.limit > 0 ? baseItems.slice(0, params.limit) : baseItems;
  const items = [];

  for (const baseItem of sliced) {
    try {
      let item;

      if (parlamentar.codigo) {
        const [movimentacao, textos] = await Promise.all([
          params.semDetalhes ? null : getSenadoMovimentacoes(baseItem.Materia?.Codigo),
          getSenadoTextos(baseItem.Materia?.Codigo)
        ]);
        item = convertSenadoResult(baseItem, parlamentar, movimentacao, pickSenadoOriginalText(textos));
      } else {
        const detail = params.semDetalhes ? null : await getSenadoProcessDetail(baseItem.id);
        item = convertSenadoProcessResult(baseItem, parlamentar, detail);
      }

      if (testSearchMatch(getResultSearchText(item), params)) {
        items.push(item);
      }
    } catch (error) {
      const item = buildErrorItem({
        casa: "Senado",
        parlamentar,
        baseItem,
        errorMessage: error.message
      });

      if (testSearchMatch(getResultSearchText(item), params)) {
        items.push(item);
      }
    }
  }

  return items;
}

export async function buscarMaterias(rawParams) {
  const params = buildParams(rawParams);
  const warnings = [];

  if (!params.nome && !params.busca) {
    throw httpError(400, "Informe um nome de parlamentar, uma busca temática ou ambos.");
  }

  const parlamentares = await resolveParlamentares(params, warnings);
  const houses = params.casa === "Ambas" ? ["Camara", "Senado"] : [params.casa];

  if (false && params.nome) {
    if (houses.includes("Camara")) {
      parlamentares.push(await getCamaraDeputado(params.nome, params.uf));
    }

    if (houses.includes("Senado")) {
      parlamentares.push(await getSenadoSenador(params.nome, params.uf));
    }
  } else if (false) {
    parlamentares.push({
      casa: "Camara",
      codigo: null,
      nome: "Busca global na Câmara",
      uf: null,
      partido: null,
      url: null
    });
  }

  let items = [];

  for (const parlamentar of parlamentares) {
    if (parlamentar.casa === "Camara") {
      items = items.concat(await runCamaraSearch(parlamentar, params, warnings));
    } else {
      items = items.concat(await runSenadoSearch(parlamentar, params));
    }
  }

  items = sortResults(items);
  if (params.limit > 0) {
    items = items.slice(0, params.limit);
  }

  return {
    generatedAt: new Date().toISOString(),
    query: {
      nome: params.nome,
      busca: params.busca,
      modoBusca: params.modoBusca,
      casa: params.casa,
      siglas: params.siglas,
      uf: params.uf,
      anoInicial: params.anoInicial,
      anoFinal: params.anoFinal,
      limite: params.limit,
      somenteAutorPrincipal: params.somenteAutorPrincipal,
      semDetalhes: params.semDetalhes
    },
    warnings,
    total: items.length,
    counts: summarise(items),
    items
  };
}
