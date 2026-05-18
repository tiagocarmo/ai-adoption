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
  "#summaryTitle": createElement(),
  "#summaryContent": createElement(),
  "#goalsTitle": createElement(),
  "#goalsContent": createElement(),
  "#questionsTitle": createElement(),
  "#questionsContent": createElement(),
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
  window: {},
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

const { markdownService, wizardController, WIZARD_STEPS, diagnosisService } = context.window.AIAdoptionWizard;

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
  wizardController.state.phaseAcknowledged = { "fase-1": true, "fase-2": false };
  assert(!wizardController.isCurrentStepCompletionReady(), "phase 2 should require acknowledgment");

  wizardController.state.phaseAcknowledged["fase-2"] = true;
  assert(wizardController.isCurrentStepCompletionReady(), "phase 2 should pass with acknowledgment");
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

async function run() {
  const tests = [
    testMarkdownParse,
    testMarkdownParagraphFlow,
    testMarkdownTableParse,
    testMarkdownEscape,
    testExtractSectionsSemantic,
    testDiagnosisScoreAndBottleneck,
    testPhaseOneGate,
    testCanAccessStep,
    testMissingDependencies,
    testCurrentStepCompletionReadiness,
    testWizardBoundaries,
    testPhaseOneGateMessage
  ];

  for (const testFn of tests) {
    await testFn();
  }

  console.log(`ok - ${tests.length} tests passed`);
}

run();
