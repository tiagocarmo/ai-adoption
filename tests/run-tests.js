const fs = require("fs");
const vm = require("vm");

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
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    getAttribute(key) {
      return this.attributes[key];
    }
  };
}

const elements = {
  "#stepKicker": createElement(),
  "#stepTitle": createElement(),
  "#stepsNav": {
    ...createElement(),
    querySelectorAll() {
      return [];
    }
  },
  "#summaryContent": createElement(),
  "#goalsContent": createElement(),
  "#questionsContent": createElement(),
  "#criteriaContent": createElement(),
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
  fetch: async () => ({
    ok: true,
    text: async () => "# title"
  })
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

const { markdownService, wizardController, WIZARD_STEPS } = context.window.AIAdoptionWizard;

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
    testMarkdownEscape,
    testExtractSectionsFallback,
    testWizardBoundaries,
    testWizardCompletion
  ];

  for (const testFn of tests) {
    testFn();
  }

  console.log(`ok - ${tests.length} tests passed`);
}

run();
