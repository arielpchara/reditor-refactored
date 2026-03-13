# Skill: version

## Purpose

Bump the project version in `package.json` (and `web/package.json` when the web UI changes) following **Semantic Versioning** (`MAJOR.MINOR.PATCH`) derived from the commits since the last version tag.

---

## When to activate this skill

Activate when:

- A set of related changes is ready to ship as a release
- Requested explicitly (e.g. "bump version", "release", "tag version")

Do **not** bump the version:
- In the middle of a task — always version after the work is complete and committed
- Without running `npm run build` and `npm test` first
- If there are uncommitted changes unrelated to the release

---

## How to execute this skill

### Step 1 — Find the last version tag

```bash
git tag --sort=-version:refname | head -5
```

If no tags exist, compare against the initial commit:

```bash
git log --oneline
```

### Step 2 — List commits since the last tag

```bash
git log <last-tag>..HEAD --oneline
# If no tag exists:
git log --oneline
```

### Step 3 — Determine the version bump using SemVer rules

Read each commit subject line and apply the **highest-priority rule** that matches:

| Bump | Rule |
|---|---|
| **MAJOR** (`x.0.0`) | Any commit with a `BREAKING CHANGE` footer, or subject contains `!` (e.g. `feat!:`, `fix!:`) |
| **MINOR** (`0.x.0`) | Any `feat` commit (new capability added, backwards-compatible) |
| **PATCH** (`0.0.x`) | Only `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `build` commits |

**Examples:**

| Commit subject | Bump |
|---|---|
| `feat(cli): add --watch flag` | MINOR |
| `fix(http): correct static path resolution` | PATCH |
| `feat!: remove --enable-security flag` | MAJOR |
| `chore(deps): upgrade esbuild` | PATCH |
| `refactor(web): convert UI to React` | PATCH |
| `feat(web): add file tree component` | MINOR |

When in doubt, prefer the **lower** bump (PATCH over MINOR, MINOR over MAJOR).

### Step 4 — Compute the new version

Take the current version from `package.json` and apply the bump:

```bash
node -e "
  const pkg = require('./package.json');
  const [maj, min, pat] = pkg.version.split('.').map(Number);
  // Replace BUMP with 'major', 'minor', or 'patch':
  const bumps = { major: [maj+1,0,0], minor: [maj,min+1,0], patch: [maj,min,pat+1] };
  console.log(bumps['BUMP'].join('.'));
"
```

### Step 5 — Update `package.json`

Use `npm version` to update the version field without creating a git tag:

```bash
npm version <major|minor|patch> --no-git-tag-version
```

If the web UI also changed in this release, bump `web/package.json` to the same version:

```bash
cd web && npm version <major|minor|patch> --no-git-tag-version && cd ..
```

### Step 6 — Verify

```bash
node -e "console.log(require('./package.json').version)"
npm run build   # must succeed
npm test        # must pass
```

### Step 7 — Commit and tag

```bash
git add package.json package-lock.json
# Include web/package.json if it was updated:
# git add web/package.json

git commit -m "chore(release): bump version to <new-version>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

git tag v<new-version>
```

---

## Version bump decision table

Use this table to quickly decide the bump when commit types are mixed:

| Commits present | Bump |
|---|---|
| Any `feat!` or `BREAKING CHANGE` | **MAJOR** |
| `feat` (no breaking) | **MINOR** |
| Only `fix` / `refactor` / `chore` / `docs` / `build` / `test` / `style` | **PATCH** |

The highest-priority rule wins. One `feat` among ten `fix` commits → **MINOR**.

---

## Quality rules

- Never skip the build and test verification before tagging
- Never manually edit the version string — always use `npm version`
- The git tag **must** match the version in `package.json` exactly (`v0.2.0` tag ↔ `"version": "0.2.0"`)
- Do not create a tag without a corresponding version-bump commit
