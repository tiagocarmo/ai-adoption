(() => {
  const STORAGE_KEY = "ai-adoption-data-wizard-state";

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
          completedSteps: new Set(state.completedSteps.filter((value) => Number.isInteger(value)))
        };
      } catch (error) {
        console.error("error loading wizard state", error);
        return null;
      }
    },

    saveState(state) {
      const serializable = {
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps)
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

      const safeLine = (line) => this.inlineMarkdown(this.escapeHtml(line.trim()));

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
          flushParagraph();
          flushList();
          continue;
        }

        const heading = /^(#{1,3})\s+(.+)$/u.exec(line);
        if (heading) {
          flushParagraph();
          flushList();
          const level = heading[1].length;
          html.push(`<h${level}>${safeLine(heading[2])}</h${level}>`);
          continue;
        }

        if (/^---+$/u.test(line)) {
          flushParagraph();
          flushList();
          html.push("<hr>");
          continue;
        }

        const quote = /^>\s?(.*)$/u.exec(line);
        if (quote) {
          flushParagraph();
          flushList();
          html.push(`<blockquote>${safeLine(quote[1])}</blockquote>`);
          continue;
        }

        const listItem = /^[-*]\s+(.+)$/u.exec(line);
        if (listItem) {
          flushParagraph();
          listBuffer.push(safeLine(listItem[1]));
          continue;
        }

        flushList();
        paragraphBuffer.push(safeLine(line));
      }

      flushParagraph();
      flushList();

      return html.join("\n");
    },

    extractStepSections(mdText) {
      const sections = this.splitSections(mdText);
      const summary = this.pickSection(sections, ["visão rápida", "objetivo da fase"], "intro");
      const goals = this.pickSection(sections, ["objetivo da fase", "objetivos"], "firstQuestion");
      const questions = this.pickSection(
        sections,
        ["as 9 perguntas", "perguntas", "dimensões avaliadas", "questão", "matriz"],
        "mid"
      );
      const criteria = this.pickSection(
        sections,
        ["conclusão esperada", "critérios", "métricas", "gate", "expansão"],
        "tail"
      );

      return {
        summary,
        goals,
        questions,
        criteria
      };
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
        } else {
          current.content.push(rawLine);
        }
      }
      sections.push(current);

      return sections
        .map((section) => ({
          heading: section.heading,
          text: section.content.join("\n").trim()
        }))
        .filter((section) => section.text.length > 0);
    },

    pickSection(sections, keywords, fallbackType) {
      const exact = sections.find((section) => keywords.some((keyword) => section.heading.includes(keyword)));
      if (exact) {
        return exact.text;
      }

      if (fallbackType === "intro") {
        return sections[0]?.text || "Conteúdo não encontrado.";
      }
      if (fallbackType === "firstQuestion") {
        return sections.find((section) => section.heading.includes("quest"))?.text || sections[1]?.text || sections[0]?.text;
      }
      if (fallbackType === "mid") {
        const middle = Math.floor(sections.length / 2);
        return sections[middle]?.text || sections[0]?.text;
      }

      return sections[sections.length - 1]?.text || sections[0]?.text;
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

  const dom = {
    stepKicker: document.querySelector("#stepKicker"),
    stepTitle: document.querySelector("#stepTitle"),
    stepsNav: document.querySelector("#stepsNav"),
    summaryContent: document.querySelector("#summaryContent"),
    goalsContent: document.querySelector("#goalsContent"),
    questionsContent: document.querySelector("#questionsContent"),
    criteriaContent: document.querySelector("#criteriaContent"),
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
      completedSteps: new Set()
    },

    init() {
      const restoredState = storageService.loadState();
      if (restoredState) {
        this.state = restoredState;
      }

      this.renderNavigation();
      this.attachListeners();
      this.render();
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

    async render() {
      const step = WIZARD_STEPS[this.state.currentStep];
      dom.stepKicker.textContent = `Etapa ${step.order} de ${WIZARD_STEPS.length}`;
      dom.stepTitle.textContent = step.title;

      const stepText = await markdownService.loadStepMarkdown(step);
      const sections = markdownService.extractStepSections(stepText);

      dom.summaryContent.innerHTML = markdownService.parseMarkdown(sections.summary || "Conteúdo indisponível.");
      dom.goalsContent.innerHTML = markdownService.parseMarkdown(sections.goals || "Conteúdo indisponível.");
      dom.questionsContent.innerHTML = markdownService.parseMarkdown(sections.questions || "Conteúdo indisponível.");
      dom.criteriaContent.innerHTML = markdownService.parseMarkdown(sections.criteria || "Conteúdo indisponível.");

      this.updateProgress();
      this.updateButtons();
      this.updateNavigationState();
      storageService.saveState(this.state);
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
      const done = this.state.completedSteps.has(this.state.currentStep);
      dom.completeButton.textContent = done ? "Concluída" : "Marcar como concluída";
      dom.completeButton.disabled = done;
    },

    updateNavigationState() {
      dom.stepsNav.querySelectorAll(".step-item").forEach((button) => {
        const index = Number(button.dataset.stepIndex);
        button.classList.toggle("current", index === this.state.currentStep);
        button.classList.toggle("completed", this.state.completedSteps.has(index));
      });
    },

    goToStep(index) {
      if (!Number.isInteger(index) || index < 0 || index >= WIZARD_STEPS.length) {
        return;
      }
      this.state.currentStep = index;
      this.render();
    },

    goNext() {
      if (this.state.currentStep >= WIZARD_STEPS.length - 1) {
        return;
      }
      this.state.currentStep += 1;
      this.render();
    },

    goBack() {
      if (this.state.currentStep <= 0) {
        return;
      }
      this.state.currentStep -= 1;
      this.render();
    },

    markCurrentStepCompleted() {
      this.state.completedSteps.add(this.state.currentStep);
      this.render();
    }
  };

  window.AIAdoptionWizard = {
    WIZARD_STEPS,
    storageService,
    markdownService,
    wizardController
  };

  document.addEventListener("DOMContentLoaded", () => wizardController.init());
})();
