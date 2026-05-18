# Fase 1 - Diagnóstico Organizacional e de Engenharia

> "IA não deve ser limitada pela estrutura organizacional e pela maturidade da engenharia."

## Visão rápida

- **Pré-requisitos:** Nenhum — ponto de entrada do framework
- **Tempo estimado:** ≤ 8 minutos
- **Conclusão esperada:** ≥ 50%
- **Acesso:** Gratuito · Resultado imediato

## Objetivo da fase

Mede o nível de prontidão da organização e da engenharia para adoção de IA, identificando
lacunas de cultura, maturidade operacional e capacidade técnica. O resultado orienta todas as
fases seguintes e serve como baseline para medir evolução.

## Metodologia de pontuação

Cada dimensão recebe pontuação de 1.0 (baixo), 2.0 (médio) ou 3.0 (alto) com base na resposta
selecionada. O score geral é a média das 9 dimensões. O gargalo principal é a dimensão de menor
pontuação — em caso de empate, o critério de desempate é a dimensão de maior impacto operacional
na adoção de IA.

| Nível | Regra de score | Interpretação |
| --- | --- | --- |
| **Baixo** | Score < 1,67 | Organização tem bloqueios significativos para adoção de IA |
| **Médio** | 1,67 ≤ Score < 2,34 | Organização tem base, mas com gaps que precisam de atenção |
| **Alto** | Score ≥ 2,34 | Organização está pronta para adoção acelerada de IA |

## Os 3 macro-blocos

### Bloco A — Cultura & Autonomia

Avalia o grau de autonomia das equipes, a flexibilidade organizacional e o senso de responsabilidade
sobre entregas e decisões técnicas.

**Dimensões:** Autonomia de Engenharia · Flexibilidade Organizacional · Ownership e Accountability

### Bloco B — Maturidade Operacional

Mede a capacidade de entrega contínua, os padrões de qualidade adotados e a velocidade com que as
equipes recebem e processam feedback.

**Dimensões:** Maturidade de Continuous Delivery · Maturidade de Qualidade · Velocidade de Feedback

### Bloco C — Capacidade Técnica & IA

Examina a experiência do desenvolvedor no código, o nível de adoção de inteligência artificial e a
senioridade técnica média das equipes.

**Dimensões:** Developer Experience e Qualidade do Código · Maturidade no Uso de IA · Senioridade da Engenharia

## As 9 perguntas do diagnóstico

### Questão 1 · Autonomia de Engenharia

**Pergunta:** Os engenheiros do seu time conseguem liderar funcionalidades de ponta a ponta — do design
técnico ao deploy — sem depender de aprovações externas ao squad?

**Mede:** Grau de autonomia técnica real dos engenheiros para tomar decisões e entregar sem bloqueios externos.

**Impacto na adoção de IA:** Times com baixa autonomia não conseguem incorporar IA no fluxo de trabalho
porque cada mudança de processo exige aprovação de fora do squad.

#### Baixo (1,0)

Engenheiros dependem de múltiplas aprovações externas para a maioria das decisões técnicas. Funcionalidades
passam por arquitetos centrais, comitês ou outras equipes antes de qualquer avanço. O ciclo de decisão é
longo e previsível somente para quem está fora do squad.

#### Médio (2,0)

Engenheiros têm autonomia para a maioria das decisões técnicas rotineiras, mas ainda dependem de aprovação
externa para mudanças de arquitetura, tecnologia ou impacto cross-squad. A exceção vira regra com alguma
frequência.

#### Alto (3,0)

Engenheiros lideram funcionalidades de ponta a ponta com ownership técnico completo. Decisões de arquitetura,
tecnologia e deploy são feitas dentro do squad. Coordenação com outros times é por convenção, não por aprovação.

### Questão 2 · Flexibilidade Organizacional

**Pergunta:** Quando seu time identifica uma nova prática, ferramenta ou tecnologia relevante, quanto tempo leva
para experimentá-la formalmente no ambiente de trabalho?

**Mede:** Velocidade com que a organização consegue avaliar e adotar novas práticas tecnológicas sem burocracia
excessiva.

**Impacto na adoção de IA:** Organizações com baixa flexibilidade levam meses para aprovar ferramentas de IA,
perdendo janelas de adoção enquanto a tecnologia avança rapidamente.

#### Baixo (1,0)

Adoção de novas práticas ou ferramentas leva meses e exige múltiplos níveis de aprovação. O processo de avaliação
é informal ou inexistente, resultando em decisões lentas e frequentemente bloqueadas por fatores políticos ou
organizacionais.

#### Médio (2,0)

Existe um processo de avaliação de novas tecnologias, mas o ciclo médio leva de 4 a 8 semanas. Há critérios
definidos, mas aprovações ainda passam por múltiplas camadas. Times conseguem fazer experimentos controlados,
mas a adoção formal é lenta.

#### Alto (3,0)

Times conseguem iniciar experimentos formais em menos de 2 semanas. O processo de adoção é claro, rápido e com
critérios objetivos. Decisões de tecnologia são descentralizadas e baseadas em evidências, não em hierarquia.

### Questão 3 · Ownership e Accountability

**Pergunta:** Quando algo falha em produção em um sistema do seu time, o processo de resolução e aprendizado é
conduzido pelo próprio squad — incluindo análise de causa raiz e ações preventivas?

**Mede:** Grau em que times assumem responsabilidade completa pelos resultados das suas entregas, incluindo operação
e incidentes.

**Impacto na adoção de IA:** Times sem ownership real de produção não têm incentivo para usar IA em observabilidade
e detecção de problemas, pois não se sentem responsáveis pelo sistema em execução.

#### Baixo (1,0)

Incidentes são frequentemente escalados para equipes externas (SRE, ops, arquitetura) para resolução. O squad que
desenvolveu não é o responsável primário pela operação. Análises de causa raiz são raras ou conduzidas por outra
equipe.

#### Médio (2,0)

O squad é responsável pelo on-call mas ainda delega parte da resolução para equipes de suporte especializadas.
Análises de causa raiz acontecem para incidentes maiores, mas ações preventivas têm acompanhamento inconsistente.

#### Alto (3,0)

O squad tem ownership completo do sistema em produção — detecta, resolve, analisa e age preventivamente. On-call
é rotativo dentro do time. Cada incidente gera aprendizado documentado e melhorias rastreáveis.

### Questão 4 · Maturidade de Continuous Delivery

**Pergunta:** Com que frequência seu time realiza deploys em produção e qual o nível de automação desse processo?

**Mede:** Frequência e previsibilidade das entregas em produção, com o grau de automação que as suporta.

**Impacto na adoção de IA:** Pipelines manuais e deploys infrequentes tornam impossível usar IA em code review,
análise de PR e sugestões de refatoração de forma integrada ao fluxo real de entrega.

#### Baixo (1,0)

Deploys acontecem mensalmente ou com menor frequência e envolvem processos manuais significativos. Cada deploy é
um evento de alto risco que requer coordenação entre múltiplas equipes. O pipeline de CI existe mas não garante
deploy automatizado.

#### Médio (2,0)

Deploys acontecem semanalmente com automação parcial. O pipeline de CI/CD cobre build e testes, mas o deploy para
produção ainda tem etapas manuais ou janelas de manutenção. A frequência é limitada por processo, não por capacidade
técnica.

#### Alto (3,0)

Deploys acontecem múltiplas vezes por semana ou diariamente, com pipeline totalmente automatizado do commit ao deploy.
Feature flags separam deploy de release. O processo é previsível e reversível, com rollback automatizado quando
necessário.

### Questão 5 · Maturidade de Qualidade

**Pergunta:** Qual é o nível de automação de testes e o grau em que o próprio time de engenharia é responsável pela
qualidade do código em produção?

**Mede:** Maturidade da automação de testes e do ownership de qualidade pelo time de engenharia.

**Impacto na adoção de IA:** Código sem cobertura de testes torna arriscada a adoção de IA para geração e refatoração
de código, pois não há rede de segurança para validar o output da IA automaticamente.

#### Baixo (1,0)

Testes automatizados cobrem menos de 30% da base de código ou são inconsistentes entre módulos. Qualidade é
responsabilidade de QA manual separado do time de desenvolvimento. Bugs em produção são frequentes e difíceis de
rastrear.

#### Médio (2,0)

Há cobertura de testes automatizados para as principais funcionalidades, mas a cobertura é desigual e testes de
integração são limitados. QA ainda tem papel separado, mas o time de engenharia assume mais responsabilidade pela
qualidade do que antes.

#### Alto (3,0)

Cobertura de testes automatizados é alta e consistente. O próprio time de engenharia define e mantém a qualidade.
Quality gates no pipeline bloqueiam código com cobertura insuficiente ou falha em testes. QA automatizado é parte
integral do processo de desenvolvimento.

### Questão 6 · Velocidade de Feedback

**Pergunta:** Quanto tempo leva desde um commit até o feedback completo — testes, build, análise estática — e até o
primeiro sinal de comportamento em produção?

**Mede:** Velocidade dos ciclos de feedback desde o código até a observabilidade em produção.

**Impacto na adoção de IA:** Ciclos de feedback longos limitam a eficácia de IA em code review e pair programming,
pois o custo de validar sugestões da IA é alto quando o loop de feedback demora horas.

#### Baixo (1,0)

O pipeline de CI leva mais de 30 minutos para dar feedback. Monitoramento de produção é reativo — problemas são
detectados por usuários antes de alertas internos. O ciclo completo de commit a sinal de produção leva horas ou dias.

#### Médio (2,0)

O pipeline de CI entrega feedback em 10 a 30 minutos. Há monitoramento básico de produção com alertas configurados
para os principais erros. O tempo de detecção de problemas em produção é medido em horas.

#### Alto (3,0)

O pipeline de CI entrega feedback em menos de 10 minutos. Monitoramento de produção é proativo com detecção de
anomalias antes de impacto ao usuário. O ciclo completo de commit a sinal de produção é medido em minutos.

### Questão 7 · Developer Experience e Qualidade do Código

**Pergunta:** Como você avalia a qualidade da arquitetura do código e a produtividade real dos engenheiros no dia a
dia de desenvolvimento?

**Mede:** Saúde da arquitetura de código e a experiência real de desenvolvimento — tempo de onboarding, facilidade de
mudança, nível de débito técnico.

**Impacto na adoção de IA:** Código com alto débito técnico e arquitetura acoplada limita o que IA consegue ajudar —
sugestões de IA são ineficazes quando o contexto do código é fragmentado e difícil de entender mesmo para humanos.

#### Baixo (1,0)

A base de código tem alto débito técnico que torna mudanças arriscadas e lentas. Onboarding de novos engenheiros leva
semanas devido à falta de documentação e à complexidade acidental. Ambiente de desenvolvimento local é instável e
difícil de configurar.

#### Médio (2,0)

Há partes da base de código bem estruturadas e outras com débito técnico significativo. Onboarding é possível em
alguns dias com acompanhamento. Ambiente de desenvolvimento funciona mas tem inconsistências entre membros do time.

#### Alto (3,0)

A arquitetura é clara, modular e documentada. Onboarding de novos engenheiros acontece em menos de 2 dias produtivos.
Ambiente de desenvolvimento é reproduzível e consistente. Débito técnico é monitorado e priorizado sistematicamente.

### Questão 8 · Maturidade no Uso de IA

**Pergunta:** Em que extensão ferramentas de IA já estão integradas ao fluxo de desenvolvimento do seu time — desde
sugestões de código até automação de tarefas de engenharia?

**Mede:** Grau de integração de IA no fluxo de desenvolvimento e a profundidade do uso além do básico.

**Impacto na adoção de IA:** Dimensão de auto-referência: o nível atual de uso de IA revela a prontidão do time para
aprofundar a adoção e o quanto a organização está preparada para extrair valor das próximas ondas de IA.

#### Baixo (1,0)

IA não é usada sistematicamente no fluxo de desenvolvimento. Alguns membros podem usar ferramentas individualmente, mas
sem padronização, incentivo ou política organizacional. O time não tem visão clara do que IA pode oferecer para o
desenvolvimento.

#### Médio (2,0)

Assistentes de código com IA são usados pela maioria do time, mas o uso está limitado a sugestões de código e
completions. IA ainda não é usada sistematicamente para testes, revisão de código, documentação ou refatoração.

#### Alto (3,0)

IA está integrada em múltiplas etapas do fluxo de desenvolvimento — sugestão de código, revisão, geração de testes,
documentação e análise de pull requests. O time mede o impacto do uso de IA e usa os dados para otimizar a adoção.

### Questão 9 · Senioridade da Engenharia

**Pergunta:** Qual é a proporção de engenheiros sêniores e staff no seu time — profissionais capazes de tomar decisões
técnicas complexas com autonomia real?

**Mede:** Capacidade técnica coletiva do time para operar com autonomia, avaliar trade-offs e liderar decisões de
arquitetura.

**Impacto na adoção de IA:** Times com baixa senioridade não conseguem avaliar criticamente o output da IA, resultando
em adoção superficial ou em código gerado por IA que cria novos problemas não detectados.

#### Baixo (1,0)

Menos de 20% do time é composto por engenheiros sêniores ou staff. Decisões técnicas complexas frequentemente dependem
de consultoria externa ao squad ou estão concentradas em 1–2 pessoas. O time tem dificuldade em operar autonomamente em
problemas novos.

#### Médio (2,0)

Entre 20% e 40% do time são sêniores ou staff. Há capacidade técnica para a maioria das decisões rotineiras, mas
problemas de arquitetura ou escala ainda requerem apoio externo frequente. O time está em transição para maior
autonomia técnica.

#### Alto (3,0)

Mais de 40% do time são sêniores, staff ou principal. O time tem capacidade técnica para tomar decisões complexas de
forma autônoma. Há engenheiros de referência que elevam o nível técnico coletivo e mentoram a progressão dos demais.

## Recomendações por dimensão e nível

| Dimensão | Baixo | Médio | Alto |
| --- | --- | --- | --- |
| Autonomia | Mapear dependências externas que bloqueiam decisões técnicas dos times. Implementar ownership por squad com escopo claro. | Estabelecer critérios objetivos para escalada de decisões versus decisão local. Criar fóruns de arquitetura que preservem autonomia. | Documentar os mecanismos de autonomia para replicar em novos times. Auditar periodicamente se a autonomia está gerando coerência técnica. |
| Flex. Organizacional | Identificar os principais pontos de aprovação burocrática que atrasam adoção de tecnologia. Criar processo de experimentação controlada. | Formalizar um framework de decisão para avaliação de novas tecnologias. Reduzir o ciclo de feedback entre proposta e decisão para menos de 2 semanas. | Documentar o modelo de adoção como referência para novos times e produtos. Avaliar se a velocidade de adoção está criando débito de governança. |
| Ownership | Definir SLOs por squad e torná-los visíveis para toda a engenharia. Estabelecer on-call rotativo por produto, não por componente. | Conectar métricas de negócio aos resultados de engenharia de cada squad. Implementar revisões regulares de incidentes com ownership explícito. | Verificar se o ownership está distribuído de forma sustentável ou concentrado em poucos. Usar dados de incidents para orientar priorização técnica. |
| Cont. Delivery | Automatizar o processo de build e deploy antes de qualquer outra iniciativa de CD. Medir lead time atual para estabelecer baseline. | Implementar feature flags para separar deploy de release e reduzir risco. Reduzir o tamanho médio dos pull requests para acelerar o ciclo. | Garantir que a frequência de deploy não esteja degradando a estabilidade de produção. Explorar deployment progressivo (canary, blue-green). |
| Qualidade | Estabelecer cobertura mínima de testes automatizados como critério de merge. Criar testes de integração para os 5 componentes mais críticos. | Mover testes manuais de regressão para automação progressivamente por release. Implementar quality gates no pipeline de CI. | Medir o custo de manutenção dos testes para prevenir debt em automação. Avaliar a eficácia dos testes em detectar defeitos antes de produção. |
| Vel. de Feedback | Instrumentar o pipeline de CI para medir tempo médio de feedback de testes. Criar alertas de produção com detecção de anomalias. | Reduzir o tempo de execução do pipeline de CI para menos de 10 minutos. Implementar monitoramento de experiência real do usuário (RUM). | Avaliar se a velocidade de feedback está sendo usada ativamente em decisões de produto. Documentar o fluxo como padrão para novos produtos. |
| DX & Código | Realizar auditoria de débito técnico nas áreas de maior volume de alteração. Medir tempo de onboarding de novos engenheiros. | Padronizar ambiente de desenvolvimento local com containers reproduzíveis. Criar convenções de código documentadas e aplicadas via linting. | Medir a correlação entre qualidade do código e velocidade de entrega. Investir em abstrações internas que reduzam código repetitivo. |
| Uso de IA | Adotar assistentes de código com IA para toda a engenharia como ponto de partida. Definir casos de uso concretos onde IA gera ganho mensurável. | Medir o impacto do uso de IA em velocity, qualidade e tempo de ciclo. Expandir uso de IA para revisão de código, geração de testes e documentação. | Explorar agentes de IA para tarefas de refatoração e automação de fluxos repetitivos. Estabelecer governança para uso de IA. |
| Senioridade | Criar plano de carreira técnico com critérios explícitos de progressão para sênior. Identificar engenheiros com potencial e oferecer mentoria estruturada. | Revisar distribuição de tarefas complexas para desenvolver sêniores emergentes. Criar fóruns técnicos onde sêniores compartilhem decisões. | Avaliar se a senioridade está sendo usada para elevar o nível técnico coletivo. Documentar critérios de promoção para staff/principal. |
