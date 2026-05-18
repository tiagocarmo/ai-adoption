# Fase 5 - Adoção Progressiva de IA no Fluxo de Desenvolvimento

> "IA não se adota em um único movimento. Cada etapa do ciclo de desenvolvimento tem prontidão e impacto diferentes."

## Visão rápida

- **Pré-requisitos:** Fases 1, 2 e 4
- **Tempo estimado:** ≤ 12 minutos
- **Conversão esperada:** ≥ 65% (Fase 4 → 5)
- **Conclusão esperada:** ≥ 75%

## Objetivo da fase

Gera um playbook de adoção progressiva para os 6 estágios do SDLC. Para cada estágio, define
o nível de adoção recomendado (none → experimental → team → org), o workflow com
responsabilidades (ia/human/shared), anti-padrões e critérios de avanço.

## Templates de adoção (seleção determinística)

| Template | Quando é selecionado | Característica |
| --- | --- | --- |
| Conservador | `currentAiUsage == "none"` OU `overallLevel == "low"` | Começa pelos estágios de menor risco (testes e observabilidade). Prioriza qualidade sobre velocidade de adoção. |
| Balanceado | Caso padrão (não se encaixa em conservador nem agressivo) | Começa pela codificação. Avança em paralelo nos estágios de menor risco enquanto consolida os de maior impacto. |
| Agressivo | `currentAiUsage == "organization"` OU `overallLevel == "high"` | Adoção simultânea em múltiplos estágios (código, review e deploy primeiro). Para times com alta maturidade. |

## Os 4 níveis de adoção por estágio

| Nível | Definição | Característica |
| --- | --- | --- |
| `none` | IA não é usada neste estágio | Ponto de partida. Não significa que nunca será — apenas que ainda não é o momento para este estágio específico. |
| `experimental` | IA em uso por 1–2 pessoas, sem padrão definido | Fase exploratória. O objetivo é aprender, não escalar. Sem gate de qualidade obrigatório ainda. |
| `team` | IA adotada por todo o time com padrão mínimo definido | Adoção padronizada dentro do squad. Gates de qualidade ativos. Aprendizados documentados. |
| `org` | IA padronizada em toda a organização para este estágio | Replicação do padrão do time para todos os squads. Métricas de impacto medidas centralmente. |

## Os 6 estágios do SDLC

### 1. Planejamento

#### O que IA faz neste estágio

- Síntese de requisitos a partir de discussões e documentos.
- Geração de critérios de aceite e casos de borda.
- Estimativas de complexidade baseadas em histórico do repositório.
- Sugestões de decomposição de tarefas.

#### Anti-padrões

- Usar IA para substituir conversas de alinhamento com produto.
- Aceitar estimativas de IA sem validação com o time técnico.
- Delegar decisões de priorização para a IA.

#### Critérios de avanço

- Pelo menos 80% das tasks têm critérios de aceite gerados com IA revisados.
- Time reporta redução subjetiva de esforço no planejamento.
- Qualidade dos critérios de aceite melhorou (menos retrabalho por ambiguidade).

### 2. Codificação

#### O que IA faz neste estágio

- Autocompletar e geração de código inline (copilot mode).
- Geração de boilerplate, tipos e interfaces.
- Refatoração de código com contexto completo do arquivo.
- Explicação de código legado e sugestões de documentação.

#### Calibrações automáticas

- Se `dx_code == "low"`: limitar nível a `experimental` (código gerado requer revisão obrigatória).

#### Anti-padrões

- Aceitar código gerado sem revisão crítica do contexto de negócio.
- Usar IA para escrever código em áreas sem cobertura de testes.
- Ignorar sugestões de segurança em favor de velocidade.

#### Critérios de avanço

- Aumento mensurável de velocity (≥ 10%) sem degradação de qualidade.
- Time tem convenções documentadas para uso de IA no stack específico.
- Taxa de bugs em código com IA igual ou inferior ao código manual.

### 3. Code Review

#### O que IA faz neste estágio

- Revisão automática de PRs com comentários contextualizados.
- Identificação de bugs, vulnerabilidades e code smells.
- Sugestões de melhoria alinhadas às convenções do repositório.
- Geração de changelog e resumo do PR.

#### Calibrações automáticas

- Se `seniority == "low"`: limitar nível a `experimental` (revisão humana sênior obrigatória como gate).

#### Anti-padrões

- Substituir a revisão humana por revisão exclusiva de IA.
- Ignorar comentários de IA sem lê-los por considerar "ruído".
- Usar IA para aprovar PRs sem entender o contexto de negócio.

#### Critérios de avanço

- Redução de ≥ 20% no tempo médio de revisão de PRs.
- Comentários de IA identificando pelo menos 1 bug por semana que seria perdido.
- Revisores humanos relatam que IA melhora a qualidade da revisão.

### 4. Testes & Shift Left

#### O que IA faz neste estágio

- Geração automática de testes unitários para código existente.
- Identificação de casos de borda não cobertos.
- Geração de testes E2E a partir de critérios de aceite.
- Análise de cobertura e priorização de quais testes criar.

#### Como IA habilita Shift Left

Shift Left = detectar problemas o mais cedo possível — antes do commit, não depois do deploy.
IA torna Shift Left economicamente viável ao reduzir o custo de escrever testes e de fazer review:

- No editor (pre-commit): Copilot/Cursor sugerem testes junto com o código que está sendo escrito — o teste existe antes do PR existir.
- No PR (pre-merge): CodeRabbit e similares fazem code review automático e identificam ausência de testes antes do merge — nenhum PR sem cobertura adequada passa.
- Casos de borda em tempo real: IA identifica edge cases que o dev não considerou enquanto escreve — não depois que o bug chegou em produção.
- Análise estática acelerada: IA prioriza o que reforçar no CI — não é mais viável ignorar coverage por falta de tempo.

#### Calibrações automáticas

- Se `quality == "low"`: limitar nível a `experimental` — testes gerados por IA passam por revisão obrigatória antes de entrar no CI. Shift Left não se implementa sem base de testes prévia.

#### Anti-padrões

- Aceitar testes gerados por IA sem revisar se testam o comportamento correto.
- Usar testes de IA para inflar cobertura sem valor real.
- Ignorar casos de borda identificados pela IA por serem "edge cases raros".
- Continuar com o modelo de QA ao final do sprint enquanto IA gera testes — IA não substitui o processo Shift Left, ela o acelera.
- Tratar Shift Left como iniciativa de ferramental, não de cultura — se o dev não se sente dono da qualidade, nenhuma ferramenta resolve.

#### Critérios de avanço

- Cobertura de testes aumentou ≥ 15% nos módulos onde IA foi usada.
- ≥ 50% dos PRs chegam ao review já com testes gerados por IA (Shift Left ativo).
- Quality gate no pre-commit ou CI bloqueando merge com cobertura abaixo do mínimo definido no DoD.
- Testes gerados por IA têm taxa de falso-positivo inferior a 10%.

### 5. Deploy

#### O que IA faz neste estágio

- Análise de risco de deploy baseada no diff e histórico de incidentes.
- Sugestão de estratégia de deploy (canary, blue-green, feature flags).
- Geração automática de runbook de rollback.
- Validação de configurações de infraestrutura antes do deploy.

#### Calibrações automáticas

- Se `continuous_delivery == "low"`: manter nível em `none` (pré-condição: CD automatizado primeiro).

#### Anti-padrões

- Usar IA para automatizar deploy sem revisão humana em deploys de alto risco.
- Ignorar avisos de risco de IA por pressão de prazo.
- Confiar em runbooks gerados por IA sem testar o rollback.

#### Critérios de avanço

- Redução de ≥ 30% nos deploys que requerem rollback.
- Análise de risco de IA usada em 100% dos deploys para produção.
- Runbooks de rollback gerados e testados para os 5 principais serviços.

### 6. Observabilidade

#### O que IA faz neste estágio

- Detecção automática de anomalias em métricas e logs.
- Análise de causa raiz assistida em incidentes.
- Geração de dashboards e alertas baseados em padrões históricos.
- Correlação automática de eventos entre serviços.

#### Anti-padrões

- Usar IA para reduzir o número de alertas sem entender o porquê.
- Confiar em causa raiz sugerida por IA sem validação humana.
- Ignorar anomalias detectadas por IA por considerar "falso positivo" sem investigar.

#### Critérios de avanço

- MTTR (mean time to recover) reduzido em ≥ 25% com IA.
- Pelo menos 3 incidentes detectados por IA antes de impacto ao usuário.
- Time usa análise de causa raiz de IA como ponto de partida em 100% dos incidentes P1/P2.
