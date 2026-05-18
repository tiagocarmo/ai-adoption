# Fase 3 - Definição do Time Piloto

> "O primeiro piloto deve ser feito no ambiente com maior probabilidade de sucesso — não no mais crítico, mais visível ou mais problemático."

## Visão rápida

- **Pré-requisitos:** Fases 1 e 2 concluídas
- **Tempo estimado:** ≤ 12 minutos
- **Conversão esperada:** ≥ 50% (Fase 2 → 3)
- **Conclusão esperada:** ≥ 65%

## Objetivo da fase

Com o Time AI Enablers formado e o dono da jornada definido, esta fase seleciona qual squad de
produto vai ser o primeiro a experimentar IA em contexto real de produção. Avalia prontidão do
time candidato e gera um plano operacional completo para o ciclo piloto.

## Dimensões avaliadas (scoring ponderado)

O formulário coleta dados sobre 5 dimensões do time candidato ao piloto. Autonomia,
Senioridade e Velocidade de Feedback têm peso 2× (mais determinantes para o sucesso do
piloto). Segurança psicológica e estabilidade de roadmap têm peso 1×. Score total ÷ 8 = score de
prontidão (mesmos thresholds da Fase 1).

| Dimensão | Peso | Pergunta avaliada |
| --- | --- | --- |
| Autonomia Técnica | 2× | O time candidato pode tomar decisões técnicas e experimentar ferramentas sem aprovações externas ao squad? |
| Senioridade | 2× | O time tem engenheiros sêniores capazes de avaliar criticamente o output da IA e orientar adoção responsável? |
| Velocidade de Feedback | 2× | O pipeline de CI/CD do time permite ciclos de feedback rápidos (<10 min) e deploys frequentes? |
| Segurança Psicológica | 1× | O time se sente seguro para experimentar, cometer erros e reportar problemas sem medo de julgamento? |
| Estabilidade de Roadmap | 1× | O roadmap do time tem estabilidade suficiente para dedicar capacidade ao piloto sem interrupções frequentes? |

## Exemplos de ferramentas de IA por categoria

Lista ilustrativa — não exaustiva e não endossada. O mercado de ferramentas de IA evolui rápido; use como
ponto de partida para avaliação, não como lista definitiva. Critério de seleção para o piloto deve considerar
stack, contexto de segurança e maturidade do time.

| Ferramenta | Categoria | Descrição e indicação |
| --- | --- | --- |
| GitHub Copilot | CODIFICAÇÃO | Autocompletar e geração de código inline no editor. Prioritário para times com baixo DX ou feedback_speed. |
| Cursor | CODIFICAÇÃO | IDE com IA integrada para edição conversacional de código. Prioritário para times com baixo DX ou autonomia. |
| Amazon Q Developer | CODIFICAÇÃO | Assistente de código AWS-nativo com integração a repositórios. Indicado para stacks AWS. |
| Codeium | CODIFICAÇÃO | Autocompletar gratuito compatível com múltiplos IDEs. Boa opção de entrada sem custo. |
| CodeRabbit | REVISÃO | Revisão automática de PRs com sugestões contextualizadas. Prioritário para times com baixa velocidade de feedback ou qualidade. |
| Notion AI | PLANEJAMENTO | Síntese e geração de documentação técnica assistida. Indicado para times com baixo ownership ou org_flexibility. |
| Linear | PLANEJAMENTO | Gestão de projetos com triagem e priorização assistidas. Indicado para times com baixa autonomia ou org_flexibility. |
| Playwright + AI Codegen | TESTES | Geração automática de testes E2E via gravação e IA. Prioritário para times com baixa qualidade ou continuous delivery. |
| Testim | TESTES | Testes funcionais com manutenção autoadaptativa por IA. Indicado para times com baixa maturidade de qualidade. |
| Datadog AI Insights | MONITORAMENTO | Detecção de anomalias e análise de causa raiz assistida. Prioritário para times com baixo feedback_speed ou continuous delivery. |

## Métricas de sucesso do piloto (por nível de prontidão)

Baseado em: MIT/Microsoft/Accenture RCT (4.867 devs, 2025) · Jellyfish (146k tickets) · McKinsey AI
Software (2025) · DORA State of AI 2025. Atenção: DORA 2025 confirma que IA é amplificador — times
sem qualidade e testes sólidos registraram aumento de bugs com IA. Métricas de nível baixo priorizam
adoção segura antes de velocity.

| BAIXO — FOCO EM ADOÇÃO E SEGURANÇA | MÉDIO — FOCO EM TEMPO E QUALIDADE | ALTO — FOCO EM OUTCOMES |
| --- | --- | --- |
| ≥ 80% dos membros usando ao menos 1 ferramenta de IA ativamente após 4 semanas (benchmark Accenture: 80%+ de adoção) | Redução de 20% no tempo de revisão de PRs em relação ao baseline (benchmark Jellyfish: -26% PR review time) | Aumento de 25% em tasks completadas por sprint em relação ao baseline (benchmark MIT: +26% completed tasks) |
| ≥ 70% do time relata confiança no código gerado por IA após revisão (DORA 2025: 30% ainda não confiam — construir confiança é pré-condição) | Redução de 15% no coding time em tarefas cobertas por IA (benchmark Jellyfish: -20% coding time) | Redução de 20% em defeitos reportados por cliente ou QA nos módulos do piloto (benchmark McKinsey top performers: -20–30% defects) |
| Zero incidentes de produção causados diretamente por código gerado por IA sem revisão adequada | Taxa de bugs em código com IA igual ou inferior ao código manual — ausência de regressão de qualidade (alerta: Uplevel registrou +41% bugs sem guardrails) | Pelo menos 3 estágios do SDLC com IA no nível "team" e métricas de impacto documentadas |
| Processo de revisão obrigatória de código gerado por IA documentado e seguido por 100% do time | Pelo menos 2 casos de uso documentados com ganho mensurável e reproduzível | DORA baseline estabelecido e ao menos 1 métrica (deployment frequency ou change failure rate) com melhora mensurável |
| Satisfação do time com ferramentas de IA ≥ 7/10 após 8 semanas (Accenture: 90% maior satisfação, 95% curtem mais programar) | Guia interno de boas práticas de prompt publicado e adotado por ≥ 80% do time | Piloto documentado e apresentado a ao menos 1 squad candidato à expansão — playbook validado e reutilizável |

## Gate de capability (pré-requisito de entrada)

Antes de iniciar o piloto, 100% dos membros do time selecionado devem atingir L1 · APLICADOR. O
Time AI Enablers (Fase 2) coordena o onboarding de capacitação antes do kickoff — o piloto não
começa com ninguém em L0.

## Critérios de expansão além do piloto (por nível de prontidão)

| BAIXO | MÉDIO | ALTO |
| --- | --- | --- |
| Todos os membros do time piloto completaram onboarding nas ferramentas de IA e conseguem usá-las de forma independente | Pelo menos 2 fluxos de desenvolvimento com IA estão documentados com métricas de ganho | Todos os critérios de sucesso do piloto atingidos e documentados com dados |
| Pelo menos 1 processo de revisão de código gerado por IA está documentado e sendo seguido consistentemente | Time piloto atingiu as metas de velocity e qualidade definidas no início do piloto | Time piloto capaz de integrar, avaliar e padronizar novas ferramentas de IA de forma autônoma |
| Nenhum incidente de produção causado por adoção de IA não supervisionada nos últimos 30 dias | Pelo menos 1 membro sênior do time piloto preparado para liderar adoção em outro time | Governança básica de uso de IA definida (critérios de qualidade, revisão obrigatória, casos de uso aprovados) |
| Liderança técnica do time piloto capaz de treinar ao menos 1 outro time nas práticas adotadas | Playbook de adoção de IA revisado e validado pelo time antes da expansão | Ao menos 1 apresentação interna realizada com resultados do piloto para candidatos à expansão |
