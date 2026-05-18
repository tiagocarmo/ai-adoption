(() => {
  const STORAGE_KEY = "ai-adoption-data-wizard-state";
  const DIAGNOSIS_CONFIG_FILE = "content/01-diagnostico-organizacional-e-de-engenharia.json";

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

  const markdownCache = new Map();
  let diagnosisConfigCache = null;

  const storageService = {
    loadState() {
      try {
        const rawState = sessionStorage.getItem(STORAGE_KEY);
        if (!rawState) {
          return null;
        }

        const state = JSON.parse(rawState);
        if (typeof state.currentStep !== "number" || !Array.isArray(state.completedSteps)) {
          return null;
        }

        return {
          currentStep: Math.max(0, Math.min(WIZARD_STEPS.length - 1, state.currentStep)),
          completedSteps: new Set(state.completedSteps.filter((value) => Number.isInteger(value))),
          phaseAnswers: this.sanitizeStepMap(state.phaseAnswers),
          phaseResults: this.sanitizeStepMap(state.phaseResults),
          phaseAcknowledged: this.sanitizeBooleanStepMap(state.phaseAcknowledged)
        };
      } catch (error) {
        console.error("error loading wizard state", error);
        return null;
      }
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
      const serializable = {
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        phaseAnswers: state.phaseAnswers,
        phaseResults: state.phaseResults,
        phaseAcknowledged: state.phaseAcknowledged
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    },

    clearState() {
      sessionStorage.removeItem(STORAGE_KEY);
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
        html.push(`<p>${paragraphBuffer.join("<br>")}</p>`);
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

  const dom = {
    stepKicker: document.querySelector("#stepKicker"),
    stepTitle: document.querySelector("#stepTitle"),
    stepsNav: document.querySelector("#stepsNav"),
    summaryTitle: document.querySelector("#summaryTitle"),
    summaryContent: document.querySelector("#summaryContent"),
    goalsTitle: document.querySelector("#goalsTitle"),
    goalsContent: document.querySelector("#goalsContent"),
    questionsTitle: document.querySelector("#questionsTitle"),
    questionsContent: document.querySelector("#questionsContent"),
    criteriaTitle: document.querySelector("#criteriaTitle"),
    criteriaContent: document.querySelector("#criteriaContent"),
    diagnosisInteractive: document.querySelector("#diagnosisInteractive"),
    gateMessage: document.querySelector("#gateMessage"),
    backButton: document.querySelector("#backButton"),
    nextButton: document.querySelector("#nextButton"),
    completeButton: document.querySelector("#completeButton"),
    progressValue: document.querySelector("#progressValue"),
    progressBarFill: document.querySelector("#progressBarFill"),
    progressRing: document.querySelector("#progressRing"),
    sidebarToggle: document.querySelector("#sidebarToggle"),
    sidebar: document.querySelector("#sidebar")
  };

  const wizardController = {
    state: {
      currentStep: 0,
      completedSteps: new Set(),
      phaseAnswers: {},
      phaseResults: {},
      phaseAcknowledged: {}
    },

    async init() {
      const restoredState = storageService.loadState();
      if (restoredState) {
        this.state = restoredState;
      }

      this.renderNavigation();
      this.attachListeners();
      await this.render();
    },

    attachListeners() {
      dom.backButton.addEventListener("click", () => this.goBack());
      dom.nextButton.addEventListener("click", () => this.goNext());
      dom.completeButton.addEventListener("click", () => this.markCurrentStepCompleted());
      dom.sidebarToggle.addEventListener("click", () => {
        const expanded = dom.sidebarToggle.getAttribute("aria-expanded") === "true";
        dom.sidebarToggle.setAttribute("aria-expanded", String(!expanded));
        dom.stepsNav.classList.toggle("open", !expanded);
      });
    },

    canAccessStep(index) {
      if (index <= 0) {
        return true;
      }
      return this.isPhaseOneGateSatisfied();
    },

    isPhaseOneGateSatisfied() {
      const result = this.state.phaseResults["fase-1"];
      const answeredAll = result && result.answeredCount === result.total;
      const acknowledged = Boolean(this.state.phaseAcknowledged["fase-1"]);
      return Boolean(answeredAll && acknowledged);
    },

    showGateMessage(message) {
      dom.gateMessage.textContent = message;
      dom.gateMessage.removeAttribute("hidden");
    },

    clearGateMessage() {
      dom.gateMessage.textContent = "";
      dom.gateMessage.setAttribute("hidden", "hidden");
    },

    async render() {
      const step = WIZARD_STEPS[this.state.currentStep];
      dom.stepKicker.textContent = `Etapa ${step.order} de ${WIZARD_STEPS.length}`;
      dom.stepTitle.textContent = step.title;

      const stepText = await markdownService.loadStepMarkdown(step);
      const sections = markdownService.extractStepSections(stepText);
      const isPhaseOne = step.id === "fase-1";

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

        dom.diagnosisInteractive.innerHTML = "";
        dom.diagnosisInteractive.setAttribute("hidden", "hidden");
      }

      this.updateProgress();
      this.updateButtons();
      this.updateNavigationState();
      storageService.saveState(this.state);
    },

    async renderDiagnosisInteractive(questionsMarkdown) {
      const config = await diagnosisService.loadConfig();
      const stepKey = "fase-1";
      const answers = this.state.phaseAnswers[stepKey] || {};
      const result = diagnosisService.calculateResult(config, answers);
      const acknowledged = Boolean(this.state.phaseAcknowledged[stepKey]);

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

        <div class="diagnosis-layout">
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

              <label class="ack-box">
                <input type="checkbox" id="phaseOneAck" ${acknowledged ? "checked" : ""}>
                <span>Entendi o diagnóstico da organização neste momento.</span>
              </label>
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

      const ackInput = dom.diagnosisInteractive.querySelector("#phaseOneAck");
      if (ackInput) {
        ackInput.addEventListener("change", (event) => {
          this.state.phaseAcknowledged[stepKey] = event.target.checked;
          this.clearGateMessage();
          this.render();
        });
      }
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

          <div class="options-grid">
            ${question.options.map((option) => {
              const checked = selectedOptionId === option.id;
              return `
                <label class="option-card ${checked ? "selected" : ""}">
                  <input
                    type="radio"
                    name="${question.id}"
                    value="${option.id}"
                    data-question-id="${question.id}"
                    data-option-id="${option.id}"
                    ${checked ? "checked" : ""}
                  >
                  <span class="option-label">${option.label}</span>
                  <span class="option-score">${Number(option.score).toFixed(1)}</span>
                  <span class="option-desc">${option.description}</span>
                </label>
              `;
            }).join("")}
          </div>
        </article>
      `;
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
      dom.backButton.disabled = this.state.currentStep === 0;
      dom.nextButton.disabled = this.state.currentStep === WIZARD_STEPS.length - 1;

      const currentStep = WIZARD_STEPS[this.state.currentStep];
      if (currentStep.id === "fase-1") {
        const done = this.state.completedSteps.has(this.state.currentStep);
        const gateSatisfied = this.isPhaseOneGateSatisfied();
        dom.completeButton.textContent = done ? "Concluída" : "Marcar como concluída";
        dom.completeButton.disabled = done || !gateSatisfied;
      } else {
        const done = this.state.completedSteps.has(this.state.currentStep);
        dom.completeButton.textContent = done ? "Concluída" : "Marcar como concluída";
        dom.completeButton.disabled = done;
      }
    },

    updateNavigationState() {
      dom.stepsNav.querySelectorAll(".step-item").forEach((button) => {
        const index = Number(button.dataset.stepIndex);
        button.classList.toggle("current", index === this.state.currentStep);
        button.classList.toggle("completed", this.state.completedSteps.has(index));
        button.classList.toggle("locked", !this.canAccessStep(index));
      });
    },

    goToStep(index) {
      if (!Number.isInteger(index) || index < 0 || index >= WIZARD_STEPS.length) {
        return;
      }

      if (!this.canAccessStep(index)) {
        this.showGateMessage("Conclua a Fase 1 (9 respostas + confirmação) para avançar para a próxima etapa.");
        return;
      }

      this.clearGateMessage();
      this.state.currentStep = index;
      this.render();
    },

    goNext() {
      if (this.state.currentStep >= WIZARD_STEPS.length - 1) {
        return;
      }

      const nextStepIndex = this.state.currentStep + 1;
      if (!this.canAccessStep(nextStepIndex)) {
        this.showGateMessage("Conclua a Fase 1 (9 respostas + confirmação) antes de seguir para a Fase 2.");
        return;
      }

      this.clearGateMessage();
      this.state.currentStep = nextStepIndex;
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

    markCurrentStepCompleted() {
      const currentStep = WIZARD_STEPS[this.state.currentStep];
      if (currentStep.id === "fase-1" && !this.isPhaseOneGateSatisfied()) {
        this.showGateMessage("Responda as 9 perguntas e confirme o entendimento do diagnóstico para concluir a Fase 1.");
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
    wizardController
  };

  document.addEventListener("DOMContentLoaded", () => wizardController.init());
})();
