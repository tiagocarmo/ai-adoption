# Fase 7 - Escala Organizacional

> "Escalar não é replicar o piloto. É codificar o que aprendeu, sequenciar quem adota, e medir o que importa."

## Visão rápida

- **Pré-requisitos:** Fases 1, 2, 5 e 6 · Fases 3 e 4 opcionais
- **Tempo estimado:** ≤ 18 minutos
- **Conversão esperada:** ≥ 50% (Fase 6 → 7)
- **Conclusão esperada:** ≥ 75%

## Objetivo da fase

Expande a adoção de IA para todas as equipes de engenharia, operacionalizando a estrutura de
governança e os aprendizados das fases anteriores para gerar impacto organizacional amplo e
sustentável. A conclusão desta fase marca o ciclo completo do framework.

## Plano de rollout em ondas (determinístico por tamanho)

| Tamanho da engenharia | Nº de ondas | Duração sugerida por onda | Estratégia |
| --- | --- | --- | --- |
| 1–9 engenheiros | 1 onda | 4–6 semanas | Adoção simultânea de todo o time. Piloto e escala são a mesma fase. |
| 10–29 engenheiros | 2 ondas | 6–8 semanas cada | Onda 1: 50% do time (squads mais maduros). Onda 2: restante com playbook documentado da onda 1. |
| 30–99 engenheiros | 3 ondas | 8 semanas cada | Onda 1: time piloto + 1 squad adjacente. Ondas 2–3: rollout por afinidade técnica e disponibilidade de campeões. |
| 100–299 engenheiros | 4 ondas | 6–10 semanas cada | Onda 1: squads com campeões de IA formados. Ondas subsequentes: rollout por vertical de produto. |
| 300+ engenheiros | 5 ondas | 8–12 semanas cada | Ondas por business unit ou domínio. Requer estrutura de campeões por squad e plataforma interna de IA. |

## 11 métricas em 3 camadas

| Camada | Código | Métrica | Descrição e meta |
| --- | --- | --- | --- |
| Adoção | MET-A01 | % de engenheiros usando IA semanalmente | Proporção de engenheiros que usaram pelo menos uma ferramenta de IA em tarefas de desenvolvimento na semana. Meta progressiva: 25% → 50% → 80%. |
| Adoção | MET-A02 | Número de ferramentas de IA ativas | Quantidade de ferramentas de IA aprovadas e em uso ativo na organização. Indica profundidade da adoção além de um único ponto de entrada. |
| Adoção | MET-A03 | Taxa de adoção por squad | Proporção de squads com pelo menos 1 ferramenta de IA padronizada e em uso por toda a equipe. Meta: 100% dos squads ao final da última onda. |
| Adoção | MET-A04 | Distribuição de proficiência (Capability Heatmap) | Proporção da engenharia em cada nível da matriz: L0 / L1 / L2 / L3. Meta ao completar escala: <10% em L0 · ≥60% em L1+ · ≥20% em L2+ · ≥5% em L3 (1 multiplicador por squad). Publicado por squad trimestralmente. |
| Adoção | MET-A05 | Tempo para atingir L1 em novos engenheiros | Tempo médio para um engenheiro novo na organização atingir o nível L1 · Aplicador a partir do onboarding. Meta: <4 semanas. Indica eficácia do programa de capacitação e velocidade de integração de novos membros. |
| Engajamento | MET-E01 | % do SDLC coberto por IA | Proporção dos 6 estágios do SDLC com nível de adoção ≥ "team" na organização. Indica profundidade de integração no fluxo de desenvolvimento. |
| Engajamento | MET-E02 | Sessões de IA por engenheiro por semana | Número médio de sessões de interação com ferramentas de IA por engenheiro por semana. Indica qualidade e profundidade do uso, não apenas adoção superficial. |
| Engajamento | MET-E03 | % de PRs com revisão assistida por IA | Proporção de pull requests que passam por revisão automática de IA antes de revisão humana. Indicador de integração no fluxo de qualidade. |
| Impacto (DORA + negócio) | MET-I01 | Variação no cycle time | Delta percentual no tempo médio de commit a deploy após adoção de IA em relação ao baseline. Métrica DORA de deployment frequency indireta. |
| Impacto (DORA + negócio) | MET-I02 | Variação na taxa de bugs | Delta percentual na taxa de bugs reportados em produção após adoção de IA. Métrica DORA de change failure rate indireta. |
| Impacto (DORA + negócio) | MET-I03 | Variação nas métricas DORA | Variação consolidada nas 4 métricas DORA (deployment frequency, lead time, change failure rate, MTTR) antes e depois da adoção completa de IA. |

## 3 cerimônias recorrentes

| Cerimônia | Frequência | Participantes | Objetivo |
| --- | --- | --- | --- |
| Weekly Sync | Semanal · 30 min | Time central de adoção de IA | Revisar métricas da semana, desbloquear impedimentos, alinhar prioridades da próxima onda |
| Campeões Champions | Quinzenal · 45 min | Time central + campeões de IA por squad | Compartilhar aprendizados entre squads, alinhar boas práticas, identificar casos de uso replicáveis |
| Retro de Adoção | Mensal · 60 min | Time central + liderança técnica | Avaliar progresso das métricas, ajustar estratégia de rollout, comunicar resultados para a organização |

## 8 riscos de escala e mitigações

### RISK-S01 — Big-bang rollout

- Mitigação: Implementar rollout em ondas com critérios de entrada explícitos para cada onda. Nunca avançar para a próxima onda sem métricas de sucesso da onda anterior.

### RISK-S02 — Potemkin AI (adoção superficial)

- Mitigação: Medir engajamento qualitativo (sessões/semana, profundidade de uso) além de adoção binária. Revisitar squads com métricas de adoção altas mas impacto baixo.

### RISK-S03 — Sobrecarga do Time AI Enablers

- Mitigação: Limitar o número de squads em onboarding simultâneo ao capacity do Time AI Enablers. Usar modelo de campeões para distribuir carga de suporte.

### RISK-S04 — Perda de conhecimento entre ondas

- Mitigação: Documentar playbook de cada onda antes de iniciar a próxima. Campeões da onda anterior tornam-se mentores da próxima onda.

### RISK-S05 — Resistência sênior

- Mitigação: Envolver engenheiros sêniores no design do processo desde o início. Demonstrar como IA amplifica (não substitui) capacidade técnica avançada.

### RISK-S06 — Proliferação de ferramentas (tool sprawl)

- Mitigação: Processo de aprovação centralizado para novas ferramentas. Revisão trimestral do portfólio de ferramentas aprovadas com descontinuação de ferramentas de baixo uso.

### RISK-S07 — Governança insuficiente para escala

- Mitigação: Verificar que a Fase 6 está completa antes de iniciar a Fase 7. Escalar o processo de revisão de segurança e compliance antes de aumentar o número de ferramentas aprovadas.

### RISK-S08 — Regressão pós-conclusão

- Mitigação: Manter as cerimônias recorrentes mesmo após o framework "concluído". Tratar adoção de IA como prática contínua, não projeto com fim definido.

## 5 critérios de conclusão do framework

- ≥ 80% dos engenheiros da organização usando pelo menos uma ferramenta de IA semanalmente.
- Todos os squads com pelo menos 2 estágios do SDLC com IA no nível "team" ou superior.
- Framework de governança v1 publicado, comunicado e com processo de revisão ativo.
- Métricas DORA com melhora mensurável em relação ao baseline pré-framework.
- Pelo menos 1 ciclo completo de retro de adoção realizado com liderança técnica e resultados documentados.
