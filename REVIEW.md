# 🔁 Reescrevi o REDITOR do zero em menos de 24 horas — com IA

Há alguns meses, compartilhei aqui o **REDITOR** — uma ideia de ferramenta CLI para editar arquivos de servidor pelo navegador.
👉 [Post original](https://www.linkedin.com/feed/update/urn:li:activity:7437949769785729024/)

Naquela época, era mais conceito do que produto. Desta vez, resolvi refazer tudo do zero — e em **menos de 24 horas** tenho um programa funcional, publicado, que qualquer pessoa pode testar com um único comando.

---

## 📊 Os números

| Métrica | Valor |
|---|---|
| Tempo total | ~21 horas (12/mar 16:29 → 13/mar 13:16) |
| Commits | **52** |
| Arquivos criados/alterados | **104** |
| Linhas inseridas | **+11.397** |
| Linhas de código (backend + frontend) | **~3.620** |
| Linhas de testes | **~1.243** |
| Arquivos de código | **69** |
| Skills de IA escritas | **5** (766 linhas) |
| AGENTS.md (instruções de arquitetura) | **356 linhas** |

---

## 🧠 Como foi a interação com a IA

Eu **não pedi para a IA "criar um projeto"**. Eu arquitetei tudo antes:

1. **Criei o `AGENTS.md`** — um documento de 356 linhas que define a arquitetura hexagonal, as convenções de código (FP sobre OOP, `type` no lugar de `interface`, discriminated unions, winston logger), a estrutura de pastas, regras de dependência, padrões de CSS (BEM), e o fluxo de testes.

2. **Escrevi 5 Skills** — arquivos `.md` com instruções especializadas que a IA aprende a executar:
   - **`commit.md`** — como criar commits descritivos e semânticos
   - **`update-readme.md`** — manter o README em sincronia com o código
   - **`http-scenarios.md`** — gerar/atualizar os arquivos `.http` para cada endpoint
   - **`status.md`** — manter disclosure de uso de IA no README
   - **`version.md`** — bump de versão seguindo SemVer

3. **Defini os parâmetros e a IA executou** — ela criava os arquivos, seguia as convenções, escrevia testes, e eu revisava e direcionava.

---

## 🔄 Mudanças no meio do caminho

Nem tudo foi linear. Várias decisões mudaram durante o processo:

- **Inclusão do React** — comecei com HTML puro, mas rapidamente ficou claro que precisava de componentes. Migrei para React + Vite no meio do desenvolvimento.
- **esbuild no lugar de tsc** — para gerar um artefato leve que pudesse ser usado direto com `npx`, troquei o build do backend para esbuild. O resultado é um bundle minificado que roda sem precisar instalar dependências.
- **Refactors no meio do caminho** — renomeei módulos, mudei a estrutura de diretórios do web, e redesenhei a UI mais de uma vez.

---

## 🤖 Nem toda IA é igual — o que aprendi testando diferentes modelos

Esse projeto foi um stress test real de diferentes modelos de IA para programação:

- **Claude Sonnet** — o mais equilibrado. Entendia as skills, seguia as convenções do `AGENTS.md`, produzia código consistente e era econômico nos tokens.
- **Claude Opus** — poderoso, mas devorava todos os meus tokens. Para tarefas longas ficava caro demais sem ganho proporcional de qualidade.
- **Claude Haiku** — para tarefas complexas, não conseguia. Também não soube interpretar as skills corretamente, voltando a padrões genéricos.
- **Codex (OpenAI)** — testei também, mas não entendeu o sistema de skills. Ignorava o `AGENTS.md` e gerava código fora das convenções definidas.

### Os momentos de falha

Houve **diversos momentos** em que a IA começou a degradar:

- Contexto longo demais → respostas genéricas, ignorando conventions
- Precisei **limpar contexto várias vezes** — fechar a sessão e começar uma nova
- Às vezes o modelo "esquecia" o que já tinha sido feito e propunha refactors desnecessários
- Skills mais complexas (como build + deploy) exigiam intervenção manual

A lição: **IA é uma ferramenta, não um autopilot**. O resultado depende diretamente da qualidade das instruções e da supervisão humana.

---

## 🚀 O que o REDITOR faz hoje

- **Editor no navegador** com syntax highlighting automático (via `prism-code-editor`)
- **Segurança por padrão** — OTP mostrado no terminal + JWT RS256
- **Rate limiting** — 3 tentativas erradas de OTP e o servidor fecha
- **HTTPS** com certificado auto-gerado
- **Histórico de versões** — drawer lateral com as versões salvas durante a sessão
- **Criação de arquivos** — flag `--create` para criar arquivos inexistentes
- **Zero instalação** — roda direto com `npx`

---

## 🧪 Teste agora

Não precisa instalar nada. Só precisa de Node.js ≥ 18:

```bash
# Editar um arquivo existente
npx github:arielpchara/reditor-refactored serve ./qualquer-arquivo.txt

# Criar um arquivo novo
npx github:arielpchara/reditor-refactored serve ./novo.yaml --create

# Com porta customizada
npx github:arielpchara/reditor-refactored serve ./config.json --port 8080
```

O OTP aparece no terminal. Cole no navegador. Pronto.

📦 Repositório: [github.com/arielpchara/reditor-refactored](https://github.com/arielpchara/reditor-refactored)

---

## 💡 O takeaway

Em menos de 24 horas, com a IA certa e instruções bem escritas, é possível ir de zero a um produto funcional e publicado. Mas o diferencial não foi a IA — foi saber **o que pedir**, **como estruturar**, e **quando intervir**.

As skills e o `AGENTS.md` foram o verdadeiro multiplicador de produtividade. A IA sem direção produz código genérico. Com arquitetura e convenções bem definidas, ela se torna uma extensão real do seu raciocínio.

---

*52 commits. 69 arquivos. ~3.600 linhas de código. ~1.200 linhas de teste. 5 skills. 1 AGENTS.md. Menos de 24 horas.*

#AI #CopilotAgent #CLI #DevTools #NodeJS #React #TypeScript #OpenSource #DeveloperProductivity
