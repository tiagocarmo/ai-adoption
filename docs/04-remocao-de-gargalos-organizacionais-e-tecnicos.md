# Fase 4 - Remoção de Gargalos Organizacionais e Técnicos

> "A IA acelera um fluxo que já consegue evoluir. Se o fluxo não evolui, IA apenas amplifica o caos."

## Visão rápida

- **Pré-requisitos:** Fases 1, 2 e 3 · Todas obrigatórias
- **Tempo estimado:** ≤ 15 minutos
- **Conversão esperada:** ≥ 60% (Fase 3 → 4)
- **Diferencial:** Lista editável antes da geração

## Objetivo da fase

Consolida os gargalos identificados nas fases anteriores, prioriza-os por impacto, esforço e risco,
e gera um plano sequenciado em 3 trilhas com marcos relativos. O diferencial desta fase é que o
usuário pode editar a lista de gargalos antes da geração — adicionando, removendo ou ajustando
itens.

## Fórmula de priorização

`Score = (impacto × 3) + (esforço_inverso × 2) + (risco × 2)`

Cada variável é avaliada de 1 a 3. Esforço inverso: esforço baixo = 3, médio = 2, alto = 1.

- **Score máximo:** 15
- **Score mínimo:** 7
- **Crítico:** score ≥ 11
- **Médio:** score 7–10

## As 3 trilhas do plano

| Trilha Técnica | Trilha Organizacional | Trilha Cultura |
| --- | --- | --- |
| Débito técnico impedindo adoção de IA | Processos de aprovação lentos para adoção de ferramentas | Resistência ativa ou passiva à adoção de IA |
| Pipeline de CI/CD com automação insuficiente | Falta de ownership claro sobre iniciativas de IA | Medo de julgamento ao experimentar e errar com IA |
| Cobertura de testes abaixo do mínimo seguro | Ausência de estrutura dedicada (Time AI Enablers) | Ausência de reconhecimento para iniciativas de adoção |
| Ambiente de desenvolvimento instável ou não reproduzível | Roadmap instável que interrompe experimentos continuamente | Falta de capacidade técnica para avaliar output de IA |
| Arquitetura acoplada que dificulta integração de ferramentas | Dependências externas não gerenciadas que bloqueiam decisões | Comunicação deficiente sobre valor e objetivos da adoção |
| Ausência de observabilidade adequada em produção | Falta de patrocínio executivo claro para a iniciativa | Ausência de campeões de IA nos squads |

## Estrutura de milestones

| Marco | Foco | Critério de conclusão |
| --- | --- | --- |
| +30 dias | Itens críticos de maior impacto e menor esforço — as "vitórias rápidas" | Bloqueadores imediatos removidos; time consegue experimentar com IA sem impedimentos do dia a dia |
| +90 dias | Itens de médio esforço que criam infraestrutura para adoção sustentável | Base técnica e organizacional suficiente para expandir adoção além do time piloto |
| +180 dias | Itens estruturais de alto esforço que garantem escala e sustentabilidade de longo prazo | Organização operando com IA de forma sistemática, com governança e métricas estabelecidas |

## Gargalos típicos por dimensão (contexto para o diagnóstico)

| Dimensão | Gargalo típico (Baixo) | Gargalo típico (Médio) |
| --- | --- | --- |
| Autonomia | Baixa autonomia do time limita a capacidade de experimentação com IA sem aprovação constante, reduzindo o ritmo de adoção. | Autonomia parcial pode gerar inconsistência na adoção: algumas iniciativas avançam enquanto outras aguardam validação. |
| Cont. Delivery | Pipeline de entrega contínua não consolidado aumenta o lead time de mudanças e reduz a frequência de ciclos de feedback. | CD parcialmente implementado: pipelines existem mas sem automação completa de qualidade ou deploy zero-downtime. |
| Qualidade | Ausência de práticas sistemáticas de qualidade (testes automatizados, análise estática) amplia o risco de regressões durante a adoção de IA. | Cobertura de testes parcial: módulos críticos cobertos, mas gaps na automação reduzem a confiança nas mudanças geradas com assistência de IA. |
| Vel. Feedback | Ciclo de feedback lento (revisões de PR prolongadas, deploys manuais) compromete a velocidade de aprendizado com ferramentas de IA. | Feedback moderado: revisões realizadas, mas sem SLAs definidos, causando variabilidade no ritmo de entrega. |
| Ownership | Baixo senso de propriedade sobre componentes reduz a motivação para adotar IA de forma autônoma e responsável. | Ownership concentrado em alguns membros sênior; riscos de gargalo em revisões e decisões de arquitetura. |
| DX & Código | Experiência de desenvolvimento degradada (setup complexo, ambientes instáveis) reduz o ganho percebido das ferramentas de IA. | DX razoável, mas ainda com fricção em setup e onboarding que pode desacelerar a adoção por novos membros do time. |
| Senioridade | Time predominantemente júnior exige maior investimento em contexto e revisão para validar sugestões de IA de forma segura. | Seniority mista: membros experientes podem acelerar, mas a capacidade de revisão crítica das saídas de IA é limitada pela concentração sênior. |
| Flex. Org. | Rigidez organizacional (aprovações lentas, processos formais obrigatórios) limita a capacidade de experimentação e iteração rápida. | Flexibilidade parcial: processos ajustáveis em nível de time, mas dependências externas adicionam latência nas decisões. |
| Uso de IA | Uso atual de IA é inexistente ou individual, sem padronização. A adoção do time piloto parte do zero em termos de cultura e tooling. | IA já utilizada individualmente por alguns membros, mas sem padronização de ferramentas, prompts ou critérios de qualidade. |
