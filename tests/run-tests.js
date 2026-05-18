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
  "#summaryContent": createElement(),
  "#goalsContent": createElement(),
  "#questionsContent": createElement(),
  "#criteriaContent": createElement(),
  "#diagnosisInteractive": createElement(),
  "#backButton": createElement(),
  "#nextButton": createElement(),
  "#completeButton": createElement(),
  "#progressValue": createElement(),
  "#progressBarFill": createElement(),
  "#progressRing": createElement(),
  "#sidebarToggle": createElement(),
  "#sidebar": createElement()
};

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

elements["#stepsNav"].querySelectorAll = () => [];

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

function testExtractSectionsFallback() {
  const md = "# Fase\n\n## Objetivo da fase\nTexto objetivo\n\n## Perguntas\nTexto perguntas\n\n## Critérios\nTexto critérios";
  const sections = markdownService.extractStepSections(md);
  assert(sections.goals.includes("Texto objetivo"), "must extract goals section");
  assert(sections.questions.includes("Texto perguntas"), "must extract questions section");
  assert(sections.criteria.includes("Texto critérios"), "must extract criteria section");
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

function testWizardCompletion() {
  wizardController.state.currentStep = 2;
  wizardController.state.completedSteps = new Set();
  wizardController.markCurrentStepCompleted();
  assert(wizardController.state.completedSteps.has(2), "current step should be completed");
}

function run() {
  const tests = [
    testMarkdownParse,
    testMarkdownTableParse,
    testMarkdownEscape,
    testExtractSectionsFallback,
    testDiagnosisScoreAndBottleneck,
    testWizardBoundaries,
    testWizardCompletion
  ];

  for (const testFn of tests) {
    testFn();
  }

  console.log(`ok - ${tests.length} tests passed`);
}

run();
