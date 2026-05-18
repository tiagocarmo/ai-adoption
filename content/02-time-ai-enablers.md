# Fase 2 - Time AI Enablers

> "Antes de experimentar, defina quem é dono da jornada. Sem um responsável claro, pilotos nascem e morrem sem deixar rastro."

## Visão rápida

- **Pré-requisitos:** Fase 1 concluída
- **Tempo estimado:** ≤ 10 minutos
- **Conversão esperada:** ≥ 30% (Fase 1 → 2)
- **Conclusão esperada:** ≥ 70%

## Objetivo da fase

Define quem é o dono da jornada de adoção de IA antes de qualquer experimento começar.
Consolida o Time AI Enablers com papéis, responsabilidades e rituais — garantindo que o piloto
(Fase 3) tenha patrocínio, estrutura e um responsável por transformar aprendizados em
expansão. Dimensiona o time em um de 3 arquétipos baseados no tamanho da engenharia.

## Os 3 arquétipos de Time AI Enablers

### Lean

**Contexto:** Empresas pequenas · Sizing: 0,5–1 pessoa em part-time

#### Responsabilidades técnicas

- Avaliar e recomendar ferramentas de IA para o contexto do time.
- Criar guias de configuração e boas práticas de prompts.
- Monitorar qualidade do código gerado com assistência de IA.
- Definir guardrails mínimos de uso: o que pode e não pode ir em prompt, revisão obrigatória, dados sensíveis.
- Definir governança básica: política de ferramentas aprovadas, critério de revisão e owner das decisões.

#### Responsabilidades de processo

- Facilitar retrospectivas focadas em uso de IA mensalmente.
- Documentar casos de uso validados e lições aprendidas.
- Manter o backlog de experimentos de IA atualizado.

#### Responsabilidades de cultura

- Criar ambiente seguro para experimentação sem punição por falhas.
- Compartilhar aprendizados informalmente via canais de chat.
- Celebrar pequenas vitórias de adoção de IA com o time.
- Estabelecer Definition of Done que inclua critério mínimo de qualidade — o dev é dono dos testes do seu código, não QA.
- Introduzir o conceito de Shift Left: identificar problemas antes do merge, não depois do deploy.

#### Anti-responsabilidades

- Não é responsável por desenvolver features com IA no lugar de outros.
- Não centraliza todas as decisões de ferramentas de IA.
- Não substitui o papel de tech lead ou engineering manager.

#### Ritual principal

Check-in quinzenal de 30 min com o time completo para compartilhar aprendizados,
desbloquear impedimentos e ajustar prioridades de experimentação.

#### Métricas de saúde

- **Leading:** % do time usando IA semanalmente, # experimentos iniciados/mês, tempo médio de onboarding em nova ferramenta.
- **Lagging:** variação de velocity antes/depois, taxa de defeitos em código com IA.

#### Plano 30/60/90 dias

- **30d:** Escolher 1–2 ferramentas, onboarding de todo o time.
- **60d:** Documentar 2 casos de uso validados com ganho mensurável.
- **90d:** Revisar governança básica e critérios de expansão.

### Dedicado

**Contexto:** Empresas médias · Sizing: 2–3 pessoas dedicadas

#### Responsabilidades técnicas

- Avaliar, pilotar e standardizar ferramentas de IA em múltiplos times.
- Criar e manter biblioteca de prompts, templates e integrações internas.
- Definir critérios de qualidade para código assistido por IA e implementar gates no pipeline.
- Definir e manter guardrails formais priorizados por criticidade (CRÍTICA → ALTA → MÉDIA).
- Definir governança estruturada: políticas de uso, ciclos de revisão, compliance básico e processo de aprovação de novas ferramentas.
- Desenvolver infraestrutura compartilhada básica: MCPs internos para acesso padronizado a contexto e ferramentas da organização.

#### Responsabilidades de processo

- Facilitar cerimônias de adoção bi-semanais com representantes de cada squad.
- Gerenciar backlog de iniciativas de IA com priorização por impacto e esforço.
- Reportar métricas de adoção para liderança mensalmente.

#### Responsabilidades de cultura

- Treinar tech leads de todos os squads nas melhores práticas de uso de IA.
- Criar conteúdo interno (guias, videos curtos, demos ao vivo).
- Identificar e apoiar campeões de IA em cada squad.
- Implementar e disseminar Shift Left: quality gates em pre-commit e PR — nada chega em staging sem passar por testes e análise estática automáticos.
- Padronizar Definition of Done cross-squad com critérios de qualidade e cobertura mínima como requisito de merge.
- Promover cultura de "dev é dono da qualidade" — IA gera testes junto com o código, não depois.

#### Anti-responsabilidades

- Não é o único time que pode usar ou avaliar ferramentas de IA.
- Não substitui a autonomia técnica de cada squad.
- Não é responsável por resultados de produto dos outros times.

#### Rituais principais

- Weekly sync interno (30 min) para alinhamento do Time AI Enablers.
- Bi-weekly com representantes dos squads para disseminação de aprendizados.

#### Plano 30/60/90 dias

- **30d:** Mapa de maturidade de todos os squads + priorizar 3 iniciativas de alto impacto.
- **60d:** Pelo menos 50% dos squads com pelo menos 1 ferramenta de IA padronizada.
- **90d:** Relatório de impacto consolidado + roadmap de adoção para próximo trimestre.

### Distribuído

**Contexto:** Empresas grandes · Sizing: 4–6 pessoas centrais + 1 campeão por squad

#### Time central — responsabilidades

- Definir a estratégia e o roadmap de adoção de IA para toda a organização.
- Estabelecer e manter governança corporativa de IA: políticas, auditoria, ciclos de revisão e alinhamento regulatório.
- Definir e evoluir guardrails de segurança e compliance para toda a engenharia, com revisão contínua de riscos emergentes.
- Desenvolver e operar infraestrutura compartilhada avançada:
  - MCPs internos — servidores Model Context Protocol para expor dados, APIs e ferramentas internas aos agentes de IA de forma padronizada e segura.
  - Marketplace de skills — catálogo centralizado de prompts, agentes, templates e fluxos de IA validados e reutilizáveis pelos squads.
  - AI Harness — infraestrutura de orquestração, sandboxing e observabilidade para agentes de IA rodando em contexto produtivo.
- Treinar e apoiar os campeões de IA em cada squad.

#### Campeões de IA por squad

- Ser o ponto focal de adoção de IA no squad (não dedicação exclusiva).
- Adaptar as melhores práticas centrais ao contexto do squad.
- Reportar bloqueios e aprendizados ao time central mensalmente.

#### Anti-responsabilidades (time central)

- Não é um gargalo de aprovação para iniciativas de IA nos squads.
- Não é responsável pela execução técnica de IA em cada squad.
- Não substitui a liderança técnica local dos squads.

#### Plano 30/60/90 dias

- **30d:** Identificar e onboarding dos campeões de IA + mapa de maturidade por squad.
- **60d:** Framework de governança v1 publicado + pelo menos 30% dos squads com adoção ativa.
- **90d:** Plataforma interna de IA v1 + 60% dos squads com métricas de adoção reportando.

## Programa de capacitação contínua

O Time AI Enablers é o dono do programa de capacitação. Capability humana não é um evento
pontual — é fio condutor de todas as fases. A matriz abaixo define 4 níveis de proficiência e 4
áreas de competência que formam o currículo de AI fluency da organização.

## Matriz de 4 níveis de proficiência

| Nível | Característica | Critério prático | Gate de avanço |
| --- | --- | --- | --- |
| L0 · CURIOSO | Ouviu falar, ainda não usa IA sistematicamente | Não tem ferramenta configurada no fluxo diário | Obrigatório sair do L0 antes de usar IA em contexto produtivo |
| L1 · APLICADOR | Usa IA no fluxo diário com fluência básica | Pelo menos 1 ferramenta ativa; sabe estruturar prompts básicos e iterar | Gate de entrada para Fase 3 (Piloto): 100% do time piloto em ≥ L1 |
| L2 · CRÍTICO | Avalia output com senso crítico; sabe quando NÃO usar IA | Reverte sugestões ruins; identifica hallucinations; distingue uso seguro de arriscado | Gate para nível "team" na Fase 5: ≥ 60% do time em L2 por estágio |
| L3 · MULTIPLICADOR | Ensina, padroniza, audita o uso de IA nos outros | Cria templates de prompt, treina peers, define guidelines técnicas; campeão de squad | Meta de escala: ≥ 1 L3 por squad; ≥ 5% da engenharia total em L3 |

## 4 áreas de competência (currículo)

| Área | O que cobre | Exemplo de atividade formativa |
| --- | --- | --- |
| 1. Prompt Engineering & Colaboração | Como dialogar com IA, dar contexto, iterar, usar system prompts e templates | Workshop prático: reescrever prompts reais do time para melhorar qualidade de output |
| 2. Crítica de Output | Avaliar qualidade, identificar erros sutis, calibrar confiança por tipo de tarefa | Lab de "caça ao hallucination": exercícios com outputs propositalmente errados |
| 3. Segurança e Governança de Uso | Quando IA pode/não pode ser usada, dados sensíveis, PI, compliance, guardrails | Simulação de incidente: "O que você faria se a IA gerasse código com PII hard-coded?" |
| 4. Tooling Específico do Stack | Configuração, atalhos, integrações e boas práticas das ferramentas aprovadas | Sessão hands-on no editor com o setup padrão da organização |

## Modelo de aprendizado 70/20/10

### 70% · Experiencial

Prática real no fluxo de trabalho — usar IA em tasks reais do sprint, experimentar no contexto do próprio código.

### 20% · Social

Pair programming com IA, demos quinzenais de casos de uso, retros de aprendizado, office hours com campeões.

### 10% · Formal

Workshops estruturados, leituras curadas, assessments de proficiência, trilhas online de AI literacy.

Cadência de assessment: auto-avaliação trimestral com validação por par (peer review do nível declarado).
O campeão de squad (L3) é o validador local. Resultados publicados no heatmap de capability (Fase 7 · MET-A04).
