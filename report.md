# Auditoria Guia Oficial vs AI Adoption Wizard

## Resumo executivo

Data da auditoria: 18 de maio de 2026  
Fonte oficial auditada: https://ai-adoption.techleads.club/framework/guia  
Aplicação auditada: AI Adoption Wizard local em `http://localhost:4173`

O AI Adoption Wizard implementa a espinha dorsal do guia oficial e entrega uma experiência mais interativa do que o documento original: há navegação guiada, gates por fase, persistência em `sessionStorage`, cálculos automáticos, geração de relatórios por fase e exportação consolidada em JSON.

A cobertura geral é boa, mas ainda não é possível afirmar que todo o conteúdo do guia oficial está validado como equivalente na experiência interativa. As principais lacunas estão na Fase 7, onde o conteúdo textual local mantém o material amplo, mas o JSON usado pela experiência interativa expõe apenas parte das métricas e riscos do guia. Há também perdas de rastreabilidade em algumas fases porque parte do conteúdo estratégico aparece como texto, mas não entra como campo estruturado no relatório/exportação.

Status geral: `Parcial`, com forte base implementada e lacunas concentradas em profundidade estruturada, principalmente na Fase 7.

## Metodologia de validação

- O guia oficial foi aberto via Playwright CLI. A página apresentou modal de captura de dados, mas o conteúdo do guia estava disponível no DOM e pôde ser inspecionado.
- Foi feita inspeção da fonte oficial publicada, incluindo as 7 fases, seções avançadas de governança, AI Security Posture, OWASP LLM Top 10, MCP Security e Marketplace de skills.
- Foram revisados os arquivos locais `content/*.md`, `content/*.json`, `script.js`, `README.md` e `interpretacao-json.md`.
- O wizard local foi navegado com Playwright CLI, com preenchimento determinístico das 7 fases, confirmação de entendimento, conclusão de cada gate e exportação do JSON consolidado.
- A validação funcional confirmou: 7 fases concluídas, progresso 100%, `phase7Answered = 6`, `hasPlan = true` e download do arquivo `ai-adoption-export-2026-05-18T18-42-16Z.json`.
- Nas requests do fluxo local, todos os arquivos Markdown e JSON das 7 fases foram carregados com HTTP 200. O único erro observado anteriormente foi `404` de `favicon.ico`, considerado não crítico pelas regras do projeto.

## Matriz geral de cobertura

| Área | Status | Evidência | Avaliação |
| --- | --- | --- | --- |
| Jornada de 7 fases | Coberto com melhoria interativa | `WIZARD_STEPS`, sidebar, gates e progresso | O wizard transforma o mapa do guia em navegação sequencial operacional. |
| Conteúdo base por fase | Coberto | `content/*.md` | Os arquivos Markdown preservam a maioria das seções oficiais por fase. |
| Diagnóstico de 9 dimensões | Coberto com melhoria interativa | Fase 1 JSON + UI de radio buttons + score | O guia é convertido em diagnóstico preenchível com score, bandas e gargalo. |
| Time AI Enablers | Coberto com melhoria interativa | Fase 2 JSON + arquétipo + competências + proficiência | A fase vira avaliação prática de readiness, com recomendações. |
| Time Piloto | Coberto com melhoria interativa | Fase 3 JSON + formulário por modo + relatório executivo | A seleção do piloto é operacionalizada com scoring ponderado e checklist. |
| Remoção de gargalos | Coberto com melhoria interativa | Fase 4 JSON + backlog editável + roadmap | O plano 30/90/180 é uma melhoria clara sobre o texto estático. |
| Adoção progressiva no SDLC | Coberto com melhoria interativa | Fase 5 JSON + matriz de estágios + critérios | A fase vira playbook editável por estágio, com calibração automática. |
| Governança e padronização | Parcial | Fase 6 MD amplo + JSON estruturado menor | O conteúdo avançado existe no Markdown, mas o pacote gerado não estrutura tudo. |
| Escala organizacional | Parcial | Fase 7 MD amplo + JSON reduzido | A experiência interativa não inclui todas as métricas e riscos descritos no guia/local Markdown. |
| Exportação consolidada | Coberto com melhoria interativa | `exportService`, `interpretacao-json.md`, JSON baixado | A exportação é um diferencial sobre o guia oficial. |

## Avaliação fase a fase

### Fase 1 - Diagnóstico Organizacional e de Engenharia

Status: `Coberto com melhoria interativa`

O que está bom:

- As 9 perguntas, os 3 macro-blocos, a metodologia de pontuação e as recomendações por dimensão estão presentes.
- O wizard calcula score médio, banda de maturidade e gargalo principal automaticamente.
- O desempate por prioridade de impacto está implementado no serviço de diagnóstico.
- O preenchimento real via navegador validou o gate da fase e a persistência no estado.

Igual ao guia:

- Estrutura de pontuação baixo/médio/alto.
- Macro-blocos Cultura & Autonomia, Maturidade Operacional e Capacidade Técnica & IA.
- Perguntas, impacto e recomendações por dimensão.

Ruim ou incompleto:

- Não há lacuna crítica nesta fase.
- A tabela textual original aparece duplicada parcialmente: como conteúdo Markdown e como formulário interativo. Isso não quebra o fluxo, mas pode alongar a página.

### Fase 2 - Time AI Enablers

Status: `Coberto com melhoria interativa`

O que está bom:

- Os 3 arquétipos estão representados: Lean, Dedicado e Distribuído.
- A fase adiciona diagnóstico de competências, nível de proficiência, score combinado, risco e direcionamento para a Fase 3.
- A matriz de proficiência L0-L3 e o programa de capacitação aparecem no conteúdo.
- A experiência interativa ajuda a transformar a escolha do modelo de condução em decisão explícita.

Igual ao guia:

- Responsabilidades técnicas, de processo e cultura.
- Anti-responsabilidades.
- Rituais, métricas e planos 30/60/90.
- Currículo de competências e modelo 70/20/10.

Ruim ou incompleto:

- O relatório da fase resume lacunas e plano, mas não exporta uma decomposição completa das responsabilidades do arquétipo escolhido.
- A experiência usa recomendações sintéticas por lacuna; seria melhor registrar também o conjunto completo de responsabilidades selecionadas.

### Fase 3 - Definição do Time Piloto

Status: `Coberto com melhoria interativa`

O que está bom:

- A fase implementa seleção por modo: squad, indivíduos ou gestão.
- O scoring ponderado das 5 dimensões está implementado.
- O relatório executivo inclui candidato, racional, score, gargalo, ferramentas, métricas, checklist e critérios de expansão.
- O gate exige seleção válida, respostas completas, relatório gerado e confirmação.

Igual ao guia:

- Dimensões de prontidão e pesos.
- Exemplos de ferramentas por categoria.
- Métricas de sucesso por nível.
- Gate de capability e critérios de expansão.

Ruim ou incompleto:

- A lista de ferramentas no JSON interativo é menor que a tabela textual do guia. A experiência recomenda bem, mas não representa toda a tabela como catálogo estruturado.

### Fase 4 - Remoção de Gargalos Organizacionais e Técnicos

Status: `Coberto com melhoria interativa`

O que está bom:

- A fase implementa o maior ganho de interatividade: backlog editável, sanitização, deduplicação, scoring e plano 30/90/180.
- O backlog inicial usa inferência de dados upstream quando disponível.
- O gate exige ao menos um gargalo por trilha, ausência de itens inválidos e roadmap gerado.

Igual ao guia:

- Fórmula de priorização.
- 3 trilhas: técnica, organizacional e cultura.
- Marcos +30, +90 e +180 dias.
- Gargalos típicos por dimensão.

Ruim ou incompleto:

- O relatório/exportação poderia registrar melhor a origem de cada gargalo: inferido da Fase 1, inferido da Fase 3 ou criado manualmente.

### Fase 5 - Adoção Progressiva de IA no Fluxo de Desenvolvimento

Status: `Coberto com melhoria interativa`

O que está bom:

- Templates conservador, balanceado e agressivo estão implementados com seleção determinística.
- Os 4 níveis de adoção e 6 estágios do SDLC estão presentes.
- Há calibrações automáticas por risco operacional, incluindo limites para codificação, review, testes e deploy.
- O gate exige critérios de avanço em todos os estágios.

Igual ao guia:

- Estágios do SDLC.
- Anti-padrões e critérios de avanço.
- Calibrações automáticas por sinais de maturidade.
- Responsabilidade `ia`, `human` e `shared`.

Ruim ou incompleto:

- A experiência estrutura bem critérios e anti-padrões, mas a exportação registra índices selecionados em vez do texto completo dos critérios, o que reduz legibilidade fora do app.

### Fase 6 - Governança e Padronização

Status: `Parcial`

O que está bom:

- O Markdown local cobre as 9 políticas, 7 padrões técnicos, guardrails, processo de revisão em 5 etapas, AI Security Posture, OWASP LLM Top 10, MCP Security, gateway centralizado e Marketplace de skills.
- O JSON interativo cobre 6 perguntas contextuais, owners das 9 políticas, 7 padrões técnicos e guardrails por criticidade.
- O pacote gerado recomenda modelo de condução, controles mandatórios e roadmap 30/60/90.
- A lógica inclui controles adicionais quando há uso agentic ou MCP.

Igual ao guia:

- Estrutura de políticas e padrões.
- Owners e cadência de revisão.
- Guardrails críticos, altos e médios.
- Controles de MCP aparecem como orientação textual e controle mandatário condicional.

Ruim ou incompleto:

- O conteúdo avançado de AI Security Posture, OWASP LLM Top 10, MCP Security completo, gateway e marketplace está no Markdown, mas não entra de forma estruturada no pacote gerado nem no questionário.
- O relatório gerado não lista o processo de revisão em 5 etapas.
- O relatório gerado não explicita os controles OWASP por risco, apenas resume guardrails e controles mandatórios.

### Fase 7 - Escala Organizacional

Status: `Parcial`

O que está bom:

- A fase implementa questionário de contexto, score, plano de ondas, cerimônias, riscos, critérios de conclusão e exportação consolidada.
- O fluxo validado no navegador concluiu a fase, gerou plano e liberou o botão de exportação.
- O rollout por tamanho de engenharia está estruturado no JSON.

Igual ao guia:

- Plano de rollout em ondas.
- Cerimônias recorrentes.
- Critérios finais de conclusão.
- Parte das métricas e parte dos riscos aparecem na experiência interativa.

Ruim ou incompleto:

- O Markdown local descreve 11 métricas na seção chamada "9 métricas em 3 camadas"; o JSON interativo expõe apenas 6: `MET-A01`, `MET-A03`, `MET-A04`, `MET-E01`, `MET-E03`, `MET-I03`.
- O Markdown local descreve 8 riscos de escala; o JSON interativo expõe apenas 4: `RISK-S01`, `RISK-S02`, `RISK-S03`, `RISK-S07`.
- O relatório exportado da Fase 7 confirmou `prioritizedMetrics.length = 6`, então a lacuna impacta o artefato final, não apenas a tela.
- A discrepância entre título "9 métricas" e conteúdo textual com 11 códigos deve ser resolvida contra a fonte oficial antes de declarar cobertura total.

## O que está bom

- A experiência interativa é realmente superior ao guia estático nas fases operacionais: diagnóstico, seleção de enablers, piloto, gargalos, SDLC, governança e escala.
- Os gates impedem avanço sem preenchimento mínimo, o que força melhor qualidade de adoção do framework.
- O uso de `sessionStorage` com chave prefixada por `ai-adoption-data-` está alinhado às regras do projeto.
- A exportação consolidada transforma o framework em artefato auditável e reutilizável.
- A sanitização do Markdown e dos itens de backlog reduz risco de injeção básica na renderização.
- Os testes automatizados cobrem parser Markdown, scoring, gates, priorização, roadmap, exportação e navegação.

## O que está igual ao guia

- Ordem das 7 fases.
- Conteúdo estratégico principal em Markdown.
- Perguntas e metodologia da Fase 1.
- Arquétipos e responsabilidades da Fase 2.
- Dimensões, métricas e critérios de expansão da Fase 3.
- Fórmula, trilhas e milestones da Fase 4.
- Templates, níveis e estágios do SDLC da Fase 5.
- Políticas, padrões e guardrails da Fase 6.
- Rollout, cerimônias e critérios finais da Fase 7.

## O que está ruim ou incompleto

- `P0` Fase 7: métricas e riscos estruturados no JSON estão incompletos em relação ao guia/conteúdo textual local.
- `P1` Fase 6: material avançado de segurança de IA existe como texto, mas não é refletido integralmente no pacote gerado e exportado.
- `P1` Fase 5: critérios e anti-padrões selecionados são exportados como índices, não como textos, reduzindo legibilidade do JSON fora do app.
- `P1` Fase 3: catálogo interativo de ferramentas é menor que o conteúdo textual do guia.
- `P2` Fase 4: faltam metadados de origem dos gargalos no backlog e no relatório.
- `P2` Geral: há dependência de seções Markdown ocultadas em algumas fases; isso melhora foco da UI, mas pode reduzir percepção de cobertura se o usuário não sabe que o conteúdo segue no arquivo-fonte.

## Recomendações priorizadas

| Prioridade | Recomendação | Motivo | Critério de aceite |
| --- | --- | --- | --- |
| P0 | Completar `content/07-escala-organizacional.json` com todas as métricas e riscos do guia oficial/local Markdown | A exportação final hoje perde parte do conteúdo de escala | Plano da Fase 7 exporta todas as métricas e todos os riscos aplicáveis. |
| P0 | Resolver a inconsistência "9 métricas" vs 11 códigos no conteúdo da Fase 7 | Há conflito entre título e tabela | README, Markdown, JSON e relatório gerado usam a mesma contagem. |
| P1 | Estruturar AI Security Posture, OWASP LLM Top 10, MCP Security, Gateway e Marketplace no JSON da Fase 6 | O conteúdo é crítico e hoje fica majoritariamente textual | Pacote de governança exporta essas seções como arrays/objetos legíveis. |
| P1 | Exportar textos completos dos critérios/anti-padrões selecionados na Fase 5 | O JSON atual exige resolver índices contra `sourceConfigs` | Export da Fase 5 contém `selectedCriteriaLabels` e `selectedAntiPatternLabels`. |
| P1 | Ampliar catálogo estruturado de ferramentas da Fase 3 | A recomendação interativa cobre menos do que a tabela textual | JSON inclui todas as ferramentas da tabela ou registra explicitamente que é subset priorizado. |
| P2 | Registrar origem dos gargalos na Fase 4 | Melhora auditoria do plano 30/90/180 | Cada item exportado indica `source`: `phase-1`, `phase-3`, `default` ou `manual`. |
| P2 | Criar uma matriz de cobertura automatizada do conteúdo oficial | Evita regressões em futuras edições do guia | Teste ou script compara chaves/contagens críticas por fase. |

## Critério de aceite e evidências

Critério solicitado: todo o conteúdo do site/guia oficial deve estar validado.

Resultado desta auditoria: `Parcialmente atendido`.

Evidências coletadas:

- Guia oficial aberto com Playwright CLI: título confirmado como `Guia Completo — Framework de Adoção de IA · Tech Leads Club`.
- Guia oficial confirmou headings das 7 fases no DOM.
- Guia oficial apresentou modal de captura de dados; mesmo assim, conteúdo estrutural foi inspecionado no DOM e via fonte publicada.
- Wizard local aberto com Playwright CLI em `http://localhost:4173`.
- Fluxo completo validado: 7 fases preenchidas, 7 etapas concluídas, progresso `100%`.
- Exportação validada: mensagem `Exportação gerada com sucesso: ai-adoption-export-2026-05-18T18-42-16Z.json`.
- JSON exportado validado: `schemaVersion = 1.0.0`, `phases = 7`, `completed = 7`, `phase7.hasPlan = true`.
- Requests do fluxo local: todos os arquivos `.md` e `.json` das 7 fases retornaram HTTP 200.

Conclusão: o wizard já é uma versão interativa forte do guia, mas a cobertura total ainda depende de corrigir principalmente a estrutura da Fase 7 e enriquecer a exportação/relatório da Fase 6 para incluir todo o material avançado de segurança e governança.
