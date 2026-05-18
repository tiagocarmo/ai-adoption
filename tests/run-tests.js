import fs from "node:fs";
import vm from "node:vm";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const scriptContent = fs.readFileSync("./script.js", "utf8");

function createElement() {
  return {
    innerHTML: "",
    textContent: "",
    disabled: false,
    style: {},
    attributes: {},
    dataset: {},
    classList: {
      toggle() {},
      add() {},
      remove() {}
    },
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    getAttribute(key) {
      return this.attributes[key];
    },
    removeAttribute(key) {
      delete this.attributes[key];
    }
  };
}

const elements = {
  "#stepKicker": createElement(),
  "#stepTitle": createElement(),
  "#stepsNav": createElement(),
  "#summarySection": createElement(),
  "#summaryTitle": createElement(),
  "#summaryContent": createElement(),
  "#goalsSection": createElement(),
  "#goalsTitle": createElement(),
  "#goalsContent": createElement(),
  "#questionsSection": createElement(),
  "#questionsTitle": createElement(),
  "#questionsContent": createElement(),
  "#criteriaSection": createElement(),
  "#criteriaTitle": createElement(),
  "#criteriaContent": createElement(),
  "#diagnosisInteractive": createElement(),
  "#phaseAcknowledgment": createElement(),
  "#gateMessage": createElement(),
  "#backButton": createElement(),
  "#nextButton": createElement(),
  "#completeButton": createElement(),
  "#progressValue": createElement(),
  "#progressBarFill": createElement(),
  "#progressRing": createElement(),
  "#sidebarToggle": createElement(),
  "#sidebar": createElement()
};

elements["#stepsNav"].querySelectorAll = () => [];

const context = {
  console,
  window: {
    scrollToCalls: [],
    scrollTo(options) {
      this.scrollToCalls.push(options);
    }
  },
  document: {
    querySelector(selector) {
      return elements[selector] || createElement();
    },
    addEventListener() {}
  },
  sessionStorage: {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    }
  },
  fetch: async (path) => {
    if (path.endsWith("03-definicao-do-time-piloto.json")) {
      return {
        ok: true,
        json: async () => ({
          scoreBands: [
            { id: "baixo", label: "Baixo", min: 0, max: 1.67 },
            { id: "medio", label: "Médio", min: 1.67, max: 2.34 },
            { id: "alto", label: "Alto", min: 2.34, max: 99 }
          ],
          impactPriority: ["autonomia", "feedbackSpeed", "senioridade"],
          inputModes: [
            { id: "squad", label: "Por squad", description: "d" },
            { id: "individuos", label: "Por indivíduos", description: "d" },
            { id: "gestao", label: "Por gestão", description: "d" }
          ],
          requiredFieldsByMode: {
            squad: ["teamName", "members", "operationalContext", "rationale"],
            individuos: ["leadName", "individuals", "pilotScope", "rationale"],
            gestao: ["managerName", "governanceContext", "teamStructure", "rationale"]
          },
          fieldLabels: {
            teamName: "Nome do squad",
            members: "Membros",
            operationalContext: "Contexto operacional",
            rationale: "Racional",
            leadName: "Lead",
            individuals: "Indivíduos",
            pilotScope: "Escopo",
            managerName: "Gestor",
            governanceContext: "Governança",
            teamStructure: "Estrutura"
          },
          dimensions: [
            {
              id: "autonomia",
              label: "Autonomia Técnica",
              weight: 2,
              question: "q",
              options: [
                { id: "baixo", label: "B", score: 1, summary: "s" },
                { id: "medio", label: "M", score: 2, summary: "s" },
                { id: "alto", label: "A", score: 3, summary: "s" }
              ]
            },
            {
              id: "feedbackSpeed",
              label: "Velocidade de Feedback",
              weight: 2,
              question: "q",
              options: [
                { id: "baixo", label: "B", score: 1, summary: "s" },
                { id: "medio", label: "M", score: 2, summary: "s" },
                { id: "alto", label: "A", score: 3, summary: "s" }
              ]
            },
            {
              id: "senioridade",
              label: "Senioridade",
              weight: 2,
              question: "q",
              options: [
                { id: "baixo", label: "B", score: 1, summary: "s" },
                { id: "medio", label: "M", score: 2, summary: "s" },
                { id: "alto", label: "A", score: 3, summary: "s" }
              ]
            },
            {
              id: "segurancaPsicologica",
              label: "Segurança Psicológica",
              weight: 1,
              question: "q",
              options: [
                { id: "baixo", label: "B", score: 1, summary: "s" },
                { id: "medio", label: "M", score: 2, summary: "s" },
                { id: "alto", label: "A", score: 3, summary: "s" }
              ]
            },
            {
              id: "estabilidadeRoadmap",
              label: "Estabilidade de Roadmap",
              weight: 1,
              question: "q",
              options: [
                { id: "baixo", label: "B", score: 1, summary: "s" },
                { id: "medio", label: "M", score: 2, summary: "s" },
                { id: "alto", label: "A", score: 3, summary: "s" }
              ]
            }
          ],
          toolCatalog: [
            { name: "Tool 1", category: "Codificação", guidance: "g", prioritizedFor: ["autonomia"] },
            { name: "Tool 2", category: "Testes", guidance: "g", prioritizedFor: ["feedbackSpeed"] }
          ],
          successMetrics: {
            baixo: ["m1"],
            medio: ["m2"],
            alto: ["m3"]
          },
          kickoffChecklist: ["c1", "c2"],
          expansionCriteria: {
            baixo: ["e1"],
            medio: ["e2"],
            alto: ["e3"]
          }
        })
      };
    }

    if (path.endsWith("02-time-ai-enablers.json")) {
      return {
        ok: true,
        json: async () => ({
          archetypes: [
            {
              id: "lean",
              label: "Lean",
              sizing: "0,5-1",
              context: "Small",
              responsibilities: { technical: ["A"], process: ["B"], culture: ["C"] },
              plan3090: { d30: "d30" }
            },
            {
              id: "dedicado",
              label: "Dedicado",
              sizing: "2-3",
              context: "Mid",
              responsibilities: { technical: ["A"], process: ["B"], culture: ["C"] },
              plan3090: { d30: "d30" }
            }
          ],
          proficiencyLevels: [
            { id: "l1", label: "L1", score: 1, characteristic: "c", practical: "p", gate: "g" },
            { id: "l2", label: "L2", score: 2, characteristic: "c", practical: "p", gate: "g" }
          ],
          competencies: [
            { id: "prompt_engineering", title: "Prompt", description: "d", question: "q1" },
            { id: "output_critique", title: "Output", description: "d", question: "q2" }
          ],
          familiarityOptions: [
            { id: "nao_familiar", label: "Não familiar", score: 1, description: "d" },
            { id: "familiar", label: "Familiar", score: 2, description: "d" },
            { id: "muito_familiar", label: "Muito familiar", score: 3, description: "d" }
          ],
          weights: { competencies: 0.55, proficiency: 0.25, archetypeReadiness: 0.2 },
          archetypeReadinessRules: {
            lean: { minProficiencyScore: 1, minCompetencyAverage: 1.5 },
            dedicado: { minProficiencyScore: 2, minCompetencyAverage: 2.0 }
          },
          scoreBands: [
            { id: "baixo", label: "Baixo", min: 0, max: 1.85, risk: "Alto", nextStep: "n1" },
            { id: "medio", label: "Médio", min: 1.85, max: 2.45, risk: "Médio", nextStep: "n2" },
            { id: "alto", label: "Alto", min: 2.45, max: 99, risk: "Baixo", nextStep: "n3" }
          ],
          recommendations: {
            gapByCompetency: { prompt_engineering: "r1", output_critique: "r2" },
            planHints: { lean: "pl", dedicado: "pd" }
          }
        })
      };
    }

    if (path.endsWith("05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.json")) {
      return {
        ok: true,
        json: async () => ({
          baselineQuestions: [
            { id: "currentAiUsage", options: [{ id: "none" }, { id: "team" }, { id: "organization" }] },
            { id: "overallLevel", options: [{ id: "low" }, { id: "medium" }, { id: "high" }] },
            { id: "dxCode", options: [{ id: "low" }, { id: "medium" }, { id: "high" }] },
            { id: "seniority", options: [{ id: "low" }, { id: "medium" }, { id: "high" }] },
            { id: "quality", options: [{ id: "low" }, { id: "medium" }, { id: "high" }] },
            { id: "continuousDelivery", options: [{ id: "low" }, { id: "medium" }, { id: "high" }] }
          ],
          templates: [
            { id: "conservador", label: "Conservador", defaultLevels: { planejamento: "experimental", codificacao: "experimental", review: "none", testes: "team", deploy: "none", observabilidade: "experimental" } },
            { id: "balanceado", label: "Balanceado", defaultLevels: { planejamento: "experimental", codificacao: "team", review: "experimental", testes: "experimental", deploy: "none", observabilidade: "experimental" } },
            { id: "agressivo", label: "Agressivo", defaultLevels: { planejamento: "team", codificacao: "org", review: "team", testes: "team", deploy: "experimental", observabilidade: "team" } }
          ],
          levels: [{ id: "none" }, { id: "experimental" }, { id: "team" }, { id: "org" }],
          responsibilityOptions: [{ id: "ia" }, { id: "human" }, { id: "shared" }],
          stages: [
            { id: "planejamento", label: "Planejamento", antiPatterns: ["a"], advancementCriteria: ["c1", "c2"] },
            { id: "codificacao", label: "Codificação", antiPatterns: ["a"], advancementCriteria: ["c1", "c2"] },
            { id: "review", label: "Code Review", antiPatterns: ["a"], advancementCriteria: ["c1", "c2"] },
            { id: "testes", label: "Testes", antiPatterns: ["a"], advancementCriteria: ["c1", "c2"] },
            { id: "deploy", label: "Deploy", antiPatterns: ["a"], advancementCriteria: ["c1", "c2"] },
            { id: "observabilidade", label: "Observabilidade", antiPatterns: ["a"], advancementCriteria: ["c1", "c2"] }
          ]
        })
      };
    }

    if (path.endsWith(".json")) {
      return {
        ok: true,
        json: async () => ({
          scoreBands: [
            { id: "low", label: "Baixo", min: 0, max: 1.67, interpretation: "low" },
            { id: "medium", label: "Médio", min: 1.67, max: 2.34, interpretation: "medium" },
            { id: "high", label: "Alto", min: 2.34, max: 99, interpretation: "high" }
          ],
          blockMetadata: [{ id: "A", title: "A" }],
          impactPriority: ["q1", "q2"],
          questions: [
            {
              id: "q1",
              block: "A",
              title: "Q1",
              prompt: "P1",
              impact: "I1",
              options: [
                { id: "low", label: "Baixo", score: 1, description: "d" },
                { id: "medium", label: "Médio", score: 2, description: "d" },
                { id: "high", label: "Alto", score: 3, description: "d" }
              ]
            },
            {
              id: "q2",
              block: "A",
              title: "Q2",
              prompt: "P2",
              impact: "I2",
              options: [
                { id: "low", label: "Baixo", score: 1, description: "d" },
                { id: "medium", label: "Médio", score: 2, description: "d" },
                { id: "high", label: "Alto", score: 3, description: "d" }
              ]
            }
          ]
        })
      };
    }

    return {
      ok: true,
      text: async () => "# title"
    };
  }
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

const {
  markdownService,
  wizardController,
  WIZARD_STEPS,
  diagnosisService,
  phaseTwoService,
  phaseThreeService,
  phaseFourService,
  phaseFiveService,
  phaseSixService
} = context.window.AIAdoptionWizard;

function testMarkdownParse() {
  const html = markdownService.parseMarkdown(
    "# Titulo\n\n## Secao\nTexto **forte**\n\n- item 1\n* item 2\n\n> citação\n\n---"
  );

  assert(html.includes("<h1>Titulo</h1>"), "must parse h1 heading");
  assert(html.includes("<h2>Secao</h2>"), "must parse h2 heading");
  assert(html.includes("<strong>forte</strong>"), "must parse bold");
  assert(html.includes("<ul>"), "must parse list");
  assert(html.includes("<blockquote>citação</blockquote>"), "must parse blockquote");
  assert(html.includes("<hr>"), "must parse hr");
}

function testMarkdownParagraphFlow() {
  const html = markdownService.parseMarkdown(
    "Linha longa quebrada no arquivo\ncontinua aqui sem parágrafo novo"
  );
  assert(!html.includes("<br>"), "must not inject automatic br for wrapped lines");
  assert(html.includes("arquivo continua"), "must keep sentence flow with whitespace");
}

function testMarkdownTableParse() {
  const html = markdownService.parseMarkdown(
    "| Nível | Score |\n| --- | --- |\n| Baixo | < 1,67 |\n| Alto | >= 2,34 |"
  );

  assert(html.includes("<table>"), "must parse table element");
  assert(html.includes("<thead>"), "must parse table head");
  assert(html.includes("<tbody>"), "must parse table body");
  assert(html.includes("<td>Baixo</td>"), "must include row values");
}

function testMarkdownEscape() {
  const html = markdownService.parseMarkdown("<script>alert('xss')</script>");
  assert(html.includes("&lt;script&gt;"), "must escape html tags");
  assert(!html.includes("<script>"), "must not keep raw script tag");
}

function testExtractSectionsSemantic() {
  const md = [
    "# Fase",
    "",
    "## Objetivo da fase",
    "Texto objetivo",
    "",
    "## Metodologia de pontuação",
    "Texto metodologia",
    "",
    "## Os 3 macro-blocos",
    "Texto blocos",
    "",
    "## As 9 perguntas do diagnóstico",
    "Texto perguntas",
    "",
    "## Recomendações por dimensão e nível",
    "Texto recomendações"
  ].join("\n");

  const sections = markdownService.extractStepSections(md);
  assert(sections.phaseGoal.includes("Texto objetivo"), "must map objective section");
  assert(sections.methodology.includes("Texto metodologia"), "must map methodology section");
  assert(sections.macroBlocks.includes("Texto blocos"), "must map macro-block section");
  assert(sections.diagnosisQuestions.includes("Texto perguntas"), "must map questions section");
  assert(sections.recommendations.includes("Texto recomendações"), "must map recommendations section");
}

function testDiagnosisScoreAndBottleneck() {
  const config = {
    scoreBands: [
      { id: "low", label: "Baixo", min: 0, max: 1.67 },
      { id: "medium", label: "Médio", min: 1.67, max: 2.34 },
      { id: "high", label: "Alto", min: 2.34, max: 99 }
    ],
    impactPriority: ["q2", "q1"],
    questions: [
      {
        id: "q1",
        block: "A",
        title: "Q1",
        options: [
          { id: "low", label: "Baixo", score: 1 },
          { id: "medium", label: "Médio", score: 2 },
          { id: "high", label: "Alto", score: 3 }
        ]
      },
      {
        id: "q2",
        block: "B",
        title: "Q2",
        options: [
          { id: "low", label: "Baixo", score: 1 },
          { id: "medium", label: "Médio", score: 2 },
          { id: "high", label: "Alto", score: 3 }
        ]
      }
    ]
  };

  const result = diagnosisService.calculateResult(config, { q1: "low", q2: "medium" });
  assert(result.answeredCount === 2, "must count answered questions");
  assert(result.average.toFixed(2) === "1.50", "must compute average score");
  assert(result.overallBand.label === "Baixo", "must classify score range");

  const tieResult = diagnosisService.calculateResult(config, { q1: "low", q2: "low" });
  const bottleneck = diagnosisService.getBottleneck(config, tieResult);
  assert(bottleneck.questionId === "q2", "must apply impact-based tie-break");
}

function testPhaseOneGate() {
  wizardController.state.phaseResults = {
    "fase-1": {
      answeredCount: 8,
      total: 9
    }
  };
  wizardController.state.phaseAcknowledged = { "fase-1": false };
  assert(!wizardController.isPhaseOneGateSatisfied(), "gate must fail with incomplete answers");

  wizardController.state.phaseResults = {
    "fase-1": {
      answeredCount: 9,
      total: 9
    }
  };
  wizardController.state.phaseAcknowledged = { "fase-1": false };
  assert(!wizardController.isPhaseOneGateSatisfied(), "gate must fail without acknowledgment");

  wizardController.state.phaseAcknowledged = { "fase-1": true };
  assert(wizardController.isPhaseOneGateSatisfied(), "gate must pass with 9/9 + acknowledgment");
}

function testPhaseFourSanitizeAndPrioritization() {
  const config = {
    regrasPontuacao: {
      classificacao: {
        critical: { label: "Crítico", min: 11, max: 15 },
        medium: { label: "Médio", min: 7, max: 10 }
      }
    },
    trilhas: [
      { id: "tecnica", label: "Trilha Técnica" },
      { id: "organizacional", label: "Trilha Organizacional" },
      { id: "cultura", label: "Trilha Cultura" }
    ],
    marcos: []
  };

  const rawItems = [
    { id: "a", trilhaId: "tecnica", descricao: "A", impacto: 3, esforco: 1, risco: 3 },
    { id: "b", trilhaId: "tecnica", descricao: "A", impacto: 3, esforco: 1, risco: 3 },
    { id: "c", trilhaId: "organizacional", descricao: "B", impacto: 1, esforco: 3, risco: 1 },
    { id: "d", trilhaId: "cultura", descricao: "", impacto: 2, esforco: 2, risco: 2 }
  ];

  const sanitized = phaseFourService.sanitizeBacklog(rawItems);
  assert(sanitized.length === 2, "must remove duplicates and invalid empty items");

  const prioritized = phaseFourService.calculatePrioritization(config, rawItems);
  assert(prioritized.prioritizedItems.length === 2, "must prioritize only valid items");
  assert(prioritized.prioritizedItems[0].score === 21, "must apply score formula");
  assert(prioritized.prioritizedItems[0].priority.id === "critical", "must classify critical score");
  assert(prioritized.prioritizedItems[1].priority.id === "medium", "must classify medium score");
}

function testPhaseFourRoadmap() {
  const config = {
    marcos: [
      { id: "d30", label: "+30 dias", foco: "f", criterioConclusao: "c" },
      { id: "d90", label: "+90 dias", foco: "f", criterioConclusao: "c" },
      { id: "d180", label: "+180 dias", foco: "f", criterioConclusao: "c" }
    ]
  };

  const roadmap = phaseFourService.buildRoadmap(config, [
    { id: "a", priority: { id: "critical" }, esforco: 1 },
    { id: "b", priority: { id: "critical" }, esforco: 2 },
    { id: "c", priority: { id: "medium" }, esforco: 3 }
  ]);

  assert(roadmap.d30.length === 1, "critical + low effort must go to d30");
  assert(roadmap.d90.length === 1, "remaining medium effort must go to d90");
  assert(roadmap.d180.length === 1, "high effort must go to d180");
}

async function testPhaseFourGate() {
  wizardController.state.phaseResults = {
    "fase-4": {
      hasMinimumByTrack: false,
      invalidCount: 1,
      roadmapItemCount: 0
    }
  };
  wizardController.state.phaseAcknowledged = { "fase-4": false };
  assert(!wizardController.isPhaseFourGateSatisfied(), "phase 4 gate must fail with missing criteria");
  const failMessage = await wizardController.buildPhaseFourGateMessage();
  assert(failMessage.includes("ao menos 1 gargalo"), "must explain missing track criteria");

  wizardController.state.phaseResults = {
    "fase-4": {
      hasMinimumByTrack: true,
      invalidCount: 0,
      roadmapItemCount: 3
    }
  };
  wizardController.state.phaseAcknowledged = { "fase-4": true };
  assert(wizardController.isPhaseFourGateSatisfied(), "phase 4 gate must pass when complete");
}

function testPhaseTwoScoreAndGate() {
  const config = {
    archetypes: [
      { id: "lean", label: "Lean" },
      { id: "dedicado", label: "Dedicado" }
    ],
    proficiencyLevels: [
      { id: "l1", label: "L1", score: 1 },
      { id: "l2", label: "L2", score: 2 }
    ],
    competencies: [
      { id: "prompt_engineering", title: "Prompt" },
      { id: "output_critique", title: "Output" }
    ],
    familiarityOptions: [
      { id: "nao_familiar", label: "Não familiar", score: 1 },
      { id: "familiar", label: "Familiar", score: 2 },
      { id: "muito_familiar", label: "Muito familiar", score: 3 }
    ],
    weights: { competencies: 0.55, proficiency: 0.25, archetypeReadiness: 0.2 },
    archetypeReadinessRules: {
      lean: { minProficiencyScore: 1, minCompetencyAverage: 1.5 },
      dedicado: { minProficiencyScore: 2, minCompetencyAverage: 2.0 }
    },
    scoreBands: [
      { id: "baixo", label: "Baixo", min: 0, max: 1.85, risk: "Alto", nextStep: "n1" },
      { id: "medio", label: "Médio", min: 1.85, max: 2.45, risk: "Médio", nextStep: "n2" },
      { id: "alto", label: "Alto", min: 2.45, max: 99, risk: "Baixo", nextStep: "n3" }
    ],
    recommendations: {
      gapByCompetency: { prompt_engineering: "r1", output_critique: "r2" },
      planHints: { lean: "pl", dedicado: "pd" }
    }
  };

  const answers = {
    prompt_engineering: "muito_familiar",
    output_critique: "familiar"
  };
  const selections = {
    archetypeId: "dedicado",
    proficiencyLevelId: "l2"
  };
  const result = phaseTwoService.calculateResult(config, answers, selections);

  assert(result.answeredCount === 2, "phase 2 must count answered competencies");
  assert(result.archetypeReadiness === 1, "phase 2 must check archetype readiness");
  assert(result.overallBand.label === "Médio" || result.overallBand.label === "Alto", "phase 2 must classify score");

  wizardController.state.phaseAnswers = { "fase-2": answers };
  wizardController.state.phaseSelections = { "fase-2": selections };
  wizardController.state.phaseResults = { "fase-2": result };
  wizardController.state.phaseAcknowledged = { "fase-2": true };
  assert(wizardController.isPhaseTwoGateSatisfied(), "phase 2 gate must pass with complete inputs and ack");

  wizardController.state.phaseAcknowledged = { "fase-2": false };
  assert(!wizardController.isPhaseTwoGateSatisfied(), "phase 2 gate must fail without ack");
}

function testPhaseThreeScoreAndGate() {
  const config = {
    scoreBands: [
      { id: "baixo", label: "Baixo", min: 0, max: 1.67 },
      { id: "medio", label: "Médio", min: 1.67, max: 2.34 },
      { id: "alto", label: "Alto", min: 2.34, max: 99 }
    ],
    impactPriority: ["autonomia", "feedbackSpeed", "senioridade"],
    inputModes: [{ id: "squad", label: "Por squad" }],
    requiredFieldsByMode: { squad: ["teamName", "members", "operationalContext", "rationale"] },
    fieldLabels: { teamName: "Nome do squad" },
    dimensions: [
      {
        id: "autonomia",
        label: "Autonomia",
        weight: 2,
        options: [
          { id: "baixo", label: "Baixo", score: 1, summary: "s" },
          { id: "medio", label: "Médio", score: 2, summary: "s" },
          { id: "alto", label: "Alto", score: 3, summary: "s" }
        ]
      },
      {
        id: "feedbackSpeed",
        label: "Feedback",
        weight: 2,
        options: [
          { id: "baixo", label: "Baixo", score: 1, summary: "s" },
          { id: "medio", label: "Médio", score: 2, summary: "s" },
          { id: "alto", label: "Alto", score: 3, summary: "s" }
        ]
      },
      {
        id: "senioridade",
        label: "Senioridade",
        weight: 2,
        options: [
          { id: "baixo", label: "Baixo", score: 1, summary: "s" },
          { id: "medio", label: "Médio", score: 2, summary: "s" },
          { id: "alto", label: "Alto", score: 3, summary: "s" }
        ]
      },
      {
        id: "segurancaPsicologica",
        label: "Segurança",
        weight: 1,
        options: [
          { id: "baixo", label: "Baixo", score: 1, summary: "s" },
          { id: "medio", label: "Médio", score: 2, summary: "s" },
          { id: "alto", label: "Alto", score: 3, summary: "s" }
        ]
      },
      {
        id: "estabilidadeRoadmap",
        label: "Roadmap",
        weight: 1,
        options: [
          { id: "baixo", label: "Baixo", score: 1, summary: "s" },
          { id: "medio", label: "Médio", score: 2, summary: "s" },
          { id: "alto", label: "Alto", score: 3, summary: "s" }
        ]
      }
    ],
    toolCatalog: [{ name: "Tool", category: "C", guidance: "G", prioritizedFor: ["autonomia"] }],
    successMetrics: { baixo: ["m1"], medio: ["m2"], alto: ["m3"] },
    kickoffChecklist: ["c1"],
    expansionCriteria: { baixo: ["e1"], medio: ["e2"], alto: ["e3"] }
  };

  const answers = {
    autonomia: "alto",
    feedbackSpeed: "medio",
    senioridade: "medio",
    segurancaPsicologica: "alto",
    estabilidadeRoadmap: "medio"
  };
  const selection = {
    mode: "squad",
    teamName: "Squad X",
    members: "Ana, Bruno",
    operationalContext: "Contexto",
    rationale: "Racional"
  };

  const result = phaseThreeService.calculateResult(config, answers);
  assert(result.answeredCount === 5, "phase 3 must count all answered dimensions");
  assert(result.readinessScore > 2, "phase 3 must compute weighted score");

  const validation = phaseThreeService.validateSelection(config, selection);
  assert(validation.valid, "phase 3 selection must be valid with required fields");

  const recommendations = phaseThreeService.buildRecommendations(config, result);
  const report = phaseThreeService.buildExecutiveReport(config, selection, result, recommendations);
  assert(report.candidateName === "Squad X", "phase 3 report must keep candidate");

  wizardController.state.currentStep = 2;
  wizardController.state.phaseResults = { "fase-3": { answeredCount: 5, total: 5 } };
  wizardController.state.phaseSelections = { "fase-3": { mode: "squad" } };
  wizardController.state.phaseReports = { "fase-3": report };
  wizardController.state.phaseAcknowledged = { "fase-3": true };
  assert(wizardController.isPhaseThreeGateSatisfied(), "phase 3 gate must pass when complete");

  wizardController.state.phaseAcknowledged = { "fase-3": false };
  assert(!wizardController.isPhaseThreeGateSatisfied(), "phase 3 gate must fail without acknowledgment");
}

function testPhaseFiveTemplateAndCalibration() {
  const config = {
    templates: [
      { id: "conservador", defaultLevels: { codificacao: "experimental", review: "none", testes: "team", deploy: "none", planejamento: "experimental", observabilidade: "experimental" } },
      { id: "balanceado", defaultLevels: { codificacao: "team", review: "experimental", testes: "experimental", deploy: "none", planejamento: "experimental", observabilidade: "experimental" } },
      { id: "agressivo", defaultLevels: { codificacao: "org", review: "team", testes: "team", deploy: "experimental", planejamento: "team", observabilidade: "team" } }
    ],
    stages: [
      { id: "planejamento", label: "Planejamento", advancementCriteria: ["c1"] },
      { id: "codificacao", label: "Codificação", advancementCriteria: ["c1"] },
      { id: "review", label: "Code Review", advancementCriteria: ["c1"] },
      { id: "testes", label: "Testes", advancementCriteria: ["c1"] },
      { id: "deploy", label: "Deploy", advancementCriteria: ["c1"] },
      { id: "observabilidade", label: "Observabilidade", advancementCriteria: ["c1"] }
    ],
    levels: [{ id: "none" }, { id: "experimental" }, { id: "team" }, { id: "org" }],
    responsibilityOptions: [{ id: "ia" }, { id: "human" }, { id: "shared" }]
  };

  const resolved = phaseFiveService.resolveTemplate(config, {
    currentAiUsage: "none",
    overallLevel: "medium"
  });
  assert(resolved.templateId === "conservador", "phase 5 must resolve conservative template");

  const base = phaseFiveService.buildInitialPlan(config, {
    phaseOneBandId: "high",
    phaseTwoBandId: "high",
    phaseThreeBandId: "high",
    phaseThreeBottleneckId: ""
  });
  const calibrated = phaseFiveService.applyCalibrations(config, base, {
    ...base.signals,
    dxCode: "low",
    seniority: "low",
    quality: "low",
    continuousDelivery: "low"
  });

  const deploy = calibrated.stagePlan.find((item) => item.stageId === "deploy");
  const code = calibrated.stagePlan.find((item) => item.stageId === "codificacao");
  assert(deploy.levelId === "none", "phase 5 must force deploy none on low CD");
  assert(code.levelId === "experimental", "phase 5 must cap coding to experimental on low DX");
}

function testPhaseFiveValidationAndGate() {
  const config = {
    stages: [
      { id: "planejamento", label: "Planejamento" },
      { id: "codificacao", label: "Codificação" },
      { id: "review", label: "Code Review" },
      { id: "testes", label: "Testes" },
      { id: "deploy", label: "Deploy" },
      { id: "observabilidade", label: "Observabilidade" }
    ],
    levels: [{ id: "none" }, { id: "experimental" }, { id: "team" }, { id: "org" }],
    responsibilityOptions: [{ id: "ia" }, { id: "human" }, { id: "shared" }]
  };
  const incomplete = {
    templateId: "balanceado",
    stagePlan: config.stages.map((stage) => ({
      stageId: stage.id,
      levelId: "experimental",
      responsibilityId: "shared",
      selectedCriteria: [],
      selectedAntiPatterns: []
    }))
  };
  const invalid = phaseFiveService.validatePlan(config, incomplete);
  assert(!invalid.valid, "phase 5 validation must fail without criteria");

  const complete = {
    ...incomplete,
    stagePlan: incomplete.stagePlan.map((item) => ({ ...item, selectedCriteria: [0] }))
  };
  const valid = phaseFiveService.validatePlan(config, complete);
  assert(valid.valid, "phase 5 validation must pass with criteria filled");

  wizardController.state.phaseResults = { "fase-5": { valid: true, validation: { valid: true, missing: [] } } };
  wizardController.state.phaseAcknowledged = { "fase-5": true };
  assert(wizardController.isPhaseFiveGateSatisfied(), "phase 5 gate must pass with valid plan and ack");

  wizardController.state.phaseAcknowledged = { "fase-5": false };
  assert(!wizardController.isPhaseFiveGateSatisfied(), "phase 5 gate must fail without ack");
}

function testPhaseSixGovernancePack() {
  const config = {
    questions: [
      { id: "orgSize", options: [{ id: "small", score: 1 }, { id: "large", score: 3 }] },
      { id: "hasAgentic", options: [{ id: "no", score: 1 }, { id: "yes", score: 3 }] },
      { id: "mcpServersCount", options: [{ id: "none", score: 1 }, { id: "3+", score: 3 }] }
    ],
    owners: {
      core: [{ policy: "Uso de Dados em Prompts", owner: "Security", review: "Anual" }]
    },
    technicalStandards: ["Prompts Versionados"],
    guardrails: {
      critical: ["Nenhum PII em Prompts"],
      high: ["Privacy Mode"],
      medium: ["Alertas de Anomalia de Uso"]
    }
  };

  const profile = phaseSixService.calculateProfile(config, {
    orgSize: "large",
    hasAgentic: "yes",
    mcpServersCount: "3+"
  });
  assert(profile.answeredCount === 3, "phase 6 must count answered questions");
  assert(profile.profileBand === "scalable", "phase 6 must classify scalable profile");

  const pack = phaseSixService.buildGovernancePack(
    config,
    { orgSize: "large", hasAgentic: "yes", mcpServersCount: "3+" },
    profile
  );
  assert(pack.teamModel.includes("Distribuído"), "phase 6 should recommend distributed model for large org");
  assert(
    pack.mandatoryControls.some((item) => item.includes("MCP Security")),
    "phase 6 should include MCP controls when servers exist"
  );
}

function testCanAccessStep() {
  wizardController.state.completedSteps = new Set();
  assert(wizardController.canAccessStep(0), "must allow current phase");
  assert(!wizardController.canAccessStep(1), "must block phase 2 without phase 1 completed");

  wizardController.state.completedSteps = new Set([0, 1, 2, 3, 4, 5]);
  assert(wizardController.canAccessStep(6), "must allow phase 7 when 3,5,6 are completed");

  wizardController.state.completedSteps = new Set([0, 1, 2, 5]);
  assert(!wizardController.canAccessStep(6), "must block phase 7 when one dependency is missing");
}

function testMissingDependencies() {
  wizardController.state.completedSteps = new Set([0, 1]);
  const missingForFive = wizardController.getMissingDependencies(4);
  assert(missingForFive.length === 2, "phase 5 should require two dependencies");
  assert(missingForFive.includes(2), "phase 5 should require phase 3");
  assert(missingForFive.includes(3), "phase 5 should require phase 4");
}

function testCurrentStepCompletionReadiness() {
  wizardController.state.currentStep = 0;
  wizardController.state.phaseResults = { "fase-1": { answeredCount: 9, total: 9 } };
  wizardController.state.phaseAcknowledged = { "fase-1": false };
  assert(!wizardController.isCurrentStepCompletionReady(), "phase 1 should require acknowledgment");

  wizardController.state.phaseAcknowledged = { "fase-1": true };
  assert(wizardController.isCurrentStepCompletionReady(), "phase 1 should pass with 9/9 + ack");

  wizardController.state.currentStep = 1;
  wizardController.state.phaseAnswers = {
    "fase-2": {
      prompt_engineering: "familiar",
      output_critique: "familiar"
    }
  };
  wizardController.state.phaseSelections = {
    "fase-2": {
      archetypeId: "lean",
      proficiencyLevelId: "l1"
    }
  };
  wizardController.state.phaseResults = {
    "fase-2": { answeredCount: 2, total: 2 }
  };
  wizardController.state.phaseAcknowledged = { "fase-1": true, "fase-2": false };
  assert(!wizardController.isCurrentStepCompletionReady(), "phase 2 should require acknowledgment");

  wizardController.state.phaseAcknowledged["fase-2"] = true;
  assert(wizardController.isCurrentStepCompletionReady(), "phase 2 should pass with full gate");

  wizardController.state.currentStep = 2;
  wizardController.state.phaseResults["fase-3"] = { answeredCount: 5, total: 5 };
  wizardController.state.phaseSelections["fase-3"] = { mode: "squad" };
  wizardController.state.phaseReports = { "fase-3": { candidateName: "Squad X" } };
  wizardController.state.phaseAcknowledged["fase-3"] = false;
  assert(!wizardController.isCurrentStepCompletionReady(), "phase 3 should require acknowledgment");

  wizardController.state.phaseAcknowledged["fase-3"] = true;
  assert(wizardController.isCurrentStepCompletionReady(), "phase 3 should pass with full gate");

  wizardController.state.currentStep = 4;
  wizardController.state.phaseResults["fase-5"] = { valid: true, validation: { valid: true, missing: [] } };
  wizardController.state.phaseAcknowledged["fase-5"] = false;
  assert(!wizardController.isCurrentStepCompletionReady(), "phase 5 should require acknowledgment");
  wizardController.state.phaseAcknowledged["fase-5"] = true;
  assert(wizardController.isCurrentStepCompletionReady(), "phase 5 should pass with valid plan + ack");
}

function testQuestionTableRender() {
  const question = {
    id: "qx",
    block: "A",
    title: "Pergunta X",
    prompt: "Prompt X",
    impact: "Impact X",
    options: [
      { id: "low", label: "Baixo", score: 1, description: "Desc low" },
      { id: "medium", label: "Médio", score: 2, description: "Desc medium" },
      { id: "high", label: "Alto", score: 3, description: "Desc high" }
    ]
  };

  const html = wizardController.renderQuestionCard(question, "medium", 1);
  assert(html.includes("diagnosis-option-table"), "must render table class");
  assert(html.includes("<thead>"), "must render table head");
  assert(html.includes("<tbody>"), "must render table body");
  assert((html.match(/type=\"radio\"/g) || []).length === 3, "must render 3 radio inputs");
  assert(html.includes("td class=\"selected\""), "must mark selected column");
}

function testWizardBoundaries() {
  wizardController.state.currentStep = 0;
  wizardController.goBack();
  assert(wizardController.state.currentStep === 0, "back should stop at first step");

  wizardController.state.currentStep = WIZARD_STEPS.length - 1;
  wizardController.goNext();
  assert(
    wizardController.state.currentStep === WIZARD_STEPS.length - 1,
    "next should stop at last step"
  );
}

function testScrollTopOnNavigation() {
  context.window.scrollToCalls = [];
  wizardController.state.completedSteps = new Set([0, 1, 2, 3, 4, 5]);

  wizardController.state.currentStep = 0;
  wizardController.goNext();
  assert(context.window.scrollToCalls.length === 1, "must call scrollTo on next");
  assert(context.window.scrollToCalls[0].top === 0, "must scroll to top");

  wizardController.goToStep(2);
  assert(context.window.scrollToCalls.length === 2, "must call scrollTo on direct step navigation");
}

function testSectionVisibilityByPhase() {
  wizardController.applySectionVisibility("fase-2");
  assert(elements["#questionsSection"].attributes.hidden === "hidden", "phase 2 must hide questions section");
  assert(elements["#criteriaSection"].attributes.hidden === "hidden", "phase 2 must hide criteria section");

  wizardController.applySectionVisibility("fase-3");
  assert(elements["#questionsSection"].attributes.hidden === "hidden", "phase 3 must hide questions section");
  assert(!elements["#criteriaSection"].attributes.hidden, "phase 3 must keep criteria section visible");

  wizardController.applySectionVisibility("fase-4");
  assert(elements["#questionsSection"].attributes.hidden === "hidden", "phase 4 must hide questions section");
  assert(elements["#criteriaSection"].attributes.hidden === "hidden", "phase 4 must hide criteria section");

  wizardController.applySectionVisibility("fase-6");
  assert(!elements["#questionsSection"].attributes.hidden, "phase 6 must show questions section");
  assert(!elements["#criteriaSection"].attributes.hidden, "phase 6 must show criteria section");
}

async function testPhaseOneGateMessage() {
  wizardController.state.phaseAnswers = { "fase-1": {} };
  wizardController.state.phaseAcknowledged = { "fase-1": false };
  let message = await wizardController.buildPhaseOneGateMessage();
  assert(message.includes("Questões não respondidas"), "must list unanswered questions");
  assert(message.includes("Marque a confirmação"), "must ask for acknowledgment");

  wizardController.state.phaseAnswers = { "fase-1": { q1: "high", q2: "medium" } };
  wizardController.state.phaseAcknowledged = { "fase-1": false };
  message = await wizardController.buildPhaseOneGateMessage();
  assert(!message.includes("Questões não respondidas"), "must skip unanswered list when all are answered");
  assert(message.includes("Marque a confirmação"), "must keep acknowledgment guidance");
}

async function testPhaseFiveGateMessage() {
  wizardController.state.phaseResults = {
    "fase-5": {
      valid: false,
      validation: {
        valid: false,
        missing: ["Selecione um template de adoção.", "Selecione ao menos 1 critério de avanço em Deploy."]
      }
    }
  };
  wizardController.state.phaseAcknowledged = { "fase-5": false };
  const message = await wizardController.buildPhaseFiveGateMessage();
  assert(message.includes("Selecione um template de adoção"), "phase 5 gate must describe template missing");
  assert(message.includes("Marque a confirmação"), "phase 5 gate must require acknowledgment");
}

async function run() {
  const tests = [
    testMarkdownParse,
    testMarkdownParagraphFlow,
    testMarkdownTableParse,
    testMarkdownEscape,
    testExtractSectionsSemantic,
    testDiagnosisScoreAndBottleneck,
    testPhaseOneGate,
    testPhaseFourSanitizeAndPrioritization,
    testPhaseFourRoadmap,
    testPhaseFourGate,
    testPhaseTwoScoreAndGate,
    testPhaseThreeScoreAndGate,
    testPhaseFiveTemplateAndCalibration,
    testPhaseFiveValidationAndGate,
    testPhaseSixGovernancePack,
    testCanAccessStep,
    testMissingDependencies,
    testCurrentStepCompletionReadiness,
    testQuestionTableRender,
    testWizardBoundaries,
    testScrollTopOnNavigation,
    testPhaseOneGateMessage,
    testPhaseFiveGateMessage,
    testSectionVisibilityByPhase
  ];

  for (const testFn of tests) {
    await testFn();
  }

  console.log(`ok - ${tests.length} tests passed`);
}

run();
