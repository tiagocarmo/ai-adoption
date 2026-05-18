# AGENTS.md

Para decisões relacionadas a design, layout, cores, fontes e demais aspectos visuais, siga as diretrizes definidas em [DESIGN.md](DESIGN.md).

Todo o conteúdo deve ser escrito de forma clara, objetiva e em português do Brasil (pt-BR).

Os dados inseridos pelo usuário devem ser armazenados no `sessionStorage` do navegador, utilizando o prefixo de chave `ai-adoption-data-`.

Os dados devem ser salvos como um objeto JSON serializado.

O projeto deve ser desenvolvido como um site HTML no formato Wizard, com navegação passo a passo entre as fases do framework.

Cada fase do framework deve ser implementada como uma página HTML separada, respeitando a estrutura de pastas e arquivos definida no [README.md](README.md).

Após cada commit, é obrigatório executar a validação de cenário via Playwright MCP/CLI.

A validação deve usar a URL adequada do ambiente: por padrão produção (`https://tiagocarmo.github.io/ai-adoption/`) e, quando aplicável, ambiente local correspondente para mudanças ainda não publicadas.

Um commit só é considerado concluído após a validação do cenário crítico sem erro.
