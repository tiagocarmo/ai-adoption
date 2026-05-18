# Fase 6 - Governança e Padronização

> "Governança boa é a que ninguém percebe que existe. Governança ruim é a que aparece em toda decisão técnica."

## Visão rápida

- **Pré-requisitos:** Fases 1, 2 e 5
- **Tempo estimado:** ≤ 15 minutos
- **Conversão esperada:** ≥ 55% (Fase 5 → 6)
- **Conclusão esperada:** ≥ 65%

## Objetivo da fase

Estabelece políticas, padrões e mecanismos de controle que asseguram uso responsável,
rastreável e consistente de IA em toda a engenharia, reduzindo risco e variabilidade. O pacote
gerado é calibrado pelo tamanho da organização, exposição regulatória e tolerância ao risco.

## 9 políticas de uso de IA

1. **Uso de Dados em Prompts**  
Nenhum dado sensível, PII, credencial ou propriedade intelectual confidencial pode ser incluído em prompts enviados a modelos de IA externos. Dados de teste devem ser sintéticos ou anonimizados.  
**Responsável:** Security Engineering · **Revisão:** Anual

2. **Escolha e Aprovação de Ferramentas**  
Toda ferramenta de IA que acesse código, dados ou infraestrutura da empresa requer avaliação de segurança e aprovação formal antes do uso em produção ou em repositórios que contêm código proprietário.  
**Responsável:** Time AI Enablers + Security · **Revisão:** Semestral

3. **Revisão Humana Obrigatória**  
Todo código gerado com assistência de IA que for para produção requer revisão humana por um engenheiro com senioridade adequada ao contexto. IA não aprova PRs de forma autônoma.  
**Responsável:** Tech Leads · **Revisão:** Anual

4. **Propriedade Intelectual**  
Código gerado com assistência de IA é propriedade da empresa. Engenheiros não devem usar ferramentas de IA que reivindiquem propriedade sobre outputs. Licenças de ferramentas devem incluir cláusula de IP explícita.  
**Responsável:** Legal + CTO · **Revisão:** Anual

5. **Segurança e Vulnerabilidades**  
Código gerado por IA para funções de segurança (autenticação, autorização, criptografia) requer revisão especializada adicional. Não usar IA para gerar ou modificar lógica de segurança sem supervisão de security engineer.  
**Responsável:** Security Engineering · **Revisão:** Semestral

6. **Controle de Custos**  
Todas as contas de ferramentas de IA devem ter limites de gasto configurados. Uso individual acima do threshold mensal definido requer aprovação prévia. Relatório de custos consolidado mensal para liderança técnica.  
**Responsável:** Engineering Manager + Finance · **Revisão:** Trimestral

7. **Exceções e Desvios**  
Qualquer desvio de política deve ser documentado, justificado e aprovado pelo responsável da política com prazo de validade definido. Exceções são revisadas no ciclo semestral de governança.  
**Responsável:** Time AI Enablers · **Revisão:** Semestral

8. **Revisão Periódica das Políticas**  
Todas as políticas são revisadas semestralmente ou quando ocorre mudança significativa nas ferramentas, no contexto regulatório ou nos incidentes relacionados a IA. A revisão inclui todos os responsáveis de política.  
**Responsável:** CTO + Time AI Enablers · **Revisão:** Semestral

9. **AI Literacy Requirement**  
Nenhum engenheiro pode usar ferramentas de IA em contexto produtivo sem ter atingido o nível L1 · APLICADOR da matriz de proficiência. Revisão de código gerado com IA exige revisor em L2 · CRÍTICO ou acima. O Time AI Enablers mantém o registro de níveis atualizado.  
**Responsável:** Time AI Enablers · **Revisão:** Trimestral

## 7 padrões técnicos

### Commits com Assistência de IA

Mensagens de commit devem indicar quando código relevante foi gerado com assistência de IA.
Formato sugerido: prefixo `[ai-assisted]` ou convenção definida pelo time. Facilita auditoria e rastreabilidade.

### Prompts Versionados

Prompts utilizados em contextos críticos (geração de código de produção, análise de segurança,
geração de testes) devem ser versionados no repositório junto ao código que os utiliza.

### Observabilidade do Uso de IA

Sistemas que expõem funcionalidades baseadas em IA para usuários finais devem ter métricas de
uso, latência, taxa de erro e feedback do usuário instrumentadas no dashboard de observabilidade padrão.

### Rastreamento de Custos por Serviço

Chamadas a APIs de IA externas devem ter tags de custo por serviço/squad para permitir atribuição de custos.
Budget alerts configurados por squad e por ambiente (dev/staging/prod separados).

### Revisão de Código Gerado por IA

PRs com mais de 30% do código gerado com IA devem ter checklist explícito de revisão incluindo:
lógica de negócio correta, ausência de PII hard-coded, tratamento de erros adequado e cobertura de testes.

### Dados Sintéticos para Desenvolvimento

Ambientes de desenvolvimento e staging devem usar dados sintéticos gerados por IA em vez de cópias de dados de produção.
Processo documentado e automatizado para geração e refresh de dados sintéticos.

### Shift Left Quality Gates

A sequência de gates de qualidade é obrigatória e progressiva — nenhuma etapa pode ser pulada:

1. Pre-commit — lint, formatação e testes unitários locais rodam antes do commit. Falha bloqueia localmente.
2. CI gate — suite completa de testes + análise estática + cobertura mínima (definida no DoD do squad). Falha bloqueia merge.
3. PR quality check — code review assistido por IA (CodeRabbit ou similar) + checklist de qualidade preenchido pelo autor. Nenhum PR é aprovado sem cobertura adequada do código novo.
4. Staging — somente código que passou nas 3 etapas anteriores chega aqui. Staging não é onde qualidade é verificada pela primeira vez.

IA habilita este padrão ao reduzir o custo de cada gate — testes gerados junto com o código, review automático no PR, análise estática em tempo real no editor.

## 6 guardrails (por criticidade)

| Guardrail | Criticidade | Controle |
| --- | --- | --- |
| Nenhum PII em Prompts | Crítica | Bloqueio técnico + alerta automático quando padrões de PII (CPF, e-mail, telefone, nome completo) são detectados em prompts enviados a APIs externas. Auditoria mensal de logs de prompts para verificar conformidade. |
| Nenhum Output de IA Raw em Produção | Crítica | Outputs de modelos de IA que chegam a usuários finais ou sistemas de produção devem passar por validação e revisão humana ou automatizada antes. Nenhum pipeline de produção aceita output de IA sem gate de qualidade. |
| Privacy Mode Ativado em Ferramentas | Alta | Todas as ferramentas de IA aprovadas devem ter modo de privacidade ativado (que impede o uso do código como dados de treinamento). Verificação incluída no processo de aprovação de novas ferramentas. |
| Revisão de Licença de Dependências | Alta | Dependências sugeridas por IA devem ter licença verificada antes da adoção. Checklist de licença incluído no processo de revisão de PRs que adicionam novas dependências geradas com assistência de IA. |
| Isolamento de Ambiente para IA | Média | Experimentações com modelos de IA em ambiente de desenvolvimento devem ser isoladas do ambiente de produção. Credenciais de produção nunca acessíveis em ambientes de dev/staging onde IA é usada. |
| Alertas de Anomalia de Uso | Média | Alertas automáticos quando o uso de APIs de IA exceder 2× o baseline semanal por squad. Objetivo: detectar loops de automação incorretos ou vazamento de credenciais antes de impacto financeiro ou de segurança. |

## Processo de revisão em 5 etapas

| # | Etapa | Responsável | SLA |
| --- | --- | --- | --- |
| 1 | Proposta inicial: Engenheiro documenta ferramenta/prática com casos de uso e riscos identificados | Engenheiro proponente | – |
| 2 | Revisão de segurança: Security Engineering avalia riscos de dados, acesso e licença | Security Engineering | 3 dias úteis |
| 3 | Piloto controlado: Time AI Enablers coordena uso restrito em ambiente isolado por 2 semanas | Time AI Enablers | 2 semanas |
| 4 | Avaliação de impacto: Resultados do piloto documentados com métricas de ganho e riscos observados | Time AI Enablers | 5 dias úteis |
| 5 | Decisão e comunicação: Aprovação, rejeição ou aprovação condicional com comunicação para toda a engenharia | CTO / VP Engineering | 2 dias úteis |

## AI Security Posture

Segurança de IA não é só "não vaze PII". É uma disciplina própria que cobre como modelos são
manipulados, como agentes agem além do autorizado, como infraestrutura de IA é comprometida
e como a organização detecta e responde a esses riscos. Os blocos abaixo refletem o que
equipes de engenharia líderes estão implementando em 2025–2026.

## Framework de defesa em 3 camadas (Input · Output · Runtime)

### Camada 1 — Input Guardrails

Antes de o prompt chegar ao modelo.

| Controle | Descrição |
| --- | --- |
| Prompt injection detection | Identificar padrões de instrução disfarçados de dados no input do usuário. Separar conteúdo de dados de conteúdo de instrução (spotlighting/metaprompting). |
| PII sanitization automática | Detectar e mascarar CPF, e-mail, telefone, nome completo e credenciais antes de enviar ao modelo. Ferramenta: presidio (Microsoft), Google DLP, AWS Comprehend. |
| Policy classification | Classificar intenção do prompt antes de processar: detectar data exfiltration, jailbreak attempt, ou uso fora do escopo aprovado. |
| Context shaping | System prompts estruturados que tratam conteúdo externo (docs, e-mails, web) como dados, nunca como instrução — reduz superfície de indirect injection. |

Pequenas: implementar ao menos PII sanitization + prompt injection detection. Médias+: policy classification automatizada no pipeline.

### Camada 2 — Output Guardrails

Antes de o output chegar ao usuário ou sistema downstream.

| Controle | Descrição |
| --- | --- |
| Nenhum output raw em produção | Output de modelos que chega a usuários finais ou sistemas críticos deve passar por validação antes. Gate obrigatório — previne LLM05 (improper output handling). |
| Schema validation | Para outputs estruturados (JSON, código, SQL), validar schema antes de usar. Rejeitar e retentar se fora do schema esperado. |
| Sensitive data scan no output | Detectar e bloquear outputs que contenham credenciais, tokens, dados de outros usuários ou informação não pública antes de exibir — previne LLM02. |
| System prompt leakage detection | Detectar quando o modelo está reproduzindo seu próprio system prompt no output (previne LLM07). Regra simples de overlap de string ou classifier dedicado. |

Pequenas: ao menos nenhum output raw + schema validation para outputs estruturados. Grandes: sensitive data scan automático em 100% dos outputs de produção.

### Camada 3 — Runtime Guardrails

Quando agentes acessam ferramentas, APIs e sistemas externos — relevante assim que houver uso agentic.

| Controle | Descrição |
| --- | --- |
| Least privilege por tool call | Cada chamada de agente a uma ferramenta usa credenciais com escopo mínimo necessário. Short-lived tokens por sessão, não credenciais globais — previne LLM06 (excessive agency). |
| Audit log por ação do agente | Toda tool call de agente em produção deve gerar log com: quem pediu, qual ferramenta, com quais parâmetros, qual foi o resultado. Rastreabilidade completa de ações autônomas. |
| Plan drift detection | Monitorar se o agente está executando uma sequência de ações compatível com a task original. Desvios de plano disparam alerta ou interrompem execução. |
| Human-in-the-loop para ações irreversíveis | Ações destrutivas (delete, deploy em produção, envio de comunicações externas) devem ter aprovação humana explícita antes de execução, independente de quem iniciou. |

Pequenas: human-in-the-loop para qualquer ação agentic em produção. Médias+: audit log automatizado + plan drift detection. Grandes: runtime guardrails via AI Gateway centralizado.

## OWASP LLM Top 10 · 2025 — riscos e controles práticos

| ID | Risco | Controle prático | Tamanho |
| --- | --- | --- | --- |
| LLM01 | Prompt Injection — input manipula o modelo a agir fora do escopo | Spotlighting, policy classification, separação instrução/dados no system prompt | Todos |
| LLM02 | Sensitive Information Disclosure — modelo expõe IP, dados de outros usuários, credenciais | PII sanitization no input + output, sensitive data scan no output, privacy mode obrigatório | Todos |
| LLM03 | Supply Chain Vulnerabilities — modelos, MCPs e dependências comprometidos | Registry verificado para MCPs (GitHub MCP Registry), scan de provenance, allowlist de modelos aprovados | Médias+ |
| LLM05 | Improper Output Handling — output não validado vai direto para produção ou sistemas críticos | Schema validation, nunca output raw em produção, output scan antes de injetar em pipelines | Todos |
| LLM06 | Excessive Agency — agente executa ações além do autorizado ou do necessário | Least privilege por tool call, human-in-the-loop em ações irreversíveis, plan drift detection | Quando houver uso agentic |
| LLM07 | System Prompt Leakage — modelo reproduz instruções internas no output | Leak detection no output, não incluir dados sensíveis em system prompts, teste regular de extração | Médias+ |
| LLM08 | Vector & Embedding Weaknesses — vazamento cross-context em RAG, dados sensíveis em vector DBs | RBAC no vector store por tenant/usuário, isolamento de namespaces, auditoria de query de embedding | Grandes |
| LLM10 | Unbounded Consumption — agente ou usuário consome tokens/compute sem limite, gerando custo ou DoS | Budget alerts por squad, rate limiting por usuário/agente, max_tokens hardcoded, anomaly detection de uso | Todos |

## MCP Security — 6 controles mínimos obrigatórios

92% dos MCP servers em uso empresarial têm alto risco de segurança — 24% sem nenhuma autenticação.
O EU AI Act (em vigor ago/2026) pode responsabilizar organizações por integrações MCP não governadas.
Antes de qualquer MCP server ir para produção, os 6 controles abaixo são pré-requisito:

| Controle | O que implica |
| --- | --- |
| OAuth 2.0 | Autenticação obrigatória. Nenhum agente conecta a MCP server sem identity verificada. |
| RBAC por operação | Autorização por tool call individual, não só por servidor. Escopo mínimo por papel. |
| Audit log com atribuição | Quem pediu, qual tool, quais parâmetros, qual resultado — log imutável por operação. |
| Path & scope controls | Limitar quais recursos e operações cada MCP server pode expor. Allowlist explícita de paths. |
| Rate limiting | Por agente, por usuário e por servidor. Previne consumo descontrolado e ataques de amplificação. |
| Sensitivity label evaluation | Classificar dados expostos por cada MCP tool. Bloquear acesso a dados de sensibilidade acima do autorizado. |

### Gateway centralizado de MCP/LLM/A2A

**Sugerido · médias e grandes**

Um único plano de controle para tráfego LLM + MCP + A2A (agent-to-agent) em vez de cada servidor implementar seus próprios controles.
Referências de mercado: Kong AI Gateway, MuleSoft AI Gateway, Solo.io Agentgateway.
Oferece: PII sanitization automática, semantic caching, fallback entre modelos, OpenTelemetry nativo, RBAC unificado e audit trail consolidado.
Pré-requisito: usar MCPs em produção com mais de 2 servidores ativos. Pequenas: implementar controles diretamente no servidor MCP.

### Marketplace de skills — critérios de publicação e governança

**Sugerido · médias e grandes**

Catálogo centralizado de prompts, agentes, templates e skills de IA validados e reutilizáveis pelos squads.
Sem um marketplace governado, a organização acaba com dezenas de versões paralelas do mesmo prompt — inconsistentes, sem revisão e sem rastreabilidade.
Plataformas de referência: SkillReg, Agent Skills Catalog (SOC 2), PromptFluent Enterprise.

| Critério de publicação | O que implica | Responsável |
| --- | --- | --- |
| Versionamento semântico | Cada skill/prompt tem versão (major.minor.patch). Breaking changes exigem major bump. Squads fixam versão em uso. | Autor + Time AI Enablers |
| RBAC por catálogo | Skills sensíveis (acesso a dados de produção, ações destrutivas) visíveis apenas para roles autorizados. Catálogos por domínio ou squad. | Time AI Enablers |
| Security scan automático | Antes de publicar, scan automatizado para: prompt injection patterns, data leakage, referência a credenciais hardcoded, PII em exemplos. | Security Engineering |
| Aprovação do Time AI Enablers | Nenhum skill vai para o catálogo público sem revisão e aprovação. Skills experimentais vão para namespace de rascunho primeiro. | Time AI Enablers |
| Métricas de uso e deprecação | Skills sem uso por 90 dias são marcados como deprecated. Skills com feedback negativo recorrente são removidos ou revisados. | Time AI Enablers |
