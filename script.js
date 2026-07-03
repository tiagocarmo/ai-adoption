(() => {
  const STORAGE_KEY = "ai-adoption-data-wizard-state";
  const STORAGE_PREFIX = "ai-adoption-data-";
  const DIAGNOSIS_CONFIG_FILE = "content/01-diagnostico-organizacional-e-de-engenharia.json";
  const PHASE_TWO_CONFIG_FILE = "content/02-time-ai-enablers.json";
  const PHASE_THREE_CONFIG_FILE = "content/03-definicao-do-time-piloto.json";
  const PHASE_FOUR_CONFIG_FILE = "content/04-remocao-de-gargalos-organizacionais-e-tecnicos.json";
  const PHASE_FIVE_CONFIG_FILE = "content/05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.json";
  const PHASE_SIX_CONFIG_FILE = "content/06-governanca-e-padronizacao.json";
  const PHASE_SEVEN_CONFIG_FILE = "content/07-escala-organizacional.json";

  const WIZARD_STEPS = [
    {
      id: "fase-1",
      order: 1,
      slug: "diagnostico-organizacional-e-de-engenharia",
      title: "Diagnóstico Organizacional e de Engenharia",
      file: "content/01-diagnostico-organizacional-e-de-engenharia.md"
    },
    {
      id: "fase-2",
      order: 2,
      slug: "time-ai-enablers",
      title: "Time AI Enablers",
      file: "content/02-time-ai-enablers.md"
    },
    {
      id: "fase-3",
      order: 3,
      slug: "definicao-do-time-piloto",
      title: "Definição do Time Piloto",
      file: "content/03-definicao-do-time-piloto.md"
    },
    {
      id: "fase-4",
      order: 4,
      slug: "remocao-de-gargalos-organizacionais-e-tecnicos",
      title: "Remoção de Gargalos Organizacionais e Técnicos",
      file: "content/04-remocao-de-gargalos-organizacionais-e-tecnicos.md"
    },
    {
      id: "fase-5",
      order: 5,
      slug: "adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento",
      title: "Adoção Progressiva de IA no Fluxo de Desenvolvimento",
      file: "content/05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.md"
    },
    {
      id: "fase-6",
      order: 6,
      slug: "governanca-e-padronizacao",
      title: "Governança e Padronização",
      file: "content/06-governanca-e-padronizacao.md"
    },
    {
      id: "fase-7",
      order: 7,
      slug: "escala-organizacional",
      title: "Escala Organizacional",
      file: "content/07-escala-organizacional.md"
    }
  ];
  const STEP_DEPENDENCIES = {
    0: [],
    1: [0],
    2: [1],
    3: [2],
    4: [2, 3],
    5: [2, 3, 4],
    6: [2, 4, 5]
  };

  const markdownCache = new Map();
  let diagnosisConfigCache = null;
  let phaseTwoConfigCache = null;
  let phaseThreeConfigCache = null;
  let phaseFourConfigCache = null;
  let phaseFiveConfigCache = null;
  let phaseSixConfigCache = null;
  let phaseSevenConfigCache = null;

  const createInitialWizardState = () => ({
    currentStep: 0,
    completedSteps: new Set(),
    phaseAnswers: {},
    phaseSelections: {},
    phaseResults: {},
    phaseReports: {},
    phaseAcknowledged: {}
  });

  const storageService = {
    getProjectStorages() {
      const storages = [];
      if (typeof localStorage !== "undefined") {
        storages.push(localStorage);
      }
      if (typeof sessionStorage !== "undefined" && sessionStorage !== localStorage) {
        storages.push(sessionStorage);
      }
      return storages;
    },

    getPrimaryStorage() {
      return this.getProjectStorages()[0] || null;
    },

    sanitizeCompletedSteps(value) {
      if (!Array.isArray(value)) {
        return new Set();
      }
      return new Set(
        value
          .filter((item) => Number.isInteger(item))
          .map((item) => Math.max(0, Math.min(WIZARD_STEPS.length - 1, item)))
      );
    },

    normalizeStateCandidate(state, options = {}) {
      const { allowPartial = false } = options;
      if (!state || typeof state !== "object" || Array.isArray(state)) {
        return null;
      }
      if (!allowPartial && (typeof state.currentStep !== "number" || !Array.isArray(state.completedSteps))) {
        return null;
      }

      const hasCurrentStep = typeof state.currentStep === "number";
      const hasCompletedSteps = Array.isArray(state.completedSteps);
      return {
        currentStep: hasCurrentStep ? Math.max(0, Math.min(WIZARD_STEPS.length - 1, state.currentStep)) : 0,
        completedSteps: hasCompletedSteps ? this.sanitizeCompletedSteps(state.completedSteps) : new Set(),
        phaseAnswers: this.sanitizeStepMap(state.phaseAnswers),
        phaseSelections: this.sanitizeStepMap(state.phaseSelections),
        phaseResults: this.sanitizeStepMap(state.phaseResults),
        phaseReports: this.sanitizeStepMap(state.phaseReports),
        phaseAcknowledged: this.sanitizeBooleanStepMap(state.phaseAcknowledged)
      };
    },

    loadState() {
      try {
        const storages = this.getProjectStorages();
        for (const storage of storages) {
          const rawState = storage.getItem(STORAGE_KEY);
          if (!rawState) {
            continue;
          }

          const state = JSON.parse(rawState);
          const normalized = this.normalizeStateCandidate(state);
          if (!normalized) {
            continue;
          }

          if (storage !== this.getPrimaryStorage()) {
            this.saveState(normalized);
          }
          return normalized;
        }
      } catch (error) {
        console.error("error loading wizard state", error);
      }
      return null;
    },

    sanitizeStepMap(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
      }
      const safe = {};
      Object.entries(value).forEach(([key, mapValue]) => {
        if (!mapValue || typeof mapValue !== "object" || Array.isArray(mapValue)) {
          return;
        }
        safe[key] = mapValue;
      });
      return safe;
    },

    sanitizeBooleanStepMap(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
      }
      const safe = {};
      Object.entries(value).forEach(([key, mapValue]) => {
        safe[key] = Boolean(mapValue);
      });
      return safe;
    },

    saveState(state) {
      const storage = this.getPrimaryStorage();
      if (!storage) {
        return;
      }
      const serializable = {
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        phaseAnswers: state.phaseAnswers,
        phaseSelections: state.phaseSelections,
        phaseResults: state.phaseResults,
        phaseReports: state.phaseReports,
        phaseAcknowledged: state.phaseAcknowledged
      };
      storage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    },

    clearState() {
      this.getProjectStorages().forEach((storage) => storage.removeItem(STORAGE_KEY));
    },

    clearProjectSessionData() {
      const keysToRemove = [];
      this.getProjectStorages().forEach((storage) => {
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (typeof key === "string" && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push({ storage, key });
          }
        }
      });
      keysToRemove.forEach(({ storage, key }) => storage.removeItem(key));
      return keysToRemove.map(({ key }) => key);
    }
  };

  const markdownService = {
    async loadStepMarkdown(step) {
      if (markdownCache.has(step.file)) {
        return markdownCache.get(step.file);
      }

      const response = await fetch(step.file);
      if (!response.ok) {
        throw new Error(`failed to load markdown: ${step.file}`);
      }

      const text = await response.text();
      markdownCache.set(step.file, text);
      return text;
    },

    parseMarkdown(mdText) {
      const lines = mdText.split(/\r?\n/);
      const html = [];
      let paragraphBuffer = [];
      let listBuffer = [];

      const flushParagraph = () => {
        if (!paragraphBuffer.length) {
          return;
        }
        html.push(`<p>${paragraphBuffer.join(" ")}</p>`);
        paragraphBuffer = [];
      };

      const flushList = () => {
        if (!listBuffer.length) {
          return;
        }
        html.push(`<ul>${listBuffer.map((item) => `<li>${item}</li>`).join("")}</ul>`);
        listBuffer = [];
      };

      const flushBlocks = () => {
        flushParagraph();
        flushList();
      };

      const safeInline = (value) => this.inlineMarkdown(this.escapeHtml(value.trim()));
      const isTableLine = (value) => /^\|.+\|$/u.test(value.trim());
      const isTableSeparator = (value) => /^\|(?:\s*:?-{3,}:?\s*\|)+$/u.test(value.trim());

      const parseTableRow = (line) => line.trim().slice(1, -1).split("|").map((cell) => safeInline(cell));

      for (let index = 0; index < lines.length; index += 1) {
        const rawLine = lines[index];
        const line = rawLine.trim();

        if (!line) {
          flushBlocks();
          continue;
        }

        if (isTableLine(line) && isTableSeparator(lines[index + 1] || "")) {
          flushBlocks();

          const headers = parseTableRow(line);
          const rows = [];
          index += 2;

          while (index < lines.length && isTableLine(lines[index])) {
            rows.push(parseTableRow(lines[index]));
            index += 1;
          }
          index -= 1;

          const headerHtml = `<thead><tr>${headers.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead>`;
          const bodyHtml = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
          html.push(`<div class="table-wrap"><table>${headerHtml}${bodyHtml}</table></div>`);
          continue;
        }

        const heading = /^(#{1,3})\s+(.+)$/u.exec(line);
        if (heading) {
          flushBlocks();
          const level = heading[1].length;
          html.push(`<h${level}>${safeInline(heading[2])}</h${level}>`);
          continue;
        }

        if (/^---+$/u.test(line)) {
          flushBlocks();
          html.push("<hr>");
          continue;
        }

        const quote = /^>\s?(.*)$/u.exec(line);
        if (quote) {
          flushBlocks();
          html.push(`<blockquote>${safeInline(quote[1])}</blockquote>`);
          continue;
        }

        const listItem = /^[-*]\s+(.+)$/u.exec(line);
        if (listItem) {
          flushParagraph();
          listBuffer.push(safeInline(listItem[1]));
          continue;
        }

        flushList();
        paragraphBuffer.push(safeInline(line));
      }

      flushBlocks();
      return html.join("\n");
    },

    extractStepSections(mdText) {
      const sections = this.splitSections(mdText);
      const get = (keywords) => this.findSectionByHeading(sections, keywords);

      return {
        phaseGoal: get(["objetivo da fase", "objetivo"]),
        methodology: get(["metodologia de pontuação", "metodologia"]),
        macroBlocks: get(["3 macro-blocos", "macro-blocos"]),
        diagnosisQuestions: get(["9 perguntas", "perguntas do diagnóstico", "perguntas"]),
        recommendations: get(["recomendações", "recomendacoes", "conclusão esperada", "critérios"]),
        intro: sections[0]?.text || "Conteúdo não encontrado."
      };
    },

    findSectionByHeading(sections, keywords) {
      const found = sections.find((section) => keywords.some((keyword) => section.heading.includes(keyword)));
      return found?.text || "Conteúdo não encontrado.";
    },

    splitSections(mdText) {
      const lines = mdText.split(/\r?\n/);
      const sections = [];
      let current = { heading: "intro", content: [] };

      for (const rawLine of lines) {
        const line = rawLine.trim();
        const heading = /^##\s+(.+)$/u.exec(line);
        if (heading) {
          sections.push(current);
          current = { heading: heading[1].toLowerCase(), content: [] };
          continue;
        }
        current.content.push(rawLine);
      }
      sections.push(current);

      return sections
        .map((section) => ({ heading: section.heading, text: section.content.join("\n").trim() }))
        .filter((section) => section.text.length > 0);
    },

    escapeHtml(value) {
      return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    },

    inlineMarkdown(text) {
      return text.replace(/\*\*(.+?)\*\*/gu, "<strong>$1</strong>");
    }
  };

  const diagnosisService = {
    async loadConfig() {
      if (diagnosisConfigCache) {
        return diagnosisConfigCache;
      }

      const response = await fetch(DIAGNOSIS_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load diagnosis config: ${DIAGNOSIS_CONFIG_FILE}`);
      }

      diagnosisConfigCache = await response.json();
      return diagnosisConfigCache;
    },

    calculateResult(config, answers = {}) {
      const scoreByQuestion = {};
      const blockScores = {};
      const answeredIds = new Set(Object.keys(answers));

      config.questions.forEach((question) => {
        const selectedOptionId = answers[question.id];
        const selectedOption = question.options.find((option) => option.id === selectedOptionId);
        if (!selectedOption) {
          return;
        }

        const score = Number(selectedOption.score);
        scoreByQuestion[question.id] = {
          questionId: question.id,
          block: question.block,
          label: question.title,
          score,
          optionId: selectedOption.id,
          optionLabel: selectedOption.label
        };

        if (!blockScores[question.block]) {
          blockScores[question.block] = [];
        }
        blockScores[question.block].push(score);
      });

      const answeredCount = Object.keys(scoreByQuestion).length;
      const total = config.questions.length;
      const allScores = Object.values(scoreByQuestion).map((entry) => entry.score);
      const average = allScores.length ? allScores.reduce((acc, value) => acc + value, 0) / allScores.length : 0;
      const overallBand = this.resolveBand(config.scoreBands, average);
      const blockAverages = Object.entries(blockScores).map(([blockId, values]) => ({
        blockId,
        average: values.reduce((acc, value) => acc + value, 0) / values.length
      }));

      return {
        answeredCount,
        total,
        completion: total ? Math.round((answeredCount / total) * 100) : 0,
        average,
        overallBand,
        answeredIds: Array.from(answeredIds),
        scoreByQuestion,
        blockAverages
      };
    },

    resolveBand(scoreBands, score) {
      const matched = scoreBands.find((band) => score >= band.min && score < band.max);
      if (matched) {
        return matched;
      }
      return scoreBands[scoreBands.length - 1];
    },

    getBottleneck(config, result) {
      const entries = Object.values(result.scoreByQuestion);
      if (!entries.length) {
        return null;
      }

      const minScore = Math.min(...entries.map((entry) => entry.score));
      const candidates = entries.filter((entry) => entry.score === minScore);

      if (candidates.length === 1) {
        return candidates[0];
      }

      const impactMap = config.impactPriority.reduce((acc, questionId, index) => {
        acc[questionId] = index;
        return acc;
      }, {});

      return candidates.sort((a, b) => {
        const aRank = impactMap[a.questionId] ?? Number.MAX_SAFE_INTEGER;
        const bRank = impactMap[b.questionId] ?? Number.MAX_SAFE_INTEGER;
        return aRank - bRank;
      })[0];
    }
  };

  const phaseTwoService = {
    async loadConfig() {
      if (phaseTwoConfigCache) {
        return phaseTwoConfigCache;
      }

      const response = await fetch(PHASE_TWO_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load phase two config: ${PHASE_TWO_CONFIG_FILE}`);
      }

      const config = await response.json();
      if (!Array.isArray(config.archetypes) || !Array.isArray(config.competencies)) {
        throw new Error("invalid phase two config");
      }

      phaseTwoConfigCache = config;
      return phaseTwoConfigCache;
    },

    calculateResult(config, answers = {}, selections = {}) {
      const answeredCompetencies = config.competencies
        .map((competency) => {
          const optionId = answers[competency.id];
          const option = config.familiarityOptions.find((item) => item.id === optionId);
          return option
            ? {
              competencyId: competency.id,
              title: competency.title,
              score: Number(option.score),
              optionLabel: option.label
            }
            : null;
        })
        .filter(Boolean);

      const answeredCount = answeredCompetencies.length;
      const total = config.competencies.length;
      const competencyAverage = answeredCount
        ? answeredCompetencies.reduce((acc, item) => acc + item.score, 0) / answeredCount
        : 0;

      const proficiency = config.proficiencyLevels.find((level) => level.id === selections.proficiencyLevelId) || null;
      const proficiencyScore = proficiency ? Number(proficiency.score) : 0;
      const archetype = config.archetypes.find((item) => item.id === selections.archetypeId) || null;
      const readinessRule = archetype ? config.archetypeReadinessRules[archetype.id] : null;

      const archetypeReadiness = archetype && readinessRule
        ? Number(
          proficiencyScore >= readinessRule.minProficiencyScore
          && competencyAverage >= readinessRule.minCompetencyAverage
        )
        : 0;

      const weights = config.weights || {};
      const combinedScore =
        (competencyAverage * Number(weights.competencies || 0))
        + (proficiencyScore * Number(weights.proficiency || 0))
        + (archetypeReadiness * 3 * Number(weights.archetypeReadiness || 0));

      const overallBand = this.resolveBand(config.scoreBands, combinedScore);
      const gaps = answeredCompetencies.filter((item) => item.score < 2).map((item) => item.competencyId);

      return {
        answeredCount,
        total,
        completion: total ? Math.round((answeredCount / total) * 100) : 0,
        competencyAverage,
        combinedScore,
        overallBand,
        archetype,
        proficiency,
        readinessRule,
        archetypeReadiness,
        competencyScores: answeredCompetencies,
        missingCompetencies: config.competencies
          .filter((item) => !answers[item.id])
          .map((item) => item.title),
        gaps
      };
    },

    resolveBand(scoreBands, score) {
      const matched = scoreBands.find((band) => score >= band.min && score < band.max);
      return matched || scoreBands[scoreBands.length - 1];
    },

    buildRecommendations(config, result) {
      const competencyRecommendations = result.gaps
        .map((gapId) => config.recommendations?.gapByCompetency?.[gapId])
        .filter(Boolean);

      const planHint = result.archetype
        ? config.recommendations?.planHints?.[result.archetype.id]
        : null;

      return {
        competencyRecommendations,
        planHint
      };
    }
  };

  const phaseThreeService = {
    async loadConfig() {
      if (phaseThreeConfigCache) {
        return phaseThreeConfigCache;
      }

      const response = await fetch(PHASE_THREE_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load phase three config: ${PHASE_THREE_CONFIG_FILE}`);
      }

      const config = await response.json();
      if (!Array.isArray(config.dimensions) || !Array.isArray(config.scoreBands)) {
        throw new Error("invalid phase three config");
      }

      phaseThreeConfigCache = config;
      return phaseThreeConfigCache;
    },

    calculateResult(config, answers = {}) {
      const scoredDimensions = config.dimensions
        .map((dimension) => {
          const selectedOptionId = answers[dimension.id];
          const selectedOption = dimension.options.find((option) => option.id === selectedOptionId);
          if (!selectedOption) {
            return null;
          }

          const weight = Number(dimension.weight);
          const score = Number(selectedOption.score);
          return {
            dimensionId: dimension.id,
            label: dimension.label,
            weight,
            score,
            weightedScore: score * weight,
            optionLabel: selectedOption.label,
            summary: selectedOption.summary
          };
        })
        .filter(Boolean);

      const answeredCount = scoredDimensions.length;
      const total = config.dimensions.length;
      const weightedTotal = scoredDimensions.reduce((acc, item) => acc + item.weightedScore, 0);
      const maxWeight = config.dimensions.reduce((acc, item) => acc + Number(item.weight), 0);
      const readinessScore = maxWeight ? weightedTotal / maxWeight : 0;
      const overallBand = this.resolveBand(config.scoreBands, readinessScore);
      const bottleneck = this.getBottleneck(config, scoredDimensions);
      const completion = total ? Math.round((answeredCount / total) * 100) : 0;

      return {
        answeredCount,
        total,
        completion,
        readinessScore,
        overallBand,
        scoredDimensions,
        bottleneck
      };
    },

    resolveBand(scoreBands, score) {
      const matched = scoreBands.find((band) => score >= band.min && score < band.max);
      return matched || scoreBands[scoreBands.length - 1];
    },

    getBottleneck(config, scoredDimensions) {
      if (!scoredDimensions.length) {
        return null;
      }
      const minScore = Math.min(...scoredDimensions.map((item) => item.score));
      const candidates = scoredDimensions.filter((item) => item.score === minScore);
      const priorityMap = config.impactPriority.reduce((acc, dimensionId, index) => {
        acc[dimensionId] = index;
        return acc;
      }, {});

      return candidates.sort((a, b) => {
        const aRank = priorityMap[a.dimensionId] ?? Number.MAX_SAFE_INTEGER;
        const bRank = priorityMap[b.dimensionId] ?? Number.MAX_SAFE_INTEGER;
        return aRank - bRank;
      })[0];
    },

    validateSelection(config, selection = {}) {
      const mode = selection.mode;
      if (!mode || !config.inputModes.some((inputMode) => inputMode.id === mode)) {
        return {
          valid: false,
          missing: ["Selecione o modo de avaliação do candidato ao piloto."]
        };
      }

      const modeFields = config.requiredFieldsByMode[mode] || [];
      const missingFields = modeFields
        .filter((field) => !(selection[field] && String(selection[field]).trim()));
      const missing = missingFields.map((field) => {
        const label = config.fieldLabels[field] || field;
        return `Preencha: ${label}.`;
      });

      return {
        valid: missing.length === 0,
        missing,
        missingFields
      };
    },

    getPendingItems(config, { answers = {}, selection = {}, acknowledged = false } = {}) {
      const pending = [];
      const validation = this.validateSelection(config, selection);
      const hasValidMode = Boolean(selection.mode)
        && config.inputModes.some((inputMode) => inputMode.id === selection.mode);

      if (!hasValidMode) {
        pending.push({
          id: "mode",
          kind: "selection",
          label: "Selecione o modo de avaliação do candidato ao piloto."
        });
      } else {
        (validation.missingFields || []).forEach((field) => {
          const label = config.fieldLabels[field] || field;
          pending.push({
            id: `field-${field}`,
            kind: "field",
            field,
            label: `Preencha o campo: ${label}.`
          });
        });
      }

      const result = this.calculateResult(config, answers);
      if (result.answeredCount < result.total) {
        pending.push({
          id: "dimensions",
          kind: "answers",
          label: `Responda as ${result.total} dimensões de prontidão (faltam ${result.total - result.answeredCount}).`
        });
      }

      if (!acknowledged) {
        pending.push({
          id: "acknowledgment",
          kind: "ack",
          label: "Marque a confirmação de entendimento da Fase 3."
        });
      }

      return pending;
    },

    buildRecommendations(config, result) {
      const bottleneckId = result.bottleneck?.dimensionId;
      const tools = config.toolCatalog.filter((tool) => {
        if (!bottleneckId) {
          return true;
        }
        return tool.prioritizedFor.includes(bottleneckId);
      });

      return {
        tools: tools.slice(0, 6),
        metrics: config.successMetrics[result.overallBand.id] || [],
        expansionCriteria: config.expansionCriteria[result.overallBand.id] || [],
        kickoffChecklist: config.kickoffChecklist || []
      };
    },

    buildExecutiveReport(config, selection, result, recommendations) {
      const modeMeta = config.inputModes.find((item) => item.id === selection.mode);
      const candidateName = selection.teamName || selection.leadName || selection.managerName || "Não informado";
      const rationale = selection.rationale || "Racional não informado.";

      return {
        generatedAt: new Date().toISOString(),
        mode: selection.mode,
        modeLabel: modeMeta?.label || selection.mode,
        candidateName,
        rationale,
        readinessScore: result.readinessScore,
        readinessLevel: result.overallBand.label,
        bottleneck: result.bottleneck,
        recommendations
      };
    }
  };

  const phaseFourService = {
    async loadConfig() {
      if (phaseFourConfigCache) {
        return phaseFourConfigCache;
      }

      const response = await fetch(PHASE_FOUR_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load phase four config: ${PHASE_FOUR_CONFIG_FILE}`);
      }

      const config = await response.json();
      if (!Array.isArray(config.trilhas) || !Array.isArray(config.marcos) || !config.regrasPontuacao) {
        throw new Error("invalid phase four config");
      }

      phaseFourConfigCache = config;
      return phaseFourConfigCache;
    },

    mapDimensionIdToLabel(dimensionId) {
      const map = {
        autonomia: "Autonomia",
        feedbackSpeed: "Vel. Feedback",
        senioridade: "Senioridade",
        segurancaPsicologica: "Uso de IA",
        estabilidadeRoadmap: "Flex. Org."
      };
      return map[dimensionId] || null;
    },

    inferBacklogFromUpstream(config, upstreamData = {}) {
      const result = [];
      const seen = new Set();
      const pushCandidate = (dimensionLabel, source) => {
        const mapped = config.dimensoesMapeadas?.[dimensionLabel];
        if (!mapped || !mapped.trilhaId || !mapped.gargalo) {
          return;
        }
        const key = `${mapped.trilhaId}|${mapped.gargalo.toLowerCase()}`;
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
        result.push({
          trilhaId: mapped.trilhaId,
          descricao: mapped.gargalo,
          source
        });
      };

      const phaseOneBottleneck = upstreamData.phaseOneBottleneckLabel;
      if (phaseOneBottleneck) {
        pushCandidate(phaseOneBottleneck, "phase-1");
      }

      const phaseThreeBottleneckId = upstreamData.phaseThreeBottleneckId;
      if (phaseThreeBottleneckId) {
        const label = this.mapDimensionIdToLabel(phaseThreeBottleneckId);
        if (label) {
          pushCandidate(label, "phase-3");
        }
      }

      (upstreamData.phaseThreeLowDimensions || []).forEach((dimensionId) => {
        const label = this.mapDimensionIdToLabel(dimensionId);
        if (label) {
          pushCandidate(label, "phase-3");
        }
      });

      return result;
    },

    buildInitialBacklog(config, upstreamData = {}) {
      const inferred = this.inferBacklogFromUpstream(config, upstreamData);
      const defaults = config.trilhas.flatMap((trilha) => trilha.itensBase.slice(0, 2).map((item) => ({
        trilhaId: trilha.id,
        descricao: item,
        source: "default"
      })));

      const merged = [...inferred];
      defaults.forEach((item) => {
        const exists = merged.some(
          (entry) => entry.trilhaId === item.trilhaId
            && entry.descricao.toLowerCase() === item.descricao.toLowerCase()
        );
        if (!exists) {
          merged.push(item);
        }
      });

      return merged.map((item, index) => ({
        id: `f4-${index + 1}`,
        trilhaId: item.trilhaId,
        descricao: item.descricao,
        source: item.source || "default",
        impacto: 2,
        esforco: 2,
        risco: 2
      }));
    },

    sanitizeBacklog(items = []) {
      if (!Array.isArray(items)) {
        return [];
      }

      const clean = [];
      const seen = new Set();
      items.forEach((item, index) => {
        if (!item || typeof item !== "object") {
          return;
        }

        const trilhaId = typeof item.trilhaId === "string" ? item.trilhaId.trim() : "";
        const descricao = typeof item.descricao === "string" ? item.descricao.trim() : "";
        const impacto = Number(item.impacto);
        const esforco = Number(item.esforco);
        const risco = Number(item.risco);
        const source = typeof item.source === "string" ? item.source.trim() : "";

        const isScoreValid = [impacto, esforco, risco].every((value) => Number.isInteger(value) && value >= 1 && value <= 3);
        if (!trilhaId || !descricao || descricao.length > 240 || !isScoreValid) {
          return;
        }

        const dedupeKey = `${trilhaId}|${descricao.toLowerCase()}`;
        if (seen.has(dedupeKey)) {
          return;
        }
        seen.add(dedupeKey);

        clean.push({
          id: typeof item.id === "string" && item.id ? item.id : `f4-${index + 1}`,
          trilhaId,
          descricao,
          source: ["phase-1", "phase-3", "default", "manual"].includes(source) ? source : "manual",
          impacto,
          esforco,
          risco
        });
      });

      return clean;
    },

    getBacklogItemIssues(item, config) {
      const descricao = typeof item?.descricao === "string" ? item.descricao.trim() : "";
      const trilhaId = typeof item?.trilhaId === "string" ? item.trilhaId.trim() : "";
      const scores = [Number(item?.impacto), Number(item?.esforco), Number(item?.risco)];

      const issues = {
        emptyDescription: !descricao,
        tooLong: descricao.length > 240,
        invalidScores: !scores.every((value) => Number.isInteger(value) && value >= 1 && value <= 3),
        unknownTrack: !trilhaId || !config.trilhas.some((trilha) => trilha.id === trilhaId),
        duplicate: false
      };
      issues.hasIssues = issues.emptyDescription || issues.tooLong || issues.invalidScores || issues.unknownTrack;
      return issues;
    },

    getBacklogDiagnostics(config, items = []) {
      const list = Array.isArray(items) ? items : [];
      const issuesById = {};
      const invalidIds = [];
      const duplicateIds = [];
      const validItems = [];
      const trackCount = config.trilhas.reduce((acc, trilha) => {
        acc[trilha.id] = 0;
        return acc;
      }, {});
      const seen = new Set();

      list.forEach((item, index) => {
        const id = item && typeof item.id === "string" && item.id ? item.id : `f4-${index + 1}`;
        const issues = this.getBacklogItemIssues(item, config);
        issuesById[id] = issues;

        if (issues.hasIssues) {
          invalidIds.push(id);
          return;
        }

        const trilhaId = item.trilhaId.trim();
        const descricao = item.descricao.trim();
        const dedupeKey = `${trilhaId}|${descricao.toLowerCase()}`;
        if (seen.has(dedupeKey)) {
          issues.duplicate = true;
          duplicateIds.push(id);
          return;
        }
        seen.add(dedupeKey);
        trackCount[trilhaId] += 1;

        const source = typeof item.source === "string" ? item.source.trim() : "";
        validItems.push({
          id,
          trilhaId,
          descricao,
          source: ["phase-1", "phase-3", "default", "manual"].includes(source) ? source : "manual",
          impacto: Number(item.impacto),
          esforco: Number(item.esforco),
          risco: Number(item.risco)
        });
      });

      const missingTracks = config.trilhas.filter((trilha) => (trackCount[trilha.id] || 0) < 1);

      return {
        issuesById,
        invalidIds,
        duplicateIds,
        validItems,
        trackCount,
        missingTracks
      };
    },

    getPendingItems(config, { backlogItems = [], acknowledged = false } = {}) {
      const diagnostics = this.getBacklogDiagnostics(config, backlogItems);
      const pending = [];

      diagnostics.missingTracks.forEach((trilha) => {
        pending.push({
          id: `track-${trilha.id}`,
          kind: "track",
          label: `Inclua ao menos 1 gargalo válido na trilha ${trilha.label || trilha.id}.`
        });
      });

      if (diagnostics.invalidIds.length) {
        pending.push({
          id: "invalid-items",
          kind: "invalid",
          itemIds: [...diagnostics.invalidIds],
          label: `${diagnostics.invalidIds.length} item(ns) do backlog com dados inválidos: descrição vazia ou acima de 240 caracteres, trilha inexistente ou pontuação fora de 1-3.`
        });
      }

      if (diagnostics.duplicateIds.length) {
        pending.push({
          id: "duplicate-items",
          kind: "duplicate",
          itemIds: [...diagnostics.duplicateIds],
          label: `${diagnostics.duplicateIds.length} item(ns) duplicados na mesma trilha — ajuste a descrição ou remova.`
        });
      }

      if (!acknowledged) {
        pending.push({
          id: "acknowledgment",
          kind: "ack",
          label: "Marque a confirmação de entendimento da Fase 4."
        });
      }

      return pending;
    },

    calculateScore(item) {
      return (item.impacto * 3) + ((4 - item.esforco) * 2) + (item.risco * 2);
    },

    resolvePriority(config, score) {
      const critical = config.regrasPontuacao.classificacao.critical;
      if (score >= critical.min) {
        return {
          id: "critical",
          label: critical.label
        };
      }

      return {
        id: "medium",
        label: config.regrasPontuacao.classificacao.medium.label
      };
    },

    calculatePrioritization(config, items = []) {
      const validItems = this.sanitizeBacklog(items);
      const prioritizedItems = validItems
        .map((item, index) => {
          const score = this.calculateScore(item);
          return {
            ...item,
            score,
            priority: this.resolvePriority(config, score),
            index
          };
        })
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          if (a.esforco !== b.esforco) {
            return a.esforco - b.esforco;
          }
          return a.index - b.index;
        });

      const groupedByTrack = prioritizedItems.reduce((acc, item) => {
        if (!acc[item.trilhaId]) {
          acc[item.trilhaId] = [];
        }
        acc[item.trilhaId].push(item);
        return acc;
      }, {});

      return {
        validItems,
        prioritizedItems,
        groupedByTrack
      };
    },

    buildRoadmap(config, prioritizedItems = []) {
      const roadmap = {
        d30: [],
        d90: [],
        d180: []
      };

      prioritizedItems.forEach((item) => {
        if (item.priority.id === "critical" && item.esforco === 1) {
          roadmap.d30.push(item);
          return;
        }

        if (item.esforco === 3) {
          roadmap.d180.push(item);
          return;
        }

        roadmap.d90.push(item);
      });

      const milestones = config.marcos.map((marco) => ({
        ...marco,
        items: roadmap[marco.id] || []
      }));

      return {
        d30: roadmap.d30,
        d90: roadmap.d90,
        d180: roadmap.d180,
        milestones
      };
    }
  };

  const phaseFiveService = {
    async loadConfig() {
      if (phaseFiveConfigCache) {
        return phaseFiveConfigCache;
      }

      const response = await fetch(PHASE_FIVE_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load phase five config: ${PHASE_FIVE_CONFIG_FILE}`);
      }

      const config = await response.json();
      if (!Array.isArray(config.stages) || !Array.isArray(config.templates) || !Array.isArray(config.baselineQuestions)) {
        throw new Error("invalid phase five config");
      }

      phaseFiveConfigCache = config;
      return phaseFiveConfigCache;
    },

    inferSignalsFromUpstream(upstream = {}) {
      const phaseOneBand = upstream.phaseOneBandId || "medium";
      const phaseTwoBand = upstream.phaseTwoBandId || "medium";
      const phaseThreeBand = upstream.phaseThreeBandId || "medium";
      const phaseThreeBottleneck = upstream.phaseThreeBottleneckId || "";

      const toLowMediumHigh = (band) => {
        if (band === "low") {
          return "low";
        }
        if (band === "high") {
          return "high";
        }
        return "medium";
      };

      return {
        currentAiUsage: phaseOneBand === "high" ? "organization" : phaseOneBand === "low" ? "none" : "team",
        overallLevel: toLowMediumHigh(phaseThreeBand),
        dxCode: phaseOneBand === "low" ? "low" : "medium",
        seniority: phaseThreeBottleneck === "senioridade" ? "low" : toLowMediumHigh(phaseTwoBand),
        quality: phaseThreeBottleneck === "qualidade" ? "low" : toLowMediumHigh(phaseOneBand),
        continuousDelivery: phaseThreeBottleneck === "feedbackSpeed" ? "low" : toLowMediumHigh(phaseOneBand)
      };
    },

    resolveTemplate(config, signals = {}, manualOverrides = {}) {
      const currentAiUsage = manualOverrides.currentAiUsage || signals.currentAiUsage;
      const overallLevel = manualOverrides.overallLevel || signals.overallLevel;

      if (currentAiUsage === "none" || overallLevel === "low") {
        return {
          templateId: "conservador",
          reason: "Uso atual de IA baixo ou maturidade geral baixa."
        };
      }
      if (currentAiUsage === "organization" || overallLevel === "high") {
        return {
          templateId: "agressivo",
          reason: "Uso atual de IA em escala ou maturidade geral alta."
        };
      }

      return {
        templateId: "balanceado",
        reason: "Cenário intermediário com evolução controlada por impacto."
      };
    },

    buildInitialPlan(config, upstreamData = {}) {
      const inferredSignals = this.inferSignalsFromUpstream(upstreamData);
      const templateResolution = this.resolveTemplate(config, inferredSignals, {});
      const template = config.templates.find((item) => item.id === templateResolution.templateId) || config.templates[1];
      const stagePlan = config.stages.map((stage) => ({
        stageId: stage.id,
        levelId: template.defaultLevels[stage.id] || "none",
        responsibilityId: "shared",
        selectedAntiPatterns: [],
        selectedCriteria: []
      }));

      return {
        signals: inferredSignals,
        templateId: template.id,
        templateReason: templateResolution.reason,
        stagePlan
      };
    },

    applyCalibrations(config, plan, upstreamSignals = {}) {
      const levelRank = {
        none: 0,
        experimental: 1,
        team: 2,
        org: 3
      };
      const lowerLevel = (current, maxAllowed) => {
        if (levelRank[current] <= levelRank[maxAllowed]) {
          return current;
        }
        return maxAllowed;
      };

      const calibrated = plan.stagePlan.map((entry) => ({ ...entry }));
      const warnings = [];

      const codeEntry = calibrated.find((item) => item.stageId === "codificacao");
      if (codeEntry && upstreamSignals.dxCode === "low") {
        codeEntry.levelId = lowerLevel(codeEntry.levelId, "experimental");
        warnings.push("Codificação limitada a experimental por DX/qualidade de código baixa.");
      }

      const reviewEntry = calibrated.find((item) => item.stageId === "review");
      if (reviewEntry && upstreamSignals.seniority === "low") {
        reviewEntry.levelId = lowerLevel(reviewEntry.levelId, "experimental");
        warnings.push("Code Review limitado a experimental por baixa senioridade média.");
      }

      const testsEntry = calibrated.find((item) => item.stageId === "testes");
      if (testsEntry && upstreamSignals.quality === "low") {
        testsEntry.levelId = lowerLevel(testsEntry.levelId, "experimental");
        warnings.push("Testes limitados a experimental por maturidade de qualidade baixa.");
      }

      const deployEntry = calibrated.find((item) => item.stageId === "deploy");
      if (deployEntry && upstreamSignals.continuousDelivery === "low") {
        deployEntry.levelId = "none";
        warnings.push("Deploy mantido em none até evoluir Continuous Delivery.");
      }

      return {
        ...plan,
        stagePlan: calibrated,
        warnings
      };
    },

    validatePlan(config, plan = {}) {
      const missing = [];
      if (!plan.templateId) {
        missing.push("Selecione um template de adoção.");
      }
      const planByStage = new Map((plan.stagePlan || []).map((item) => [item.stageId, item]));
      const allowedLevels = new Set(config.levels.map((item) => item.id));
      const allowedResponsibilities = new Set(config.responsibilityOptions.map((item) => item.id));

      config.stages.forEach((stage) => {
        const row = planByStage.get(stage.id);
        if (!row) {
          missing.push(`Estágio ${stage.label} não preenchido.`);
          return;
        }

        if (!allowedLevels.has(row.levelId)) {
          missing.push(`Selecione um nível válido em ${stage.label}.`);
        }

        if (!allowedResponsibilities.has(row.responsibilityId)) {
          missing.push(`Selecione uma responsabilidade válida em ${stage.label}.`);
        }

        if (!Array.isArray(row.selectedCriteria) || row.selectedCriteria.length === 0) {
          missing.push(`Selecione ao menos 1 critério de avanço em ${stage.label}.`);
        }
      });

      return {
        valid: missing.length === 0,
        missing
      };
    },

    buildPhaseFiveReport(config, plan) {
      const stageMap = new Map(config.stages.map((stage) => [stage.id, stage]));
      const levelsDistribution = (plan.stagePlan || []).reduce((acc, entry) => {
        acc[entry.levelId] = (acc[entry.levelId] || 0) + 1;
        return acc;
      }, {});
      const highRiskStages = (plan.stagePlan || [])
        .filter((entry) => entry.levelId === "org" && entry.responsibilityId === "ia")
        .map((entry) => stageMap.get(entry.stageId)?.label || entry.stageId);

      const checklist = [
        "Validar donos por estágio e ritual semanal de acompanhamento.",
        "Garantir quality gates ativos antes de elevar estágio para team/org.",
        "Revisar anti-padrões críticos a cada retro de adoção."
      ];

      return {
        generatedAt: new Date().toISOString(),
        templateId: plan.templateId,
        templateReason: plan.templateReason,
        levelsDistribution,
        warnings: plan.warnings || [],
        highRiskStages,
        checklist,
        stages: (plan.stagePlan || []).map((entry) => {
          const stage = stageMap.get(entry.stageId) || null;
          const selectedCriteriaLabels = (entry.selectedCriteria || [])
            .map((index) => stage?.advancementCriteria?.[index])
            .filter(Boolean);
          const selectedAntiPatternLabels = (entry.selectedAntiPatterns || [])
            .map((index) => stage?.antiPatterns?.[index])
            .filter(Boolean);

          return {
            stageId: entry.stageId,
            stageLabel: stage?.label || entry.stageId,
            levelId: entry.levelId,
            responsibilityId: entry.responsibilityId,
            selectedAntiPatterns: entry.selectedAntiPatterns || [],
            selectedCriteria: entry.selectedCriteria || [],
            selectedAntiPatternLabels,
            selectedCriteriaLabels
          };
        })
      };
    }
  };

  const phaseSixService = {
    async loadConfig() {
      if (phaseSixConfigCache) {
        return phaseSixConfigCache;
      }

      const response = await fetch(PHASE_SIX_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load phase six config: ${PHASE_SIX_CONFIG_FILE}`);
      }

      const config = await response.json();
      if (!Array.isArray(config.questions) || !config.owners || !config.guardrails) {
        throw new Error("invalid phase six config");
      }

      phaseSixConfigCache = config;
      return phaseSixConfigCache;
    },

    calculateProfile(config, answers = {}) {
      const answered = config.questions.filter((question) => {
        const value = answers[question.id];
        return typeof value === "string" && value.length > 0;
      });

      const totalScore = answered.reduce((acc, question) => {
        const selected = question.options.find((option) => option.id === answers[question.id]);
        return acc + (selected ? Number(selected.score) : 0);
      }, 0);

      const average = answered.length ? totalScore / answered.length : 0;
      const profileBand = average < 1.67 ? "conservative" : average < 2.34 ? "balanced" : "scalable";
      return {
        answeredCount: answered.length,
        total: config.questions.length,
        average,
        profileBand
      };
    },

    buildGovernancePack(config, answers = {}, profile) {
      const orgSize = answers.orgSize || "small";
      const hasAgentic = answers.hasAgentic || "no";
      const mcpServersCount = answers.mcpServersCount || "none";

      const teamModel = orgSize === "small"
        ? "Time AI Enablers Lean (0,5-1 pessoa part-time) + liderança técnica local."
        : orgSize === "medium"
          ? "Time AI Enablers Dedicado (2-3 pessoas) + campeões por domínio."
          : "Time central Distribuído (4-6 pessoas) + 1 campeão de IA por squad.";

      const mandatoryControls = [
        "Publicar as 9 políticas de uso de IA com owners e cadência de revisão.",
        "Aplicar os 7 padrões técnicos no SDLC com checklist obrigatório por PR.",
        "Definir trilha de exceções com justificativa, prazo de validade e revalidação semestral."
      ];

      if (hasAgentic !== "no") {
        mandatoryControls.push(
          "Ativar human-in-the-loop para ações irreversíveis (deploy prod, delete, comunicação externa)."
        );
      }

      if (mcpServersCount !== "none") {
        mandatoryControls.push("Aplicar os 6 controles mínimos de MCP Security antes de produção.");
      }

      const next30 = [
        "Nomear owners por política e publicar versão v1 no repositório interno.",
        "Criar checklist de revisão humana obrigatória para código com IA.",
        "Ativar tagging de custo por squad/serviço e alertas de budget."
      ];
      const next60 = [
        "Validar guardrails críticos em 100% das ferramentas aprovadas.",
        "Instituir revisão quinzenal de exceções e incidentes relacionados a IA.",
        "Padronizar prompts críticos versionados no fluxo de engenharia."
      ];
      const next90 = [
        "Executar ciclo de revisão semestral simulado das políticas.",
        "Publicar dashboard de governança (custos, uso, incidentes, compliance).",
        "Fechar retro da fase com ajustes de política, padrão e guardrails."
      ];

      return {
        teamModel,
        profileBand: profile.profileBand,
        owners: config.owners.core,
        technicalStandards: config.technicalStandards,
        guardrails: config.guardrails,
        reviewProcess: config.reviewProcess || [],
        aiSecurityPosture: config.aiSecurityPosture || null,
        owaspLlmTop10: config.owaspLlmTop10 || [],
        mcpSecurity: config.mcpSecurity || null,
        gatewayGuidance: config.gatewayGuidance || null,
        skillsMarketplace: config.skillsMarketplace || null,
        mandatoryControls,
        roadmap: {
          d30: next30,
          d60: next60,
          d90: next90
        }
      };
    }
  };

  const phaseSevenService = {
    async loadConfig() {
      if (phaseSevenConfigCache) {
        return phaseSevenConfigCache;
      }

      const response = await fetch(PHASE_SEVEN_CONFIG_FILE);
      if (!response.ok) {
        throw new Error(`failed to load phase seven config: ${PHASE_SEVEN_CONFIG_FILE}`);
      }

      const config = await response.json();
      if (!Array.isArray(config.questions) || !config.rolloutByEngineeringSize || !Array.isArray(config.metrics)) {
        throw new Error("invalid phase seven config");
      }

      phaseSevenConfigCache = config;
      return phaseSevenConfigCache;
    },

    calculateResult(config, answers = {}) {
      const answeredEntries = config.questions
        .map((question) => {
          const optionId = answers[question.id];
          const option = question.options.find((item) => item.id === optionId);
          if (!option) {
            return null;
          }
          return {
            questionId: question.id,
            questionLabel: question.label,
            optionId: option.id,
            optionLabel: option.label,
            score: Number(option.score)
          };
        })
        .filter(Boolean);

      const answeredCount = answeredEntries.length;
      const total = config.questions.length;
      const average = answeredCount
        ? answeredEntries.reduce((acc, item) => acc + item.score, 0) / answeredCount
        : 0;
      const overallBand = this.resolveBand(config.scoreBands, average);
      const completion = total ? Math.round((answeredCount / total) * 100) : 0;

      return {
        answeredCount,
        total,
        completion,
        average,
        overallBand,
        scoredAnswers: answeredEntries
      };
    },

    resolveBand(scoreBands, score) {
      const matched = scoreBands.find((band) => score >= band.min && score < band.max);
      return matched || scoreBands[scoreBands.length - 1];
    },

    buildScalePlan(config, answers = {}, result = {}) {
      const engineeringSize = answers.engineeringSize;
      const rollout = config.rolloutByEngineeringSize[engineeringSize] || null;
      if (!rollout) {
        return null;
      }

      const doraTrend = answers.doraTrend || "stable";
      const governanceStatus = answers.governancePhaseSixStatus || "draft";
      const adoptionStatus = answers.currentWeeklyAdoption || "below-25";

      const recommendedRisks = config.risks
        .filter((risk) => {
          if (risk.id === "RISK-S07") {
            return governanceStatus !== "active-review";
          }
          if (risk.id === "RISK-S02") {
            return adoptionStatus === "50-79" || adoptionStatus === "80-plus";
          }
          return true;
        });

      const executionNotes = [];
      if (doraTrend !== "improving") {
        executionNotes.push("Manter uma onda de estabilização antes de acelerar expansão para squads adicionais.");
      }
      if (governanceStatus !== "active-review") {
        executionNotes.push("Completar governança ativa da Fase 6 antes da última onda de escala.");
      }
      if (answers.championsPerSquad !== "full") {
        executionNotes.push("Estruturar pelo menos 1 campeão de IA por squad para reduzir gargalos operacionais.");
      }
      if (!executionNotes.length) {
        executionNotes.push("Operar ondas com gates de sucesso claros e revisão quinzenal de métricas críticas.");
      }

      return {
        generatedAt: new Date().toISOString(),
        readinessBand: result.overallBand?.label || "N/A",
        rollout,
        prioritizedMetrics: config.metrics,
        ceremonies: config.ceremonies,
        prioritizedRisks: recommendedRisks,
        completionCriteria: config.completionCriteria,
        executionNotes
      };
    }
  };

  const exportService = {
    getSerializableState(state) {
      return {
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        phaseAnswers: state.phaseAnswers,
        phaseSelections: state.phaseSelections,
        phaseResults: state.phaseResults,
        phaseReports: state.phaseReports,
        phaseAcknowledged: state.phaseAcknowledged
      };
    },

    filterStepMap(stepMap, allowedStepIds) {
      return Object.fromEntries(
        Object.entries(stepMap || {}).filter(([stepId]) => allowedStepIds.has(stepId))
      );
    },

    buildScopedState(state, maxStepIndex) {
      const allowedSteps = WIZARD_STEPS.slice(0, maxStepIndex + 1);
      const allowedStepIds = new Set(allowedSteps.map((step) => step.id));

      return {
        currentStep: Math.min(state.currentStep, maxStepIndex),
        completedSteps: Array.from(state.completedSteps).filter((index) => index <= maxStepIndex),
        phaseAnswers: this.filterStepMap(state.phaseAnswers, allowedStepIds),
        phaseSelections: this.filterStepMap(state.phaseSelections, allowedStepIds),
        phaseResults: this.filterStepMap(state.phaseResults, allowedStepIds),
        phaseReports: this.filterStepMap(state.phaseReports, allowedStepIds),
        phaseAcknowledged: this.filterStepMap(state.phaseAcknowledged, allowedStepIds)
      };
    },

    getAnswerMap(config, answers = {}) {
      const questionDefinitions = Array.isArray(config?.questions)
        ? config.questions
        : Array.isArray(config?.baselineQuestions)
          ? config.baselineQuestions
          : Array.isArray(config?.competencies)
            ? config.competencies
            : Array.isArray(config?.dimensions)
              ? config.dimensions
              : [];

      if (!questionDefinitions.length) {
        return [];
      }

      return questionDefinitions.map((question) => {
        const value = answers[question.id];
        const options = Array.isArray(question.options) ? question.options : [];
        const selected = options.find((option) => option.id === value);

        return {
          questionId: question.id,
          question: question.label || question.title || question.prompt || question.id,
          answerId: selected?.id || null,
          answerLabel: selected?.label || null,
          rawValue: typeof value === "undefined" ? null : value
        };
      });
    },

    async buildPayload(state, maxStepIndex = WIZARD_STEPS.length - 1) {
      const [
        phaseOneConfig,
        phaseTwoConfig,
        phaseThreeConfig,
        phaseFourConfig,
        phaseFiveConfig,
        phaseSixConfig,
        phaseSevenConfig
      ] = await Promise.all([
        diagnosisService.loadConfig(),
        phaseTwoService.loadConfig(),
        phaseThreeService.loadConfig(),
        phaseFourService.loadConfig(),
        phaseFiveService.loadConfig(),
        phaseSixService.loadConfig(),
        phaseSevenService.loadConfig()
      ]);

      const normalizedMaxStepIndex = Math.max(0, Math.min(WIZARD_STEPS.length - 1, maxStepIndex));
      const serializableState = this.buildScopedState(state, normalizedMaxStepIndex);
      const configByStepId = {
        "fase-1": phaseOneConfig,
        "fase-2": phaseTwoConfig,
        "fase-3": phaseThreeConfig,
        "fase-4": phaseFourConfig,
        "fase-5": phaseFiveConfig,
        "fase-6": phaseSixConfig,
        "fase-7": phaseSevenConfig
      };
      const allowedSteps = WIZARD_STEPS.slice(0, normalizedMaxStepIndex + 1);

      const phases = allowedSteps.map((step, index) => {
        const config = configByStepId[step.id];
        const answers = state.phaseAnswers[step.id] || {};
        const selections = state.phaseSelections[step.id] || {};
        const computed = state.phaseResults[step.id] || {};
        const report = state.phaseReports[step.id] || null;

        return {
          id: step.id,
          order: step.order,
          title: step.title,
          inputs: {
            answers,
            selections,
            questionAnswerMap: this.getAnswerMap(config, answers)
          },
          computed,
          report,
          status: {
            isCurrent: state.currentStep === index,
            isCompleted: state.completedSteps.has(index),
            acknowledged: Boolean(state.phaseAcknowledged[step.id]),
            pending: {
              missingAnswers: this.getAnswerMap(config, answers).filter((entry) => !entry.answerId).length
            }
          }
        };
      });

      return {
        meta: {
          schemaVersion: "1.1.0",
          exportedAt: new Date().toISOString(),
          storageKey: STORAGE_KEY,
          source: "ai-adoption-wizard",
          maxCompletedStep: normalizedMaxStepIndex,
          currentStepAtExport: state.currentStep,
          exportType: normalizedMaxStepIndex === WIZARD_STEPS.length - 1
            ? "full-snapshot"
            : "partial-phase-snapshot"
        },
        wizardState: serializableState,
        phases,
        sourceConfigs: Object.fromEntries(
          allowedSteps.map((step) => [step.id, configByStepId[step.id]])
        )
      };
    },

    download(payload, step) {
      const timestamp = new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/u, "Z");
      const stepLabel = step ? `-${step.id}` : "";
      const fileName = `ai-adoption-export${stepLabel}-${timestamp}.json`;
      const text = `${JSON.stringify(payload, null, 2)}\n`;
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return fileName;
    }
  };

  const dom = {
    welcomeScreen: document.querySelector("#welcomeScreen"),
    wizardShell: document.querySelector("#wizardShell"),
    welcomeMessage: document.querySelector("#welcomeMessage"),
    startFromZeroButton: document.querySelector("#startFromZeroButton"),
    welcomeLoadJsonButton: document.querySelector("#welcomeLoadJsonButton"),
    headerLoadJsonButton: document.querySelector("#headerLoadJsonButton"),
    loadJsonInput: document.querySelector("#loadJsonInput"),
    stepKicker: document.querySelector("#stepKicker"),
    stepTitle: document.querySelector("#stepTitle"),
    stepsNav: document.querySelector("#stepsNav"),
    summaryTitle: document.querySelector("#summaryTitle"),
    summaryContent: document.querySelector("#summaryContent"),
    summarySection: document.querySelector("#summarySection"),
    goalsTitle: document.querySelector("#goalsTitle"),
    goalsContent: document.querySelector("#goalsContent"),
    goalsSection: document.querySelector("#goalsSection"),
    questionsTitle: document.querySelector("#questionsTitle"),
    questionsContent: document.querySelector("#questionsContent"),
    questionsSection: document.querySelector("#questionsSection"),
    criteriaTitle: document.querySelector("#criteriaTitle"),
    criteriaContent: document.querySelector("#criteriaContent"),
    criteriaSection: document.querySelector("#criteriaSection"),
    diagnosisInteractive: document.querySelector("#diagnosisInteractive"),
    phaseAcknowledgment: document.querySelector("#phaseAcknowledgment"),
    pendingPanel: document.querySelector("#pendingPanel"),
    gateMessage: document.querySelector("#gateMessage"),
    backButton: document.querySelector("#backButton"),
    exportButton: document.querySelector("#exportButton"),
    nextButton: document.querySelector("#nextButton"),
    completeButton: document.querySelector("#completeButton"),
    progressValue: document.querySelector("#progressValue"),
    progressBarFill: document.querySelector("#progressBarFill"),
    progressRing: document.querySelector("#progressRing"),
    sidebarToggle: document.querySelector("#sidebarToggle"),
    sidebar: document.querySelector("#sidebar")
  };

  const wizardController = {
    state: createInitialWizardState(),
    isWelcomeVisible: true,

    async init() {
      this.renderNavigation();
      this.attachListeners();
      const restoredState = storageService.loadState();
      if (restoredState) {
        await this.startWizard(restoredState);
        return;
      }
      this.showWelcomeScreen();
    },

    attachListeners() {
      dom.startFromZeroButton.addEventListener("click", () => this.startFromZero());
      dom.welcomeLoadJsonButton?.addEventListener("click", () => this.openJsonPicker());
      dom.headerLoadJsonButton?.addEventListener("click", () => this.openJsonPicker());
      dom.loadJsonInput.addEventListener("change", (event) => this.handleJsonSelection(event));
      dom.backButton.addEventListener("click", () => this.goBack());
      dom.exportButton.addEventListener("click", () => this.exportCurrentStepJson());
      dom.nextButton.addEventListener("click", () => this.goNext());
      dom.completeButton.addEventListener("click", () => this.markCurrentStepCompleted());
      dom.sidebarToggle.addEventListener("click", () => {
        const expanded = dom.sidebarToggle.getAttribute("aria-expanded") === "true";
        dom.sidebarToggle.setAttribute("aria-expanded", String(!expanded));
        dom.stepsNav.classList.toggle("open", !expanded);
      });
    },

    showWelcomeMessage(message) {
      dom.welcomeMessage.textContent = message;
      dom.welcomeMessage.removeAttribute("hidden");
    },

    clearWelcomeMessage() {
      dom.welcomeMessage.textContent = "";
      dom.welcomeMessage.setAttribute("hidden", "hidden");
    },

    openJsonPicker() {
      this.clearWelcomeMessage();
      this.clearGateMessage();
      dom.loadJsonInput.click();
    },

    showContextMessage(message) {
      if (this.isWelcomeVisible) {
        this.showWelcomeMessage(message);
        return;
      }
      this.showGateMessage(message);
    },

    showWelcomeScreen() {
      this.isWelcomeVisible = true;
      dom.welcomeScreen.removeAttribute("hidden");
      dom.wizardShell.setAttribute("hidden", "hidden");
      this.clearWelcomeMessage();
    },

    async startWizard(stateOverride = null) {
      const restoredState = stateOverride || storageService.loadState();
      this.state = restoredState || createInitialWizardState();
      this.isWelcomeVisible = false;
      dom.welcomeScreen.setAttribute("hidden", "hidden");
      dom.wizardShell.removeAttribute("hidden");
      this.clearGateMessage();
      this.scrollToTop();
      await this.render();
    },

    async startFromZero() {
      storageService.clearProjectSessionData();
      this.state = createInitialWizardState();
      storageService.saveState(this.state);
      await this.startWizard(this.state);
    },

    validateImportedPayload(payload) {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return { valid: false, error: "JSON inválido: objeto raiz ausente." };
      }
      const wizardState = payload.wizardState;
      if (!wizardState || typeof wizardState !== "object" || Array.isArray(wizardState)) {
        return { valid: false, error: "JSON inválido: campo wizardState não encontrado." };
      }

      const normalized = storageService.normalizeStateCandidate(wizardState, { allowPartial: true });
      if (!normalized) {
        return { valid: false, error: "JSON inválido: estrutura de wizardState incompatível." };
      }
      return { valid: true, state: normalized };
    },

    mergeImportedState(baseState, importedState) {
      return {
        currentStep: baseState.currentStep,
        completedSteps: new Set([...baseState.completedSteps, ...importedState.completedSteps]),
        phaseAnswers: {
          ...baseState.phaseAnswers,
          ...importedState.phaseAnswers
        },
        phaseSelections: {
          ...baseState.phaseSelections,
          ...importedState.phaseSelections
        },
        phaseResults: {
          ...baseState.phaseResults,
          ...importedState.phaseResults
        },
        phaseReports: {
          ...baseState.phaseReports,
          ...importedState.phaseReports
        },
        phaseAcknowledged: {
          ...baseState.phaseAcknowledged,
          ...importedState.phaseAcknowledged
        }
      };
    },

    resolveResumeStep(state) {
      const pendingIndex = WIZARD_STEPS.findIndex((_, index) => !state.completedSteps.has(index));
      if (pendingIndex >= 0) {
        return pendingIndex;
      }
      return WIZARD_STEPS.length - 1;
    },

    async handleJsonSelection(event) {
      const [file] = event.target.files || [];
      event.target.value = "";
      if (!file) {
        return;
      }

      this.clearWelcomeMessage();
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const validation = this.validateImportedPayload(parsed);
        if (!validation.valid) {
          this.showContextMessage(validation.error);
          return;
        }

        const baseState = storageService.loadState() || this.state || createInitialWizardState();
        const mergedState = this.mergeImportedState(baseState, validation.state);
        mergedState.currentStep = this.resolveResumeStep(mergedState);
        storageService.saveState(mergedState);
        this.state = mergedState;
        await this.startWizard(mergedState);
        this.showGateMessage("Histórico importado com sucesso. Você pode continuar da próxima fase pendente.");
      } catch (error) {
        console.error("error importing json", error);
        this.showContextMessage("Não foi possível carregar o JSON. Verifique se o arquivo está válido.");
      }
    },

    getStepDependencies(index) {
      return STEP_DEPENDENCIES[index] || [];
    },

    getMissingDependencies(index, completedSteps = this.state.completedSteps) {
      const dependencies = this.getStepDependencies(index);
      return dependencies.filter((dependencyIndex) => !completedSteps.has(dependencyIndex));
    },

    formatPhaseList(indexes) {
      const labels = indexes.map((index) => `Fase ${WIZARD_STEPS[index].order}`);
      if (labels.length <= 1) {
        return labels[0] || "fase anterior";
      }
      if (labels.length === 2) {
        return `${labels[0]} e ${labels[1]}`;
      }
      return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
    },

    canAccessStep(index, completedSteps = this.state.completedSteps) {
      return this.getMissingDependencies(index, completedSteps).length === 0;
    },

    getProjectedCompletedSteps() {
      const projected = new Set(this.state.completedSteps);
      projected.add(this.state.currentStep);
      return projected;
    },

    isPhaseOneGateSatisfied() {
      const result = this.state.phaseResults["fase-1"];
      const answeredAll = result && result.answeredCount === result.total;
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-1"]);
      return Boolean(answeredAll && acknowledged);
    },

    async getPhaseOneMissingItems() {
      const config = await diagnosisService.loadConfig();
      const answers = this.state.phaseAnswers["fase-1"] || {};
      const missingQuestionNumbers = config.questions
        .map((question, index) => ({ question, number: index + 1 }))
        .filter(({ question }) => !answers[question.id])
        .map(({ number }) => number);

      return {
        missingQuestionNumbers,
        needsAcknowledgment: !Boolean(this.state.phaseAcknowledged["fase-1"])
      };
    },

    async buildPhaseOneGateMessage() {
      const pending = await this.getPhaseOneMissingItems();
      const parts = [];
      if (pending.missingQuestionNumbers.length) {
        parts.push(`Questões não respondidas: ${pending.missingQuestionNumbers.join(", ")}`);
      }
      if (pending.needsAcknowledgment) {
        parts.push("Marque a confirmação de entendimento do diagnóstico");
      }
      return parts.length ? `${parts.join(" | ")}.` : "Conclua a Fase 1 para avançar.";
    },

    isStepAcknowledged(stepId) {
      return Boolean(this.state.phaseAcknowledged[stepId]);
    },

    isCurrentStepCompletionReady() {
      const currentStep = WIZARD_STEPS[this.state.currentStep];
      if (currentStep.id === "fase-1") {
        return this.isPhaseOneGateSatisfied();
      }
      if (currentStep.id === "fase-2") {
        return this.isPhaseTwoGateSatisfied();
      }
      if (currentStep.id === "fase-3") {
        return this.isPhaseThreeGateSatisfied();
      }
      if (currentStep.id === "fase-4") {
        return this.isPhaseFourGateSatisfied();
      }
      if (currentStep.id === "fase-5") {
        return this.isPhaseFiveGateSatisfied();
      }
      if (currentStep.id === "fase-6") {
        return this.isPhaseSixGateSatisfied();
      }
      if (currentStep.id === "fase-7") {
        return this.isPhaseSevenGateSatisfied();
      }
      return this.isStepAcknowledged(currentStep.id);
    },

    async getCurrentStepGateMessage() {
      const currentStep = WIZARD_STEPS[this.state.currentStep];
      if (currentStep.id === "fase-1") {
        return this.buildPhaseOneGateMessage();
      }
      if (currentStep.id === "fase-2") {
        return this.buildPhaseTwoGateMessage();
      }
      if (currentStep.id === "fase-3") {
        return this.buildPhaseThreeGateMessage();
      }
      if (currentStep.id === "fase-4") {
        return this.buildPhaseFourGateMessage();
      }
      if (currentStep.id === "fase-5") {
        return this.buildPhaseFiveGateMessage();
      }
      if (currentStep.id === "fase-6") {
        return this.buildPhaseSixGateMessage();
      }
      if (currentStep.id === "fase-7") {
        return this.buildPhaseSevenGateMessage();
      }
      return `Confirme o entendimento da Fase ${currentStep.order} para continuar.`;
    },

    isPhaseTwoGateSatisfied() {
      const result = this.state.phaseResults["fase-2"];
      const selections = this.state.phaseSelections["fase-2"] || {};
      const hasArchetype = Boolean(selections.archetypeId);
      const hasProficiency = Boolean(selections.proficiencyLevelId);
      const answeredAll = result && result.answeredCount === result.total;
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-2"]);
      return Boolean(hasArchetype && hasProficiency && answeredAll && acknowledged);
    },

    async getPhaseTwoMissingItems() {
      const config = await phaseTwoService.loadConfig();
      const answers = this.state.phaseAnswers["fase-2"] || {};
      const selections = this.state.phaseSelections["fase-2"] || {};
      const missingCompetencies = config.competencies
        .filter((competency) => !answers[competency.id])
        .map((competency) => competency.title);

      return {
        needsArchetype: !selections.archetypeId,
        needsProficiency: !selections.proficiencyLevelId,
        missingCompetencies,
        needsAcknowledgment: !Boolean(this.state.phaseAcknowledged["fase-2"])
      };
    },

    async buildPhaseTwoGateMessage() {
      const pending = await this.getPhaseTwoMissingItems();
      const parts = [];
      if (pending.needsArchetype) {
        parts.push("Selecione o arquétipo do Time AI Enablers");
      }
      if (pending.needsProficiency) {
        parts.push("Selecione o nível de proficiência atual do time");
      }
      if (pending.missingCompetencies.length) {
        parts.push(`Competências pendentes: ${pending.missingCompetencies.join(", ")}`);
      }
      if (pending.needsAcknowledgment) {
        parts.push("Marque a confirmação de entendimento da Fase 2");
      }
      return parts.length ? `${parts.join(" | ")}.` : "Conclua a Fase 2 para avançar.";
    },

    isPhaseThreeGateSatisfied() {
      const result = this.state.phaseResults["fase-3"];
      const selection = this.state.phaseSelections["fase-3"] || {};
      const report = this.state.phaseReports["fase-3"];
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-3"]);

      return Boolean(
        result
        && result.answeredCount === result.total
        && selection.mode
        && report
        && acknowledged
      );
    },

    async getPhasePendingItems(stepKey, state = this.state) {
      if (stepKey === "fase-3") {
        const config = await phaseThreeService.loadConfig();
        return phaseThreeService.getPendingItems(config, {
          answers: state.phaseAnswers["fase-3"] || {},
          selection: state.phaseSelections["fase-3"] || {},
          acknowledged: Boolean(state.phaseAcknowledged["fase-3"])
        });
      }

      if (stepKey === "fase-4") {
        const config = await phaseFourService.loadConfig();
        const selections = state.phaseSelections["fase-4"] || {};
        return phaseFourService.getPendingItems(config, {
          backlogItems: Array.isArray(selections.backlogItems) ? selections.backlogItems : [],
          acknowledged: Boolean(state.phaseAcknowledged["fase-4"])
        });
      }

      return null;
    },

    async buildPhaseThreeGateMessage() {
      const pending = await this.getPhasePendingItems("fase-3");
      return pending && pending.length
        ? pending.map((item) => item.label).join(" | ")
        : "Conclua a Fase 3 para avançar.";
    },

    isPhaseFourGateSatisfied() {
      const result = this.state.phaseResults["fase-4"];
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-4"]);
      return Boolean(
        result
        && result.hasMinimumByTrack
        && result.invalidCount === 0
        && (result.duplicateCount || 0) === 0
        && result.roadmapItemCount > 0
        && acknowledged
      );
    },

    async buildPhaseFourGateMessage() {
      const pending = await this.getPhasePendingItems("fase-4");
      return pending && pending.length
        ? pending.map((item) => item.label).join(" | ")
        : "Conclua a Fase 4 para avançar.";
    },

    isPhaseFiveGateSatisfied() {
      const result = this.state.phaseResults["fase-5"];
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-5"]);
      return Boolean(result && result.valid && acknowledged);
    },

    async buildPhaseFiveGateMessage() {
      const result = this.state.phaseResults["fase-5"] || {};
      const parts = [];
      if (!result.validation || !result.validation.valid) {
        const pending = (result.validation?.missing || []).slice(0, 4);
        parts.push(...pending);
      }
      if (!Boolean(this.state.phaseAcknowledged["fase-5"])) {
        parts.push("Marque a confirmação de entendimento da Fase 5.");
      }
      return parts.length ? parts.join(" | ") : "Conclua a Fase 5 para avançar.";
    },

    isPhaseSixGateSatisfied() {
      const result = this.state.phaseResults["fase-6"];
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-6"]);
      return Boolean(result && result.answeredCount === result.total && result.hasPack && acknowledged);
    },

    async buildPhaseSixGateMessage() {
      const result = this.state.phaseResults["fase-6"] || {};
      const parts = [];
      if ((result.answeredCount || 0) < (result.total || 6)) {
        parts.push(`Responda todas as perguntas da Fase 6 (${result.answeredCount || 0}/${result.total || 6}).`);
      }
      if (!result.hasPack) {
        parts.push("Complete o preenchimento para gerar o pacote de governança.");
      }
      if (!Boolean(this.state.phaseAcknowledged["fase-6"])) {
        parts.push("Marque a confirmação de entendimento da Fase 6.");
      }
      return parts.length ? parts.join(" | ") : "Conclua a Fase 6 para avançar.";
    },

    isPhaseSevenGateSatisfied() {
      const result = this.state.phaseResults["fase-7"];
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-7"]);
      return Boolean(result && result.answeredCount === result.total && result.hasPlan && acknowledged);
    },

    async buildPhaseSevenGateMessage() {
      const result = this.state.phaseResults["fase-7"] || {};
      const parts = [];
      if ((result.answeredCount || 0) < (result.total || 6)) {
        parts.push(`Responda todas as perguntas da Fase 7 (${result.answeredCount || 0}/${result.total || 6}).`);
      }
      if (!result.hasPlan) {
        parts.push("Complete o preenchimento para gerar o plano de escala organizacional.");
      }
      if (!Boolean(this.state.phaseAcknowledged["fase-7"])) {
        parts.push("Marque a confirmação de entendimento da Fase 7.");
      }
      return parts.length ? parts.join(" | ") : "Conclua a Fase 7.";
    },

    showGateMessage(message) {
      dom.gateMessage.textContent = message;
      dom.gateMessage.removeAttribute("hidden");
    },

    clearGateMessage() {
      dom.gateMessage.textContent = "";
      dom.gateMessage.setAttribute("hidden", "hidden");
    },

    applySectionVisibility(stepId) {
      const hideQuestions = stepId === "fase-2" || stepId === "fase-3" || stepId === "fase-4" || stepId === "fase-5" || stepId === "fase-6" || stepId === "fase-7";
      const hideCriteria = stepId === "fase-2" || stepId === "fase-4" || stepId === "fase-5" || stepId === "fase-6";

      if (hideQuestions) {
        dom.questionsSection?.setAttribute("hidden", "hidden");
      } else {
        dom.questionsSection?.removeAttribute("hidden");
      }

      if (hideCriteria) {
        dom.criteriaSection?.setAttribute("hidden", "hidden");
      } else {
        dom.criteriaSection?.removeAttribute("hidden");
      }
    },

    scrollToTop() {
      if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    },

    async render() {
      const step = WIZARD_STEPS[this.state.currentStep];
      this.applySectionVisibility(step.id);
      dom.stepKicker.textContent = `Etapa ${step.order} de ${WIZARD_STEPS.length}`;
      dom.stepTitle.textContent = step.title;

      const stepText = await markdownService.loadStepMarkdown(step);
      const sections = markdownService.extractStepSections(stepText);
      const isPhaseOne = step.id === "fase-1";
      const isPhaseTwo = step.id === "fase-2";
      const isPhaseThree = step.id === "fase-3";
      const isPhaseFour = step.id === "fase-4";
      const isPhaseFive = step.id === "fase-5";
      const isPhaseSix = step.id === "fase-6";
      const isPhaseSeven = step.id === "fase-7";

      if (isPhaseOne) {
        dom.summaryTitle.textContent = "Objetivo da fase";
        dom.summaryContent.innerHTML = markdownService.parseMarkdown(sections.phaseGoal || sections.intro);

        dom.goalsTitle.textContent = "Metodologia de pontuação";
        dom.goalsContent.innerHTML = markdownService.parseMarkdown(sections.methodology || "Conteúdo indisponível.");

        dom.questionsTitle.textContent = "Os 3 macro-blocos";
        dom.questionsContent.innerHTML = markdownService.parseMarkdown(sections.macroBlocks || "Conteúdo indisponível.");

        dom.criteriaTitle.textContent = "Recomendações por dimensão e nível";
        dom.criteriaContent.innerHTML = markdownService.parseMarkdown(sections.recommendations || "Conteúdo indisponível.");

        await this.renderDiagnosisInteractive(sections.diagnosisQuestions || "Conteúdo indisponível.");
        this.renderPhaseAcknowledgment(step);
      } else {
        dom.summaryTitle.textContent = "Descrição resumida";
        dom.summaryContent.innerHTML = markdownService.parseMarkdown(sections.intro || "Conteúdo indisponível.");

        dom.goalsTitle.textContent = "Objetivos";
        dom.goalsContent.innerHTML = markdownService.parseMarkdown(sections.phaseGoal || sections.methodology || "Conteúdo indisponível.");

        dom.questionsTitle.textContent = "Perguntas e reflexões";
        dom.questionsContent.innerHTML = markdownService.parseMarkdown(
          sections.diagnosisQuestions || sections.macroBlocks || "Conteúdo indisponível."
        );

        dom.criteriaTitle.textContent = "Critérios de conclusão";
        dom.criteriaContent.innerHTML = markdownService.parseMarkdown(sections.recommendations || "Conteúdo indisponível.");

        if (isPhaseTwo) {
          await this.renderPhaseTwoInteractive();
        } else if (isPhaseThree) {
          await this.renderPhaseThreeInteractive();
        } else if (isPhaseFour) {
          await this.renderPhaseFourInteractive();
        } else if (isPhaseFive) {
          await this.renderPhaseFiveInteractive();
        } else if (isPhaseSix) {
          await this.renderPhaseSixInteractive();
        } else if (isPhaseSeven) {
          await this.renderPhaseSevenInteractive();
        } else {
          dom.diagnosisInteractive.innerHTML = "";
          dom.diagnosisInteractive.setAttribute("hidden", "hidden");
        }
        this.renderPhaseAcknowledgment(step);
      }

      await this.renderPendingPanel();
      this.updateProgress();
      this.updateButtons();
      this.updateNavigationState();
      storageService.saveState(this.state);
    },

    async renderPendingPanel() {
      const panel = dom.pendingPanel;
      if (!panel) {
        return;
      }

      const step = WIZARD_STEPS[this.state.currentStep];
      const pending = await this.getPhasePendingItems(step.id);

      if (pending === null) {
        panel.innerHTML = "";
        panel.classList.remove("pending-panel--done");
        panel.setAttribute("hidden", "hidden");
        return;
      }

      panel.removeAttribute("hidden");
      if (!pending.length) {
        panel.classList.add("pending-panel--done");
        panel.innerHTML = '<p class="pending-panel-title">Tudo certo! Você já pode marcar a etapa como concluída e avançar.</p>';
        return;
      }

      panel.classList.remove("pending-panel--done");
      panel.innerHTML = `
        <p class="pending-panel-title">Para concluir esta etapa (${pending.length} pendência${pending.length > 1 ? "s" : ""}):</p>
        <ul class="pending-panel-list">
          ${pending.map((item) => `<li>${this.escapeHtml(item.label)}</li>`).join("")}
        </ul>
      `;
    },

    renderPhaseAcknowledgment(step) {
      const acknowledged = this.isStepAcknowledged(step.id);
      const label = step.id === "fase-1"
        ? "Entendi o diagnóstico da organização neste momento."
        : `Entendi a avaliação da ${step.title} neste momento.`;
      dom.phaseAcknowledgment.removeAttribute("hidden");
      dom.phaseAcknowledgment.innerHTML = `
        <label class="ack-box">
          <input type="checkbox" id="stepAckCheckbox" ${acknowledged ? "checked" : ""}>
          <span>${label}</span>
        </label>
      `;

      const checkbox = dom.phaseAcknowledgment.querySelector("#stepAckCheckbox");
      if (!checkbox) {
        return;
      }

      checkbox.addEventListener("change", (event) => {
        this.state.phaseAcknowledged[step.id] = event.target.checked;
        this.clearGateMessage();
        this.render();
      });
    },

    async renderDiagnosisInteractive(questionsMarkdown) {
      const config = await diagnosisService.loadConfig();
      const stepKey = "fase-1";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const result = diagnosisService.calculateResult(config, answers);

      this.state.phaseResults[stepKey] = result;

      const isComplete = result.answeredCount === result.total;
      const bottleneck = isComplete ? diagnosisService.getBottleneck(config, result) : null;

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="diagnosis-hero">
          <p class="diagnosis-tag">Diagnóstico interativo</p>
          <h3>As 9 perguntas do diagnóstico</h3>
          <div class="content-block">${markdownService.parseMarkdown(questionsMarkdown)}</div>
        </div>

        <div class="diagnosis-layout${isComplete ? "" : " no-panel"}">
          <div class="diagnosis-questions">
            <p class="diagnosis-progress">Respondidas: <strong>${result.answeredCount}/${result.total}</strong></p>
            ${config.questions.map((question, index) => this.renderQuestionCard(question, answers[question.id], index + 1)).join("")}
          </div>

          ${isComplete ? `
            <aside class="diagnosis-panel">
              <h4>Resultado do diagnóstico</h4>
              <p class="score-value">${result.average.toFixed(2)}</p>
              <p class="score-level">Nível: <strong>${result.overallBand.label}</strong></p>
              <p class="score-description">${result.overallBand.interpretation}</p>

              <div class="score-blocks">
                ${config.blockMetadata.map((block) => {
                  const blockAverage = result.blockAverages.find((item) => item.blockId === block.id)?.average || 0;
                  const width = Math.max(0, Math.min(100, (blockAverage / 3) * 100));
                  return `
                    <div class="score-block-item">
                      <div class="score-block-head">
                        <span class="block-badge block-${block.id.toLowerCase()}">${block.id}</span>
                        <span>${block.title}</span>
                        <span>${blockAverage.toFixed(2)}</span>
                      </div>
                      <div class="mini-bar"><span style="width:${width}%"></span></div>
                    </div>
                  `;
                }).join("")}
              </div>

              <div class="score-bottleneck">
                <h5>Principal gargalo</h5>
                <p>${bottleneck ? `${bottleneck.label} (${bottleneck.optionLabel})` : "N/A"}</p>
              </div>
            </aside>
          ` : ""}
        </div>
      `;

      dom.diagnosisInteractive.querySelectorAll("input[type='radio']").forEach((input) => {
        input.addEventListener("change", (event) => {
          const { questionId, optionId } = event.target.dataset;
          const previous = this.state.phaseAnswers[stepKey] || {};
          this.state.phaseAnswers[stepKey] = {
            ...previous,
            [questionId]: optionId
          };
          this.clearGateMessage();
          this.render();
        });
      });
    },

    renderQuestionCard(question, selectedOptionId, position) {
      return `
        <article class="diagnosis-question-card">
          <div class="question-head">
            <p class="question-index">Questão ${position}</p>
            <span class="block-badge block-${question.block.toLowerCase()}">${question.block}</span>
          </div>
          <h4>${question.title}</h4>
          <p class="question-text">${question.prompt}</p>
          <p class="question-impact"><strong>Impacto:</strong> ${question.impact}</p>

          <div class="diagnosis-option-table-wrap">
            <table class="diagnosis-option-table">
              <thead>
                <tr>
                  ${question.options.map((option) => `
                    <th>
                      <span class="option-label">${option.label}</span>
                      <span class="option-score">${Number(option.score).toFixed(1).replace(".", ",")}</span>
                    </th>
                  `).join("")}
                </tr>
              </thead>
              <tbody>
                <tr>
                  ${question.options.map((option) => {
                    const checked = selectedOptionId === option.id;
                    return `
                      <td class="${checked ? "selected" : ""}">
                        <label class="option-cell ${checked ? "selected" : ""}">
                          <input
                            type="radio"
                            name="${question.id}"
                            value="${option.id}"
                            data-question-id="${question.id}"
                            data-option-id="${option.id}"
                            ${checked ? "checked" : ""}
                          >
                          <span class="option-desc">${option.description}</span>
                        </label>
                      </td>
                    `;
                  }).join("")}
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      `;
    },

    async renderPhaseTwoInteractive() {
      const config = await phaseTwoService.loadConfig();
      const stepKey = "fase-2";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const selections = this.state.phaseSelections[stepKey] || {};
      const result = phaseTwoService.calculateResult(config, answers, selections);
      const recommendations = phaseTwoService.buildRecommendations(config, result);
      this.state.phaseResults[stepKey] = {
        ...result,
        recommendations
      };

      const isComplete = result.answeredCount === result.total && selections.archetypeId && selections.proficiencyLevelId;

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="phase-two-shell">
          <div class="diagnosis-hero">
            <p class="diagnosis-tag">Time AI Enablers</p>
            <h3>Definição de perfil, capacidade e prontidão</h3>
            <p class="phase-two-intro">
              Selecione o arquétipo mais aderente ao tamanho da sua engenharia, avalie a familiaridade do time nas
              competências críticas e informe o nível atual de proficiência para gerar o direcionamento da Fase 3.
            </p>
          </div>

          <section class="phase-two-grid">
            ${config.archetypes.map((archetype) => {
              const selected = selections.archetypeId === archetype.id;
              return `
                <article class="phase-two-card${selected ? " selected" : ""}" data-archetype="${archetype.id}">
                  <div class="phase-two-card-head">
                    <h4>${archetype.label}</h4>
                  </div>
                  <p class="phase-two-subtitle">${archetype.sizing}</p>
                  <p class="phase-two-context">${archetype.context}</p>
                  <ul>
                    <li><strong>Técnico:</strong> ${archetype.responsibilities.technical[0]}</li>
                    <li><strong>Processo:</strong> ${archetype.responsibilities.process[0]}</li>
                    <li><strong>Cultura:</strong> ${archetype.responsibilities.culture[0]}</li>
                  </ul>
                  <p class="phase-two-plan"><strong>30/60/90:</strong> ${archetype.plan3090.d30}</p>
                  <button type="button" class="btn btn-ghost phase-two-select-btn" data-select-archetype="${archetype.id}">
                    ${selected ? "Arquétipo selecionado" : "Selecionar arquétipo"}
                  </button>
                </article>
              `;
            }).join("")}
          </section>

          <section class="phase-two-competencies">
            <h4>Diagnóstico de competências (4 áreas)</h4>
            ${config.competencies.map((competency, index) => `
              <article class="phase-two-competency-card">
                <p class="question-index">Competência ${index + 1}</p>
                <h5>${competency.title}</h5>
                <p class="phase-two-context">${competency.description}</p>
                <p class="question-text">${competency.question}</p>
                <div class="phase-two-options">
                  ${config.familiarityOptions.map((option) => {
                    const checked = answers[competency.id] === option.id;
                    return `
                      <label class="phase-two-option${checked ? " selected" : ""}">
                        <input
                          type="radio"
                          name="phase-two-${competency.id}"
                          value="${option.id}"
                          data-competency-id="${competency.id}"
                          data-option-id="${option.id}"
                          ${checked ? "checked" : ""}
                        >
                        <span><strong>${option.label}</strong> · ${option.description}</span>
                      </label>
                    `;
                  }).join("")}
                </div>
              </article>
            `).join("")}
          </section>

          <section class="phase-two-levels">
            <h4>Matriz de proficiência atual do time</h4>
            <div class="phase-two-level-grid">
              ${config.proficiencyLevels.map((level) => {
                const selected = selections.proficiencyLevelId === level.id;
                return `
                  <label class="phase-two-level-card${selected ? " selected" : ""}">
                    <input
                      type="radio"
                      name="phase-two-level"
                      value="${level.id}"
                      data-proficiency-level-id="${level.id}"
                      ${selected ? "checked" : ""}
                    >
                    <span class="phase-two-level-title">${level.label}</span>
                    <span>${level.characteristic}</span>
                    <span><strong>Critério:</strong> ${level.practical}</span>
                    <span><strong>Gate:</strong> ${level.gate}</span>
                  </label>
                `;
              }).join("")}
            </div>
          </section>

          <section class="phase-two-report${isComplete ? "" : " locked"}">
            <h4>Relatório pós-preenchimento</h4>
            ${isComplete ? `
              <p><strong>Arquétipo selecionado:</strong> ${result.archetype.label} (${result.archetype.sizing})</p>
              <p><strong>Proficiência atual:</strong> ${result.proficiency.label}</p>
              <p><strong>Média de competências:</strong> ${result.competencyAverage.toFixed(2)}</p>
              <p><strong>Score combinado:</strong> ${result.combinedScore.toFixed(2)}</p>
              <p><strong>Prontidão:</strong> ${result.overallBand.label} | <strong>Risco:</strong> ${result.overallBand.risk}</p>
              <p><strong>Leitura de consistência:</strong> ${result.archetypeReadiness ? "Perfil consistente com o arquétipo selecionado." : "Capacidade atual abaixo do esperado para o arquétipo selecionado."}</p>
              <p><strong>Próximo passo:</strong> ${result.overallBand.nextStep}</p>
              <p><strong>Direcionamento do arquétipo:</strong> ${recommendations.planHint || "N/A"}</p>
              <div class="phase-two-recommendations">
                <h5>Lacunas prioritárias</h5>
                ${
                  recommendations.competencyRecommendations.length
                    ? `<ul>${recommendations.competencyRecommendations.map((item) => `<li>${item}</li>`).join("")}</ul>`
                    : "<p>Nenhuma lacuna crítica identificada nas competências avaliadas.</p>"
                }
              </div>
            ` : `
              <p>Complete arquétipo, proficiência e as 4 competências para gerar o relatório da Fase 2.</p>
            `}
          </section>
        </div>
      `;

      dom.diagnosisInteractive.querySelectorAll("[data-select-archetype]").forEach((button) => {
        button.addEventListener("click", (event) => {
          const archetypeId = event.currentTarget.dataset.selectArchetype;
          const previous = this.state.phaseSelections[stepKey] || {};
          this.state.phaseSelections[stepKey] = {
            ...previous,
            archetypeId
          };
          this.clearGateMessage();
          this.render();
        });
      });

      dom.diagnosisInteractive.querySelectorAll("input[data-competency-id]").forEach((input) => {
        input.addEventListener("change", (event) => {
          const { competencyId, optionId } = event.target.dataset;
          const previous = this.state.phaseAnswers[stepKey] || {};
          this.state.phaseAnswers[stepKey] = {
            ...previous,
            [competencyId]: optionId
          };
          this.clearGateMessage();
          this.render();
        });
      });

      dom.diagnosisInteractive.querySelectorAll("input[data-proficiency-level-id]").forEach((input) => {
        input.addEventListener("change", (event) => {
          const proficiencyLevelId = event.target.dataset.proficiencyLevelId;
          const previous = this.state.phaseSelections[stepKey] || {};
          this.state.phaseSelections[stepKey] = {
            ...previous,
            proficiencyLevelId
          };
          this.clearGateMessage();
          this.render();
        });
      });
    },

    escapeHtml(value) {
      return markdownService.escapeHtml(String(value || ""));
    },

    buildPhaseThreeModeForm(config, modeId, selection, missingFields = []) {
      if (!modeId) {
        return "<p>Selecione um modo de avaliação para preencher os dados do candidato.</p>";
      }

      const labelClass = (field) => (missingFields.includes(field) ? ' class="field-missing"' : "");

      if (modeId === "squad") {
        return `
          <div class="phase-three-form-grid">
            <label${labelClass("teamName")}><span>Nome do squad</span><input type="text" data-phase-three-field="teamName" value="${this.escapeHtml(selection.teamName || "")}"></label>
            <label${labelClass("members")}><span>Membros (nomes e funções)</span><textarea data-phase-three-field="members">${this.escapeHtml(selection.members || "")}</textarea></label>
            <label${labelClass("operationalContext")}><span>Contexto operacional atual</span><textarea data-phase-three-field="operationalContext">${this.escapeHtml(selection.operationalContext || "")}</textarea></label>
            <label${labelClass("rationale")}><span>Racional da escolha</span><textarea data-phase-three-field="rationale">${this.escapeHtml(selection.rationale || "")}</textarea></label>
          </div>
        `;
      }

      if (modeId === "individuos") {
        return `
          <div class="phase-three-form-grid">
            <label${labelClass("leadName")}><span>Nome do responsável técnico</span><input type="text" data-phase-three-field="leadName" value="${this.escapeHtml(selection.leadName || "")}"></label>
            <label${labelClass("individuals")}><span>Lista de indivíduos (nome, função, senioridade)</span><textarea data-phase-three-field="individuals">${this.escapeHtml(selection.individuals || "")}</textarea></label>
            <label${labelClass("pilotScope")}><span>Escopo inicial do piloto</span><textarea data-phase-three-field="pilotScope">${this.escapeHtml(selection.pilotScope || "")}</textarea></label>
            <label${labelClass("rationale")}><span>Racional da escolha</span><textarea data-phase-three-field="rationale">${this.escapeHtml(selection.rationale || "")}</textarea></label>
          </div>
        `;
      }

      return `
        <div class="phase-three-form-grid">
          <label${labelClass("managerName")}><span>Nome da liderança responsável</span><input type="text" data-phase-three-field="managerName" value="${this.escapeHtml(selection.managerName || "")}"></label>
          <label${labelClass("governanceContext")}><span>Contexto de governança</span><textarea data-phase-three-field="governanceContext">${this.escapeHtml(selection.governanceContext || "")}</textarea></label>
          <label${labelClass("teamStructure")}><span>Estrutura do time piloto</span><textarea data-phase-three-field="teamStructure">${this.escapeHtml(selection.teamStructure || "")}</textarea></label>
          <label${labelClass("rationale")}><span>Racional da escolha</span><textarea data-phase-three-field="rationale">${this.escapeHtml(selection.rationale || "")}</textarea></label>
        </div>
      `;
    },

    renderPhaseThreeReport(result, report, recommendations) {
      if (!report) {
        return "<p>Preencha os campos mínimos e responda as 5 dimensões para gerar o resumo executivo da Fase 3.</p>";
      }

      return `
        <div class="phase-three-report-content">
          <p><strong>Candidato selecionado:</strong> ${this.escapeHtml(report.candidateName)}</p>
          <p><strong>Modo de avaliação:</strong> ${this.escapeHtml(report.modeLabel)}</p>
          <p><strong>Racional da escolha:</strong> ${this.escapeHtml(report.rationale)}</p>
          <p><strong>Score de prontidão:</strong> ${result.readinessScore.toFixed(2)} · <strong>Nível:</strong> ${this.escapeHtml(result.overallBand.label)}</p>
          <p><strong>Principal risco/gargalo:</strong> ${report.bottleneck ? this.escapeHtml(report.bottleneck.label) : "N/A"}</p>

          <div class="phase-three-list-box">
            <h5>Checklist de kickoff do piloto</h5>
            <ul>${recommendations.kickoffChecklist.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
          </div>

          <div class="phase-three-list-box">
            <h5>Ferramentas sugeridas por contexto</h5>
            <ul>
              ${recommendations.tools.map((tool) => `<li><strong>${this.escapeHtml(tool.name)}</strong> (${this.escapeHtml(tool.category)}): ${this.escapeHtml(tool.guidance)}</li>`).join("")}
            </ul>
          </div>

          <div class="phase-three-list-box">
            <h5>Métricas de sucesso (nível ${this.escapeHtml(result.overallBand.label)})</h5>
            <ul>${recommendations.metrics.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
          </div>

          <div class="phase-three-list-box">
            <h5>Critérios de expansão após o piloto</h5>
            <ul>${recommendations.expansionCriteria.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
      `;
    },

    ensurePhaseFourState(config) {
      const stepKey = "fase-4";
      const current = this.state.phaseSelections[stepKey] || {};
      if (Array.isArray(current.backlogItems) && current.backlogItems.length) {
        const hasMissingIds = current.backlogItems.some(
          (item) => !(item && typeof item.id === "string" && item.id)
        );
        if (hasMissingIds) {
          this.state.phaseSelections[stepKey] = {
            ...current,
            backlogItems: current.backlogItems.map((item, index) => ({
              ...(item && typeof item === "object" ? item : {}),
              id: item && typeof item.id === "string" && item.id ? item.id : `f4-restored-${index + 1}`
            }))
          };
        }
        return;
      }

      const upstreamData = {
        phaseOneBottleneckLabel: this.state.phaseResults["fase-1"]?.bottleneck?.label,
        phaseThreeBottleneckId: this.state.phaseResults["fase-3"]?.bottleneck?.dimensionId,
        phaseThreeLowDimensions: (this.state.phaseResults["fase-3"]?.scoredDimensions || [])
          .filter((item) => item.score === 1)
          .map((item) => item.dimensionId)
      };
      const initialBacklog = phaseFourService.buildInitialBacklog(config, upstreamData);
      this.state.phaseSelections[stepKey] = {
        ...current,
        backlogItems: initialBacklog
      };
    },

    buildPhaseFourItemError(issues, descricao = "") {
      if (!issues) {
        return "";
      }
      if (issues.emptyDescription) {
        return "Descreva o gargalo (campo obrigatório).";
      }
      if (issues.tooLong) {
        return `Descrição acima de 240 caracteres (atual: ${String(descricao).trim().length}).`;
      }
      if (issues.unknownTrack) {
        return "Selecione uma trilha válida.";
      }
      if (issues.invalidScores) {
        return "Defina impacto, esforço e risco entre 1 e 3.";
      }
      if (issues.duplicate) {
        return "Item duplicado nesta trilha — ajuste a descrição ou remova.";
      }
      return "";
    },

    renderPhaseFourItemRow(config, item, diagnostics = null) {
      const issues = diagnostics?.issuesById?.[item.id] || null;
      const hasProblem = Boolean(issues && (issues.hasIssues || issues.duplicate));
      const descricao = typeof item.descricao === "string" ? item.descricao : "";
      const errorMessage = this.buildPhaseFourItemError(issues, descricao);
      const unknownTrack = Boolean(issues?.unknownTrack);
      const trilhaOptions = [
        unknownTrack ? '<option value="" selected disabled>Selecione a trilha</option>' : "",
        ...config.trilhas.map((trilha) => {
          const selected = !unknownTrack && item.trilhaId === trilha.id ? "selected" : "";
          return `<option value="${this.escapeHtml(trilha.id)}" ${selected}>${this.escapeHtml(trilha.label)}</option>`;
        })
      ].join("");

      return `
        <article class="phase-four-item${hasProblem ? " phase-four-item--invalid" : ""}" data-phase-four-item-id="${this.escapeHtml(item.id)}">
          <div class="phase-four-item-head">
            <select data-phase-four-field="trilhaId" data-phase-four-item-id="${this.escapeHtml(item.id)}">
              ${trilhaOptions}
            </select>
            <button type="button" class="btn btn-ghost" data-phase-four-remove-id="${this.escapeHtml(item.id)}">
              Remover
            </button>
          </div>
          <textarea
            data-phase-four-field="descricao"
            data-phase-four-item-id="${this.escapeHtml(item.id)}"
            maxlength="240"
          >${this.escapeHtml(descricao)}</textarea>
          <div class="phase-four-item-meta">
            <p class="phase-four-item-error" data-item-error${errorMessage ? "" : " hidden"}>${this.escapeHtml(errorMessage)}</p>
            <span class="phase-four-char-counter${descricao.length >= 220 ? " is-limit" : ""}" data-item-char-counter>${descricao.length}/240</span>
          </div>
          <div class="phase-four-score-grid">
            ${["impacto", "esforco", "risco"].map((field) => `
              <label>
                <span>${field[0].toUpperCase()}${field.slice(1)} (1-3)</span>
                <select data-phase-four-field="${field}" data-phase-four-item-id="${this.escapeHtml(item.id)}">
                  ${[1, 2, 3].map((value) => `
                    <option value="${value}" ${Number(item[field]) === value ? "selected" : ""}>${value}</option>
                  `).join("")}
                </select>
              </label>
            `).join("")}
          </div>
        </article>
      `;
    },

    renderPhaseFourPrioritization(config, prioritizedItems = []) {
      if (!prioritizedItems.length) {
        return "<p>Adicione itens válidos para visualizar a priorização.</p>";
      }

      return `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gargalo</th>
                <th>Trilha</th>
                <th>Impacto</th>
                <th>Esforço</th>
                <th>Risco</th>
                <th>Score</th>
                <th>Classe</th>
              </tr>
            </thead>
            <tbody>
              ${prioritizedItems.map((item) => {
                const trilha = config.trilhas.find((entry) => entry.id === item.trilhaId);
                return `
                  <tr>
                    <td>${this.escapeHtml(item.descricao)}</td>
                    <td>${this.escapeHtml(trilha?.label || item.trilhaId)}</td>
                    <td>${item.impacto}</td>
                    <td>${item.esforco}</td>
                    <td>${item.risco}</td>
                    <td>${item.score}</td>
                    <td>${this.escapeHtml(item.priority.label)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    },

    renderPhaseFourRoadmap(config, roadmap) {
      return roadmap.milestones.map((milestone) => `
        <article class="phase-four-milestone">
          <h5>${this.escapeHtml(milestone.label)}</h5>
          <p><strong>Foco:</strong> ${this.escapeHtml(milestone.foco)}</p>
          <p><strong>Critério:</strong> ${this.escapeHtml(milestone.criterioConclusao)}</p>
          ${
            milestone.items.length
              ? `<ul>${milestone.items.map((item) => `
                <li>
                  <strong>${this.escapeHtml(item.descricao)}</strong>
                  (${this.escapeHtml(item.priority.label)} · Score ${item.score})
                </li>
              `).join("")}</ul>`
              : "<p>Sem itens alocados neste marco.</p>"
          }
        </article>
      `).join("");
    },

    computePhaseFourDerived(config) {
      const stepKey = "fase-4";
      const selections = this.state.phaseSelections[stepKey] || {};
      const rawItems = Array.isArray(selections.backlogItems) ? selections.backlogItems : [];
      const diagnostics = phaseFourService.getBacklogDiagnostics(config, rawItems);
      const invalidCount = diagnostics.invalidIds.length;
      const duplicateCount = diagnostics.duplicateIds.length;
      const prioritization = phaseFourService.calculatePrioritization(config, diagnostics.validItems);
      const roadmap = phaseFourService.buildRoadmap(config, prioritization.prioritizedItems);
      const hasMinimumByTrack = diagnostics.missingTracks.length === 0;

      this.state.phaseResults[stepKey] = {
        invalidCount,
        duplicateCount,
        sanitizedCount: diagnostics.validItems.length,
        hasMinimumByTrack,
        trackCount: diagnostics.trackCount,
        prioritizedItems: prioritization.prioritizedItems,
        roadmap,
        roadmapItemCount: roadmap.d30.length + roadmap.d90.length + roadmap.d180.length
      };

      this.state.phaseAnswers[stepKey] = {
        backlogItems: diagnostics.validItems
      };

      return { rawItems, diagnostics, invalidCount, duplicateCount, prioritization, roadmap };
    },

    buildPhaseFourHint(derived) {
      return `Itens válidos: ${derived.diagnostics.validItems.length} | Inválidos: ${derived.invalidCount} | Duplicados: ${derived.duplicateCount}`;
    },

    refreshPhaseFourItemMarkers(diagnostics) {
      const rows = dom.diagnosisInteractive?.querySelectorAll?.(".phase-four-item") || [];
      rows.forEach((row) => {
        const itemId = row.dataset?.phaseFourItemId;
        const issues = diagnostics.issuesById[itemId] || null;
        const hasProblem = Boolean(issues && (issues.hasIssues || issues.duplicate));
        row.classList.toggle("phase-four-item--invalid", hasProblem);

        const textarea = row.querySelector('[data-phase-four-field="descricao"]');
        const descricao = textarea ? textarea.value : "";

        const error = row.querySelector("[data-item-error]");
        if (error) {
          const message = this.buildPhaseFourItemError(issues, descricao);
          error.textContent = message;
          if (message) {
            error.removeAttribute("hidden");
          } else {
            error.setAttribute("hidden", "hidden");
          }
        }

        const counter = row.querySelector("[data-item-char-counter]");
        if (counter) {
          counter.textContent = `${descricao.length}/240`;
          counter.classList.toggle("is-limit", descricao.length >= 220);
        }
      });
    },

    refreshPhaseFourDerivedView(config) {
      const derived = this.computePhaseFourDerived(config);

      const hint = dom.diagnosisInteractive?.querySelector?.("[data-phase-four-hint]");
      if (hint) {
        hint.textContent = this.buildPhaseFourHint(derived);
      }

      const prioritizationBox = dom.diagnosisInteractive?.querySelector?.("[data-phase-four-prioritization]");
      if (prioritizationBox) {
        prioritizationBox.innerHTML = this.renderPhaseFourPrioritization(config, derived.prioritization.prioritizedItems);
      }

      const roadmapBox = dom.diagnosisInteractive?.querySelector?.("[data-phase-four-roadmap]");
      if (roadmapBox) {
        roadmapBox.innerHTML = this.renderPhaseFourRoadmap(config, derived.roadmap);
      }

      this.refreshPhaseFourItemMarkers(derived.diagnostics);
      this.renderPendingPanel().catch(() => {});
      this.updateButtons();
      storageService.saveState(this.state);
    },

    async renderPhaseFourInteractive() {
      const config = await phaseFourService.loadConfig();
      const stepKey = "fase-4";
      this.ensurePhaseFourState(config);
      const derived = this.computePhaseFourDerived(config);
      const { rawItems, diagnostics, prioritization, roadmap } = derived;

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="phase-four-shell">
          <div class="diagnosis-hero">
            <p class="diagnosis-tag">Remoção de Gargalos</p>
            <h3>Backlog priorizado e plano 30/90/180</h3>
            <p class="phase-two-intro">
              Consolide gargalos técnicos, organizacionais e culturais. Edite a lista, priorize por score e gere
              automaticamente o plano de remoção por marcos.
            </p>
          </div>

          <section class="phase-four-card">
            <h4>1) Contexto e fórmula</h4>
            <p><strong>Fórmula:</strong> ${this.escapeHtml(config.regrasPontuacao.formula)}</p>
            <p><strong>Legenda:</strong> Crítico (>=11) | Médio (7-10)</p>
          </section>

          <section class="phase-four-card">
            <div class="phase-four-head">
              <h4>2) Backlog editável por trilha</h4>
              <button type="button" class="btn btn-primary" data-phase-four-add>Adicionar gargalo</button>
            </div>
            <div class="phase-four-list">
              ${rawItems.map((item) => this.renderPhaseFourItemRow(config, item, diagnostics)).join("")}
            </div>
            <p class="phase-four-hint" data-phase-four-hint>${this.buildPhaseFourHint(derived)}</p>
          </section>

          <section class="phase-four-card">
            <h4>3) Priorização automática</h4>
            <div data-phase-four-prioritization>${this.renderPhaseFourPrioritization(config, prioritization.prioritizedItems)}</div>
          </section>

          <section class="phase-four-card">
            <h4>4) Plano 30/90/180</h4>
            <div class="phase-four-roadmap" data-phase-four-roadmap>
              ${this.renderPhaseFourRoadmap(config, roadmap)}
            </div>
          </section>
        </div>
      `;

      dom.diagnosisInteractive.querySelector("[data-phase-four-add]")?.addEventListener("click", () => {
        const currentSelections = this.state.phaseSelections[stepKey] || {};
        const currentItems = Array.isArray(currentSelections.backlogItems) ? currentSelections.backlogItems : [];
        const newItem = {
          id: `f4-${Date.now()}`,
          trilhaId: config.trilhas[0].id,
          descricao: "",
          impacto: 1,
          esforco: 1,
          risco: 1
        };
        this.state.phaseSelections[stepKey] = {
          ...currentSelections,
          backlogItems: [...currentItems, newItem]
        };
        this.clearGateMessage();
        this.render();
      });

      dom.diagnosisInteractive.querySelectorAll("[data-phase-four-field]").forEach((input) => {
        input.addEventListener("input", (event) => {
          const itemId = event.target.dataset.phaseFourItemId;
          const field = event.target.dataset.phaseFourField;
          const value = field === "descricao" || field === "trilhaId" ? event.target.value : Number(event.target.value);
          const currentSelections = this.state.phaseSelections[stepKey] || {};
          const currentItems = Array.isArray(currentSelections.backlogItems) ? currentSelections.backlogItems : [];
          const updatedItems = currentItems.map((item) => {
            if (item.id !== itemId) {
              return item;
            }
            return {
              ...item,
              [field]: value
            };
          });
          this.state.phaseSelections[stepKey] = {
            ...currentSelections,
            backlogItems: updatedItems
          };
          this.clearGateMessage();
          this.refreshPhaseFourDerivedView(config);
        });
      });

      dom.diagnosisInteractive.querySelectorAll("[data-phase-four-remove-id]").forEach((button) => {
        button.addEventListener("click", (event) => {
          const itemId = event.currentTarget.dataset.phaseFourRemoveId;
          const currentSelections = this.state.phaseSelections[stepKey] || {};
          const currentItems = Array.isArray(currentSelections.backlogItems) ? currentSelections.backlogItems : [];
          this.state.phaseSelections[stepKey] = {
            ...currentSelections,
            backlogItems: currentItems.filter((item) => item.id !== itemId)
          };
          this.clearGateMessage();
          this.render();
        });
      });
    },

    getPhaseFiveUpstream() {
      return {
        phaseOneBandId: this.state.phaseResults["fase-1"]?.overallBand?.id,
        phaseTwoBandId: this.state.phaseResults["fase-2"]?.overallBand?.id,
        phaseThreeBandId: this.state.phaseResults["fase-3"]?.overallBand?.id,
        phaseThreeBottleneckId: this.state.phaseResults["fase-3"]?.bottleneck?.dimensionId
      };
    },

    ensurePhaseFiveState(config) {
      const stepKey = "fase-5";
      const current = this.state.phaseSelections[stepKey] || {};
      if (Array.isArray(current.stagePlan) && current.stagePlan.length === config.stages.length && current.templateId) {
        return;
      }

      const upstream = this.getPhaseFiveUpstream();
      const base = phaseFiveService.buildInitialPlan(config, upstream);
      const calibrated = phaseFiveService.applyCalibrations(config, base, base.signals);
      this.state.phaseSelections[stepKey] = calibrated;
    },

    renderPhaseFiveStageRow(config, row) {
      const stage = config.stages.find((item) => item.id === row.stageId);
      const levelOptions = config.levels.map((level) => `
        <option value="${this.escapeHtml(level.id)}" ${row.levelId === level.id ? "selected" : ""}>
          ${this.escapeHtml(level.label)}
        </option>
      `).join("");
      const responsibilityOptions = config.responsibilityOptions.map((item) => `
        <option value="${this.escapeHtml(item.id)}" ${row.responsibilityId === item.id ? "selected" : ""}>
          ${this.escapeHtml(item.label)}
        </option>
      `).join("");

      return `
        <article class="phase-five-stage-card">
          <h5>${this.escapeHtml(stage?.label || row.stageId)}</h5>
          <div class="phase-five-stage-grid">
            <label>
              <span>Nível</span>
              <select data-phase-five-field="levelId" data-phase-five-stage-id="${this.escapeHtml(row.stageId)}">
                ${levelOptions}
              </select>
            </label>
            <label>
              <span>Responsabilidade</span>
              <select data-phase-five-field="responsibilityId" data-phase-five-stage-id="${this.escapeHtml(row.stageId)}">
                ${responsibilityOptions}
              </select>
            </label>
          </div>
          <div class="phase-five-checklist">
            <p><strong>Anti-padrões relevantes</strong></p>
            ${stage.antiPatterns.map((item, index) => {
              const key = `${row.stageId}-anti-${index}`;
              const checked = row.selectedAntiPatterns.includes(index);
              return `
                <label>
                  <input type="checkbox" data-phase-five-check="anti" data-phase-five-stage-id="${this.escapeHtml(row.stageId)}" data-phase-five-index="${index}" ${checked ? "checked" : ""}>
                  <span>${this.escapeHtml(item)}</span>
                </label>
              `;
            }).join("")}
          </div>
          <div class="phase-five-checklist">
            <p><strong>Critérios de avanço (mínimo 1)</strong></p>
            ${stage.advancementCriteria.map((item, index) => {
              const checked = row.selectedCriteria.includes(index);
              return `
                <label>
                  <input type="checkbox" data-phase-five-check="criteria" data-phase-five-stage-id="${this.escapeHtml(row.stageId)}" data-phase-five-index="${index}" ${checked ? "checked" : ""}>
                  <span>${this.escapeHtml(item)}</span>
                </label>
              `;
            }).join("")}
          </div>
        </article>
      `;
    },

    async renderPhaseFiveInteractive() {
      const config = await phaseFiveService.loadConfig();
      const stepKey = "fase-5";
      this.ensurePhaseFiveState(config);
      const selection = this.state.phaseSelections[stepKey] || {};
      const signals = selection.signals || {};
      const validation = phaseFiveService.validatePlan(config, selection);
      const report = phaseFiveService.buildPhaseFiveReport(config, selection);
      const completeStages = report.stages.filter((item) => item.selectedCriteria.length > 0).length;

      this.state.phaseResults[stepKey] = {
        valid: validation.valid,
        validation,
        summary: {
          templateId: selection.templateId,
          completeStages
        }
      };
      this.state.phaseReports[stepKey] = report;

      const template = config.templates.find((item) => item.id === selection.templateId);

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="phase-five-shell">
          <div class="diagnosis-hero">
            <p class="diagnosis-tag">Adoção Progressiva</p>
            <h3>Playbook dos 6 estágios do SDLC</h3>
            <p class="phase-two-intro">
              Defina template, calibragem e plano por estágio para conduzir a adoção de IA de forma progressiva,
              com critérios claros de avanço.
            </p>
            <p class="phase-five-status">
              Estágios com critérios definidos: <strong>${completeStages}/${config.stages.length}</strong>
            </p>
          </div>

          <section class="phase-five-card">
            <h4>1) Baseline da fase</h4>
            <div class="phase-five-baseline-grid">
              ${config.baselineQuestions.map((question) => `
                <label>
                  <span>${this.escapeHtml(question.label)}</span>
                  <select data-phase-five-signal-id="${this.escapeHtml(question.id)}">
                    ${question.options.map((option) => `
                      <option value="${this.escapeHtml(option.id)}" ${signals[question.id] === option.id ? "selected" : ""}>
                        ${this.escapeHtml(option.label)}
                      </option>
                    `).join("")}
                  </select>
                </label>
              `).join("")}
            </div>
          </section>

          <section class="phase-five-card">
            <h4>2) Template de adoção recomendado</h4>
            <p><strong>Template ativo:</strong> ${this.escapeHtml(template?.label || "N/A")}</p>
            <p><strong>Motivo:</strong> ${this.escapeHtml(selection.templateReason || "N/A")}</p>
            <div class="phase-five-template-grid">
              ${config.templates.map((item) => `
                <button type="button" class="phase-three-mode-btn${selection.templateId === item.id ? " selected" : ""}" data-phase-five-template-id="${this.escapeHtml(item.id)}">
                  <strong>${this.escapeHtml(item.label)}</strong>
                  <span>${this.escapeHtml(item.description)}</span>
                </button>
              `).join("")}
            </div>
          </section>

          <section class="phase-five-card">
            <h4>3) Matriz de adoção por estágio</h4>
            <div class="phase-five-stage-list">
              ${selection.stagePlan.map((row) => this.renderPhaseFiveStageRow(config, row)).join("")}
            </div>
          </section>

          <aside class="phase-five-card">
            <h4>4) Síntese executiva</h4>
            <p><strong>Distribuição:</strong> ${config.levels.map((level) => `${this.escapeHtml(level.label)} (${report.levelsDistribution[level.id] || 0})`).join(" · ")}</p>
            <p><strong>Riscos detectados:</strong> ${report.highRiskStages.length ? this.escapeHtml(report.highRiskStages.join(", ")) : "Nenhum risco alto por automação total."}</p>
            <div class="phase-five-checklist">
              <p><strong>Checklist final</strong></p>
              <ul>${report.checklist.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
            </div>
            <div class="phase-five-checklist">
              <p><strong>Calibrações aplicadas</strong></p>
              ${
                report.warnings.length
                  ? `<ul>${report.warnings.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>`
                  : "<p>Sem restrições adicionais aplicadas automaticamente.</p>"
              }
            </div>
          </aside>
        </div>
      `;

      dom.diagnosisInteractive.querySelectorAll("[data-phase-five-signal-id]").forEach((input) => {
        input.addEventListener("change", async (event) => {
          const signalId = event.target.dataset.phaseFiveSignalId;
          const current = this.state.phaseSelections[stepKey] || {};
          const nextSignals = {
            ...(current.signals || {}),
            [signalId]: event.target.value
          };
          const resolved = phaseFiveService.resolveTemplate(config, nextSignals, {});
          const template = config.templates.find((item) => item.id === resolved.templateId) || config.templates[1];
          const recomputed = {
            ...current,
            signals: nextSignals,
            templateId: template.id,
            templateReason: resolved.reason,
            stagePlan: config.stages.map((stage) => {
              const existing = (current.stagePlan || []).find((row) => row.stageId === stage.id);
              return {
                stageId: stage.id,
                levelId: template.defaultLevels[stage.id] || existing?.levelId || "none",
                responsibilityId: existing?.responsibilityId || "shared",
                selectedAntiPatterns: existing?.selectedAntiPatterns || [],
                selectedCriteria: existing?.selectedCriteria || []
              };
            })
          };
          this.state.phaseSelections[stepKey] = phaseFiveService.applyCalibrations(config, recomputed, nextSignals);
          this.clearGateMessage();
          await this.render();
        });
      });

      dom.diagnosisInteractive.querySelectorAll("[data-phase-five-template-id]").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const templateId = event.currentTarget.dataset.phaseFiveTemplateId;
          const current = this.state.phaseSelections[stepKey] || {};
          const templateMeta = config.templates.find((item) => item.id === templateId);
          const recomputed = {
            ...current,
            templateId,
            templateReason: "Template ajustado manualmente pelo usuário.",
            stagePlan: config.stages.map((stage) => {
              const existing = (current.stagePlan || []).find((row) => row.stageId === stage.id);
              return {
                stageId: stage.id,
                levelId: existing?.levelId || templateMeta?.defaultLevels[stage.id] || "none",
                responsibilityId: existing?.responsibilityId || "shared",
                selectedAntiPatterns: existing?.selectedAntiPatterns || [],
                selectedCriteria: existing?.selectedCriteria || []
              };
            })
          };
          this.state.phaseSelections[stepKey] = phaseFiveService.applyCalibrations(
            config,
            recomputed,
            current.signals || {}
          );
          this.clearGateMessage();
          await this.render();
        });
      });

      dom.diagnosisInteractive.querySelectorAll("[data-phase-five-field]").forEach((input) => {
        input.addEventListener("change", async (event) => {
          const stageId = event.target.dataset.phaseFiveStageId;
          const field = event.target.dataset.phaseFiveField;
          const current = this.state.phaseSelections[stepKey] || {};
          const stagePlan = (current.stagePlan || []).map((row) => (
            row.stageId === stageId ? { ...row, [field]: event.target.value } : row
          ));
          this.state.phaseSelections[stepKey] = {
            ...current,
            stagePlan
          };
          this.clearGateMessage();
          await this.render();
        });
      });

      dom.diagnosisInteractive.querySelectorAll("[data-phase-five-check]").forEach((input) => {
        input.addEventListener("change", async (event) => {
          const stageId = event.target.dataset.phaseFiveStageId;
          const checkType = event.target.dataset.phaseFiveCheck;
          const index = Number(event.target.dataset.phaseFiveIndex);
          const checked = event.target.checked;
          const current = this.state.phaseSelections[stepKey] || {};
          const stagePlan = (current.stagePlan || []).map((row) => {
            if (row.stageId !== stageId) {
              return row;
            }

            if (checkType === "anti") {
              const set = new Set(row.selectedAntiPatterns || []);
              if (checked) {
                set.add(index);
              } else {
                set.delete(index);
              }
              return {
                ...row,
                selectedAntiPatterns: Array.from(set).sort((a, b) => a - b)
              };
            }

            const set = new Set(row.selectedCriteria || []);
            if (checked) {
              set.add(index);
            } else {
              set.delete(index);
            }
            return {
              ...row,
              selectedCriteria: Array.from(set).sort((a, b) => a - b)
            };
          });
          this.state.phaseSelections[stepKey] = {
            ...current,
            stagePlan
          };
          this.clearGateMessage();
          await this.render();
        });
      });
    },

    renderPhaseSixQuestion(question, value, index) {
      return `
        <article class="phase-three-question">
          <div class="question-head">
            <p class="question-index">Pergunta ${index + 1}</p>
          </div>
          <h5>${this.escapeHtml(question.label)}</h5>
          <div class="phase-three-options">
            ${question.options.map((option) => `
              <label class="phase-three-option${value === option.id ? " selected" : ""}">
                <input
                  type="radio"
                  name="phase-six-${this.escapeHtml(question.id)}"
                  data-phase-six-question-id="${this.escapeHtml(question.id)}"
                  data-option-id="${this.escapeHtml(option.id)}"
                  ${value === option.id ? "checked" : ""}
                >
                <span>${this.escapeHtml(option.label)}</span>
              </label>
            `).join("")}
          </div>
        </article>
      `;
    },

    async renderPhaseSixInteractive() {
      const config = await phaseSixService.loadConfig();
      const stepKey = "fase-6";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const profile = phaseSixService.calculateProfile(config, answers);
      const hasAllAnswers = profile.answeredCount === profile.total;
      const governancePack = hasAllAnswers ? phaseSixService.buildGovernancePack(config, answers, profile) : null;

      this.state.phaseResults[stepKey] = {
        ...profile,
        hasPack: Boolean(governancePack)
      };
      this.state.phaseReports[stepKey] = governancePack;

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="phase-six-shell">
          <div class="diagnosis-hero">
            <p class="diagnosis-tag">Governança e Padronização</p>
            <h3>Quem conduz, quais regras valem e como operar sem travar o time</h3>
            <p class="phase-two-intro">
              Preencha o contexto da sua organização para gerar um pacote de governança com time responsável,
              políticas, padrões técnicos, guardrails e roadmap de implantação.
            </p>
            <p class="phase-five-status">
              Perguntas respondidas: <strong>${profile.answeredCount}/${profile.total}</strong>
            </p>
          </div>

          <section class="phase-five-card">
            <h4>1) Contexto da organização</h4>
            <div class="phase-three-questions">
              ${config.questions.map((question, index) => this.renderPhaseSixQuestion(question, answers[question.id], index)).join("")}
            </div>
          </section>

          <section class="phase-five-card${governancePack ? "" : " locked"}">
            <h4>2) Pacote de governança gerado</h4>
            ${
              governancePack ? `
                <p><strong>Modelo recomendado de condução:</strong> ${this.escapeHtml(governancePack.teamModel)}</p>
                <p><strong>Perfil de governança:</strong> ${this.escapeHtml(governancePack.profileBand)}</p>

                <div class="phase-five-checklist">
                  <p><strong>Owners das políticas (fonte oficial da Fase 6)</strong></p>
                  <div class="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Política</th><th>Responsável</th><th>Revisão</th></tr>
                      </thead>
                      <tbody>
                        ${governancePack.owners.map((item) => `
                          <tr>
                            <td>${this.escapeHtml(item.policy)}</td>
                            <td>${this.escapeHtml(item.owner)}</td>
                            <td>${this.escapeHtml(item.review)}</td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Padrões técnicos obrigatórios</strong></p>
                  <ul>${governancePack.technicalStandards.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Guardrails por criticidade</strong></p>
                  <p><strong>Crítica:</strong> ${governancePack.guardrails.critical.map((item) => this.escapeHtml(item)).join(" · ")}</p>
                  <p><strong>Alta:</strong> ${governancePack.guardrails.high.map((item) => this.escapeHtml(item)).join(" · ")}</p>
                  <p><strong>Média:</strong> ${governancePack.guardrails.medium.map((item) => this.escapeHtml(item)).join(" · ")}</p>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Plano 30/60/90 dias</strong></p>
                  <p><strong>30d</strong></p>
                  <ul>${governancePack.roadmap.d30.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                  <p><strong>60d</strong></p>
                  <ul>${governancePack.roadmap.d60.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                  <p><strong>90d</strong></p>
                  <ul>${governancePack.roadmap.d90.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Controles mandatórios imediatos</strong></p>
                  <ul>${governancePack.mandatoryControls.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                </div>
              `
                : "<p>Responda as 6 perguntas de contexto para gerar o pacote completo desta fase.</p>"
            }
          </section>
        </div>
      `;

      dom.diagnosisInteractive.querySelectorAll("[data-phase-six-question-id]").forEach((input) => {
        input.addEventListener("change", async (event) => {
          const questionId = event.target.dataset.phaseSixQuestionId;
          const optionId = event.target.dataset.optionId;
          const previous = this.state.phaseAnswers[stepKey] || {};
          this.state.phaseAnswers[stepKey] = {
            ...previous,
            [questionId]: optionId
          };
          this.clearGateMessage();
          await this.render();
        });
      });
    },

    renderPhaseSevenQuestion(question, value, index) {
      return `
        <article class="phase-three-question">
          <div class="question-head">
            <p class="question-index">Pergunta ${index + 1}</p>
          </div>
          <h5>${this.escapeHtml(question.label)}</h5>
          <div class="phase-three-options">
            ${question.options.map((option) => `
              <label class="phase-three-option${value === option.id ? " selected" : ""}">
                <input
                  type="radio"
                  name="phase-seven-${this.escapeHtml(question.id)}"
                  data-phase-seven-question-id="${this.escapeHtml(question.id)}"
                  data-option-id="${this.escapeHtml(option.id)}"
                  ${value === option.id ? "checked" : ""}
                >
                <span>${this.escapeHtml(option.label)}</span>
              </label>
            `).join("")}
          </div>
        </article>
      `;
    },

    async exportCurrentStepJson() {
      if (!this.isCurrentStepCompletionReady()) {
        this.showGateMessage(await this.getCurrentStepGateMessage());
        return;
      }

      const step = WIZARD_STEPS[this.state.currentStep];
      const exportState = {
        ...this.state,
        completedSteps: new Set([...this.state.completedSteps, this.state.currentStep])
      };
      const payload = await exportService.buildPayload(exportState, this.state.currentStep);
      const fileName = exportService.download(payload, step);
      this.showGateMessage(`Snapshot da ${step.title} exportado com sucesso: ${fileName}`);
    },

    async renderPhaseSevenInteractive() {
      const config = await phaseSevenService.loadConfig();
      const stepKey = "fase-7";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const result = phaseSevenService.calculateResult(config, answers);
      const hasAllAnswers = result.answeredCount === result.total;
      const scalePlan = hasAllAnswers ? phaseSevenService.buildScalePlan(config, answers, result) : null;

      this.state.phaseResults[stepKey] = {
        ...result,
        hasPlan: Boolean(scalePlan)
      };
      this.state.phaseReports[stepKey] = scalePlan;

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="phase-six-shell">
          <div class="diagnosis-hero">
            <p class="diagnosis-tag">Escala Organizacional</p>
            <h3>Rollout em ondas com métricas, rituais e mitigação de riscos</h3>
            <p class="phase-two-intro">
              Preencha o contexto atual da organização para gerar um plano de escala orientado por governança,
              adoção por squad e impacto mensurável.
            </p>
            <p class="phase-five-status">
              Perguntas respondidas: <strong>${result.answeredCount}/${result.total}</strong>
            </p>
          </div>

          <section class="phase-five-card">
            <h4>1) Contexto de escala</h4>
            <div class="phase-three-questions">
              ${config.questions.map((question, index) => this.renderPhaseSevenQuestion(question, answers[question.id], index)).join("")}
            </div>
          </section>

          <section class="phase-five-card${scalePlan ? "" : " locked"}">
            <h4>2) Plano de escala gerado</h4>
            ${
    scalePlan
      ? `
                <p><strong>Nível atual de prontidão:</strong> ${this.escapeHtml(result.overallBand.label)}</p>
                <p>${this.escapeHtml(result.overallBand.interpretation)}</p>
                <p><strong>Ondas recomendadas:</strong> ${scalePlan.rollout.waves} · <strong>Duração:</strong> ${this.escapeHtml(scalePlan.rollout.waveDuration)}</p>
                <p><strong>Estratégia:</strong> ${this.escapeHtml(scalePlan.rollout.strategy)}</p>

                <div class="phase-five-checklist">
                  <p><strong>Métricas prioritárias</strong></p>
                  <ul>${scalePlan.prioritizedMetrics.map((item) => `<li><strong>${this.escapeHtml(item.code)}</strong> (${this.escapeHtml(item.layer)}): ${this.escapeHtml(item.name)} · Meta: ${this.escapeHtml(item.target)}</li>`).join("")}</ul>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Cerimônias recorrentes</strong></p>
                  <ul>${scalePlan.ceremonies.map((item) => `<li><strong>${this.escapeHtml(item.name)}</strong> (${this.escapeHtml(item.frequency)}): ${this.escapeHtml(item.objective)}</li>`).join("")}</ul>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Riscos priorizados</strong></p>
                  <ul>${scalePlan.prioritizedRisks.map((item) => `<li><strong>${this.escapeHtml(item.id)} · ${this.escapeHtml(item.name)}</strong>: ${this.escapeHtml(item.mitigation)}</li>`).join("")}</ul>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Critérios finais de conclusão</strong></p>
                  <ul>${scalePlan.completionCriteria.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                </div>

                <div class="phase-five-checklist">
                  <p><strong>Notas de execução</strong></p>
                  <ul>${scalePlan.executionNotes.map((item) => `<li>${this.escapeHtml(item)}</li>`).join("")}</ul>
                </div>
              `
      : "<p>Responda as 6 perguntas de contexto para gerar o plano completo desta fase.</p>"
  }
          </section>

          <section class="phase-five-card${scalePlan ? "" : " locked"}">
            <h4>3) Continuidade do histórico</h4>
            <p>
              Após confirmar o entendimento da fase, use o botão <strong>Exportar etapa</strong> no rodapé para
              gerar um snapshot com esta fase e todas as anteriores.
            </p>
          </section>
        </div>
      `;

      dom.diagnosisInteractive.querySelectorAll("[data-phase-seven-question-id]").forEach((input) => {
        input.addEventListener("change", async (event) => {
          const questionId = event.target.dataset.phaseSevenQuestionId;
          const optionId = event.target.dataset.optionId;
          const previous = this.state.phaseAnswers[stepKey] || {};
          this.state.phaseAnswers[stepKey] = {
            ...previous,
            [questionId]: optionId
          };
          this.clearGateMessage();
          await this.render();
        });
      });

    },

    computePhaseThreeDerived(config) {
      const stepKey = "fase-3";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const selection = this.state.phaseSelections[stepKey] || {};
      const result = phaseThreeService.calculateResult(config, answers);
      const recommendations = phaseThreeService.buildRecommendations(config, result);
      const validation = phaseThreeService.validateSelection(config, selection);
      const canBuildReport = validation.valid && result.answeredCount === result.total;
      const report = canBuildReport
        ? phaseThreeService.buildExecutiveReport(config, selection, result, recommendations)
        : null;

      this.state.phaseResults[stepKey] = {
        ...result,
        recommendations
      };
      this.state.phaseReports[stepKey] = report;

      return { result, recommendations, validation, report };
    },

    refreshPhaseThreeDerivedView(config) {
      const { result, recommendations, validation, report } = this.computePhaseThreeDerived(config);

      const card = dom.diagnosisInteractive?.querySelector?.("[data-phase-three-report-card]");
      if (card) {
        card.classList.toggle("locked", !report);
        const reportBox = card.querySelector("[data-phase-three-report]");
        if (reportBox) {
          reportBox.innerHTML = this.renderPhaseThreeReport(result, report, recommendations);
        }
      }

      const missingFields = validation.missingFields || [];
      const fields = dom.diagnosisInteractive?.querySelectorAll?.("[data-phase-three-field]") || [];
      fields.forEach((input) => {
        const label = typeof input.closest === "function" ? input.closest("label") : null;
        if (label) {
          label.classList.toggle("field-missing", missingFields.includes(input.dataset.phaseThreeField));
        }
      });

      this.renderPendingPanel().catch(() => {});
      this.updateButtons();
      storageService.saveState(this.state);
    },

    async renderPhaseThreeInteractive() {
      const config = await phaseThreeService.loadConfig();
      const stepKey = "fase-3";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const selection = this.state.phaseSelections[stepKey] || {};
      const { result, recommendations, validation, report } = this.computePhaseThreeDerived(config);

      dom.diagnosisInteractive.removeAttribute("hidden");
      dom.diagnosisInteractive.innerHTML = `
        <div class="phase-three-shell">
          <div class="diagnosis-hero">
            <p class="diagnosis-tag">Time Piloto</p>
            <h3>Definição de candidato e prontidão operacional</h3>
            <p class="phase-two-intro">
              Defina quem conduzirá a iniciativa, avalie prontidão nas 5 dimensões críticas e gere um
              direcionamento completo de kickoff, métricas e expansão.
            </p>
          </div>

          <section class="phase-three-card">
            <h4>1) Modo de avaliação do candidato</h4>
            <div class="phase-three-mode-grid">
              ${config.inputModes.map((mode) => {
                const selected = selection.mode === mode.id;
                return `
                  <button type="button" class="phase-three-mode-btn${selected ? " selected" : ""}" data-phase-three-mode="${mode.id}">
                    <strong>${this.escapeHtml(mode.label)}</strong>
                    <span>${this.escapeHtml(mode.description)}</span>
                  </button>
                `;
              }).join("")}
            </div>
            <div class="phase-three-form">
              ${this.buildPhaseThreeModeForm(config, selection.mode, selection, validation.missingFields || [])}
            </div>
          </section>

          <section class="phase-three-card">
            <h4>2) Diagnóstico de prontidão (scoring ponderado)</h4>
            <p class="diagnosis-progress">Respondidas: <strong>${result.answeredCount}/${result.total}</strong></p>
            <div class="phase-three-questions">
              ${config.dimensions.map((dimension, index) => `
                <article class="phase-three-question">
                  <div class="question-head">
                    <p class="question-index">Dimensão ${index + 1}</p>
                    <span class="phase-three-weight">Peso ${dimension.weight}x</span>
                  </div>
                  <h5>${this.escapeHtml(dimension.label)}</h5>
                  <p class="question-text">${this.escapeHtml(dimension.question)}</p>
                  <div class="phase-three-options">
                    ${dimension.options.map((option) => {
                      const checked = answers[dimension.id] === option.id;
                      return `
                        <label class="phase-three-option${checked ? " selected" : ""}">
                          <input type="radio" name="phase-three-${dimension.id}" data-phase-three-dimension-id="${dimension.id}" data-option-id="${option.id}" ${checked ? "checked" : ""}>
                          <span><strong>${this.escapeHtml(option.label)}</strong> · ${this.escapeHtml(option.summary)}</span>
                        </label>
                      `;
                    }).join("")}
                  </div>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="phase-three-card${report ? "" : " locked"}" data-phase-three-report-card>
            <h4>3) Resumo executivo + checklist</h4>
            <div data-phase-three-report>${this.renderPhaseThreeReport(result, report, recommendations)}</div>
          </section>
        </div>
      `;

      dom.diagnosisInteractive.querySelectorAll("[data-phase-three-mode]").forEach((button) => {
        button.addEventListener("click", (event) => {
          const mode = event.currentTarget.dataset.phaseThreeMode;
          const previous = this.state.phaseSelections[stepKey] || {};
          this.state.phaseSelections[stepKey] = {
            ...previous,
            mode
          };
          this.clearGateMessage();
          this.render();
        });
      });

      dom.diagnosisInteractive.querySelectorAll("[data-phase-three-field]").forEach((input) => {
        input.addEventListener("input", (event) => {
          const field = event.target.dataset.phaseThreeField;
          const previous = this.state.phaseSelections[stepKey] || {};
          this.state.phaseSelections[stepKey] = {
            ...previous,
            [field]: event.target.value
          };
          this.clearGateMessage();
          this.refreshPhaseThreeDerivedView(config);
        });
      });

      dom.diagnosisInteractive.querySelectorAll("input[data-phase-three-dimension-id]").forEach((input) => {
        input.addEventListener("change", (event) => {
          const { phaseThreeDimensionId, optionId } = event.target.dataset;
          const previous = this.state.phaseAnswers[stepKey] || {};
          this.state.phaseAnswers[stepKey] = {
            ...previous,
            [phaseThreeDimensionId]: optionId
          };
          this.clearGateMessage();
          this.render();
        });
      });
    },

    renderNavigation() {
      dom.stepsNav.innerHTML = WIZARD_STEPS.map((step, index) => `
        <button class="step-item" data-step-index="${index}" type="button">
          <span class="step-label">
            <span class="step-index">ETAPA ${step.order}</span>
            <span class="step-check">✓</span>
          </span>
          <span class="step-title">${step.title}</span>
        </button>
      `).join("");

      dom.stepsNav.querySelectorAll(".step-item").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.stepIndex);
          this.goToStep(index);
        });
      });
    },

    updateProgress() {
      const total = WIZARD_STEPS.length;
      const percentage = Math.round((this.state.completedSteps.size / total) * 100);
      dom.progressValue.textContent = `${percentage}%`;
      dom.progressBarFill.style.width = `${percentage}%`;
      dom.progressRing.style.background =
        `conic-gradient(var(--primary) ${percentage * 3.6}deg, rgba(32, 21, 21, 0.15) 0deg)`;
      dom.progressRing.setAttribute("aria-label", `${percentage}% concluído`);
    },

    updateButtons() {
      const currentStep = WIZARD_STEPS[this.state.currentStep];
      const isReady = this.isCurrentStepCompletionReady();
      const projectedCompletedSteps = this.getProjectedCompletedSteps();
      const canAdvance = this.state.currentStep < WIZARD_STEPS.length - 1
        && isReady
        && this.canAccessStep(this.state.currentStep + 1, projectedCompletedSteps);

      dom.backButton.disabled = this.state.currentStep === 0;
      dom.nextButton.disabled = !canAdvance;
      dom.exportButton.disabled = !isReady;
      if (currentStep.id === "fase-1") {
        dom.backButton.setAttribute("hidden", "hidden");
      } else {
        dom.backButton.removeAttribute("hidden");
      }
      if (currentStep.id === "fase-7") {
        dom.nextButton.setAttribute("hidden", "hidden");
      } else {
        dom.nextButton.removeAttribute("hidden");
      }

      const done = this.state.completedSteps.has(this.state.currentStep);
      dom.completeButton.textContent = done ? "Concluída" : "Marcar como concluída";
      dom.completeButton.disabled = done || !isReady;
    },

    updateNavigationState() {
      dom.stepsNav.querySelectorAll(".step-item").forEach((button) => {
        const index = Number(button.dataset.stepIndex);
        button.classList.toggle("current", index === this.state.currentStep);
        button.classList.toggle("completed", this.state.completedSteps.has(index));
        button.classList.toggle("locked", !this.canAccessStep(index));
      });
    },

    async goToStep(index) {
      if (!Number.isInteger(index) || index < 0 || index >= WIZARD_STEPS.length) {
        return;
      }

      if (!this.canAccessStep(index)) {
        const missing = this.getMissingDependencies(index);
        if (missing.includes(0)) {
          this.showGateMessage(await this.buildPhaseOneGateMessage());
          return;
        }
        if (missing.includes(1)) {
          this.showGateMessage(await this.buildPhaseTwoGateMessage());
          return;
        }
        if (missing.includes(2)) {
          this.showGateMessage(await this.buildPhaseThreeGateMessage());
          return;
        }
        if (missing.includes(3)) {
          this.showGateMessage(await this.buildPhaseFourGateMessage());
          return;
        }
        if (missing.includes(4)) {
          this.showGateMessage(await this.buildPhaseFiveGateMessage());
          return;
        }
        if (missing.includes(5)) {
          this.showGateMessage(await this.buildPhaseSixGateMessage());
          return;
        }
        if (missing.includes(6)) {
          this.showGateMessage(await this.buildPhaseSevenGateMessage());
          return;
        }
        this.showGateMessage(
          `Para acessar a Fase ${WIZARD_STEPS[index].order}, conclua: ${this.formatPhaseList(missing)}.`
        );
        return;
      }

      this.clearGateMessage();
      this.state.currentStep = index;
      this.scrollToTop();
      this.render();
    },

    async goNext() {
      if (this.state.currentStep >= WIZARD_STEPS.length - 1) {
        return;
      }

      if (!this.isCurrentStepCompletionReady()) {
        this.showGateMessage(await this.getCurrentStepGateMessage());
        return;
      }

      const nextStepIndex = this.state.currentStep + 1;
      const projectedCompletedSteps = this.getProjectedCompletedSteps();
      if (!this.canAccessStep(nextStepIndex, projectedCompletedSteps)) {
        const missing = this.getMissingDependencies(nextStepIndex, projectedCompletedSteps);
        if (missing.includes(0)) {
          this.showGateMessage(await this.buildPhaseOneGateMessage());
          return;
        }
        if (missing.includes(1)) {
          this.showGateMessage(await this.buildPhaseTwoGateMessage());
          return;
        }
        if (missing.includes(2)) {
          this.showGateMessage(await this.buildPhaseThreeGateMessage());
          return;
        }
        if (missing.includes(3)) {
          this.showGateMessage(await this.buildPhaseFourGateMessage());
          return;
        }
        if (missing.includes(4)) {
          this.showGateMessage(await this.buildPhaseFiveGateMessage());
          return;
        }
        if (missing.includes(5)) {
          this.showGateMessage(await this.buildPhaseSixGateMessage());
          return;
        }
        if (missing.includes(6)) {
          this.showGateMessage(await this.buildPhaseSevenGateMessage());
          return;
        }
        this.showGateMessage(
          `Para acessar a Fase ${WIZARD_STEPS[nextStepIndex].order}, conclua: ${this.formatPhaseList(missing)}.`
        );
        return;
      }

      this.clearGateMessage();
      this.state.completedSteps.add(this.state.currentStep);
      this.state.currentStep = nextStepIndex;
      this.scrollToTop();
      this.render();
    },

    goBack() {
      if (this.state.currentStep <= 0) {
        return;
      }
      this.clearGateMessage();
      this.state.currentStep -= 1;
      this.render();
    },

    async markCurrentStepCompleted() {
      const currentStep = WIZARD_STEPS[this.state.currentStep];
      if (!this.isCurrentStepCompletionReady()) {
        if (currentStep.id === "fase-1") {
          this.showGateMessage("Responda as 9 perguntas e confirme o entendimento do diagnóstico para concluir a Fase 1.");
          return;
        }
        if (currentStep.id === "fase-2") {
          this.showGateMessage(
            "Selecione arquétipo, proficiência, responda as 4 competências e confirme o entendimento para concluir a Fase 2."
          );
          return;
        }
        if (currentStep.id === "fase-3") {
          this.showGateMessage(await this.buildPhaseThreeGateMessage());
          return;
        }
        if (currentStep.id === "fase-4") {
          this.showGateMessage(await this.buildPhaseFourGateMessage());
          return;
        }
        if (currentStep.id === "fase-5") {
          this.showGateMessage(await this.buildPhaseFiveGateMessage());
          return;
        }
        if (currentStep.id === "fase-6") {
          this.showGateMessage(await this.buildPhaseSixGateMessage());
          return;
        }
        if (currentStep.id === "fase-7") {
          this.showGateMessage(await this.buildPhaseSevenGateMessage());
          return;
        }
        this.showGateMessage(`Confirme o entendimento da Fase ${currentStep.order} para concluí-la.`);
        return;
      }

      this.clearGateMessage();
      this.state.completedSteps.add(this.state.currentStep);
      this.render();
    }
  };

  window.AIAdoptionWizard = {
    WIZARD_STEPS,
    storageService,
    markdownService,
    diagnosisService,
    phaseTwoService,
    phaseThreeService,
    phaseFourService,
    phaseFiveService,
    phaseSixService,
    phaseSevenService,
    exportService,
    wizardController
  };

  document.addEventListener("DOMContentLoaded", () => wizardController.init());
})();
