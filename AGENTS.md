# AGENTS.md

Para decisões relacionadas a design, layout, cores, fontes e demais aspectos visuais, siga as diretrizes definidas em [DESIGN.md](DESIGN.md).

Todo o conteúdo deve ser escrito de forma clara, objetiva e em português do Brasil (pt-BR).

Os dados inseridos pelo usuário devem ser armazenados no `sessionStorage` do navegador, utilizando o prefixo de chave `ai-adoption-data-`.

Os dados devem ser salvos como um objeto JSON serializado.

O projeto deve ser desenvolvido como um site HTML no formato Wizard, com navegação passo a passo entre as fases do framework.

Cada fase do framework deve ser implementada como uma página HTML separada, respeitando a estrutura de pastas e arquivos definida no [README.md](README.md).

Toda tarefa exige algum tipo de validação aplicável ao tipo de mudança antes de ser considerada concluída.

Após cada commit, é obrigatório executar a validação de cenário via Playwright MCP/CLI.

A validação deve usar a URL adequada do ambiente: por padrão produção (`https://tiagocarmo.github.io/ai-adoption/`) e, quando aplicável, ambiente local correspondente para mudanças ainda não publicadas.

Um commit só é considerado concluído após a validação do cenário crítico sem erro.

Após validação aprovada (sem erro crítico), já pode seguir com `git add`, `git commit` e `git push` na branch atual, independentemente de qual seja.
Quando necessário, usar `gh` para autenticação e operações de GitHub (ex.: PR), mantendo o commit local no Git.

As mensagens de commit devem seguir obrigatoriamente o padrão Conventional Commits (`type(scope): description`):
https://www.conventionalcommits.org/en/v1.0.0/

Aprendizados de processo para validação:

- Para mudanças não publicadas, validar em ambiente local servido a partir de `public/` (ex.: `npx serve public -l 4173`) para evitar falso negativo de deploy desatualizado.
- Em validações Playwright MCP/CLI, aceitar como erro não crítico apenas `404` de `favicon.ico` quando não impactar o fluxo funcional validado.
- O fluxo mínimo de checagem antes de concluir trabalho é: `node tests/run-tests.js` + `npm run build` + cenário crítico E2E via Playwright MCP/CLI.
