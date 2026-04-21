# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Laravel, Eloquent, PHP framework, Laravel API, Artisan, Blade, Livewire, Sanctum, Horizon | laravel-specialist | ~/.agents/skills/laravel-specialist/SKILL.md |
| TDD, test-first, write the test first, red-green-refactor | test-driven-development | ~/.agents/skills/test-driven-development/SKILL.md |
| frontend, web component, UI, design, React, Vue, landing page, dashboard, page, build, create, implement UI | frontend-design | ~/.agents/skills/frontend-design/SKILL.md |
|创意, 设计, 前端, 网站, 页面, 界面, React, Vue, 组件 | ui-ux-pro-max | ~/.agents/skills/ui-ux-pro-max/SKILL.md |
| Laravel, TDD, Pest, testing, PHPUnit | laravel-tdd | ~/.agents/skills/laravel-tdd/SKILL.md |
| Go, golang, testing, teatest, bubbletea, TUI | go-testing | ~/.config/opencode/skills/go-testing/SKILL.md |
| caveman, brief, less tokens, compress, ultra-compressed | caveman | ~/.agents/skills/caveman/SKILL.md |
| commit, commit message, conventional commits | caveman-commit | ~/.agents/skills/caveman-commit/SKILL.md |
| PR, pull request, branch, create PR | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| issue, bug report, feature request, create issue | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| review, code review, PR feedback, review comments | receiving-code-review | ~/.agents/skills/receiving-code-review/SKILL.md |
| request review, before merge, verify work | requesting-code-review | ~/.agents/skills/requesting-code-review/SKILL.md |
| skill, create skill, agent skill, new skill | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| find skills, discover, install skill, capability | find-skills | ~/.agents/skills/find-skills/SKILL.md |
| plans, writing plans, implementation plan | writing-plans | ~/.agents/skills/writing-plans/SKILL.md |
| brainstorm, ideation, feature design, creative work | brainstorming | ~/.agents/skills/brainstorming/SKILL.md |
| judgment day, adversarial review, dual review, doble review | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| web design, guidelines, accessibility, UI audit | web-design-guidelines | ~/.agents/skills/web-design-guidelines/SKILL.md |
| filament, admin panel, nested resources, data source | filament-pro | ~/.agents/skills/filament-pro/SKILL.md |
| finish branch, merge, PR cleanup, complete development | finishing-a-development-branch | ~/.agents/skills/finishing-a-development-branch/SKILL.md |
| git worktree, isolated branch, worktree | using-git-worktrees | ~/.agents/skills/using-git-worktrees/SKILL.md |
| subagent, task delegation, parallel tasks | subagent-driven-development | ~/.agents/skills/subagent-driven-development/SKILL.md |
| code quality, correctness, rust patterns, comments | code-quality | ~/.agents/skills/code-quality/SKILL.md |
| compress memory, CLAUDE.md, todos, caveman format | caveman-compress | ~/.agents/skills/caveman-compress/SKILL.md |
| caveman help, commands, reference | caveman-help | ~/.agents/skills/caveman-help/SKILL.md |
| PR review, review comments, compress | caveman-review | ~/.agents/skills/caveman-review/SKILL.md |

## Compact Rules

### laravel-specialist
- Use PHP 8.2+ features (readonly, enums, typed properties)
- Type hint all method parameters and return types
- Use Eloquent relationships properly (avoid N+1 with eager loading)
- Implement API resources for transforming data
- Queue long-running tasks
- Write comprehensive tests (>85% coverage)
- Use service containers and dependency injection
- Follow PSR-12 coding standards
- NEVER: raw queries without protection, skip eager loading, hardcode config, skip validation

### test-driven-development
- Write the test first. Watch it fail. Write minimal code to pass
- NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
- Red-Green-Refactor cycle: RED (failing test) → GREEN (minimal pass) → REFACTOR
- If you wrote code before the test, delete it and start over
- One test at a time, minimal assertions

### frontend-design
- Commit to a bold aesthetic direction before coding
- Typography: distinctive fonts, avoid Arial/Inter/Roboto generic fonts
- Color: CSS variables, dominant + sharp accent over timid evenly-distributed palettes
- Motion: CSS-only preferred, focus on high-impact moments with staggered reveals
- Spatial: asymmetry, overlap, generous negative space OR controlled density
- NEVER: purple gradients on white, generic AI aesthetics, cookie-cutter layouts

### ui-ux-pro-max
- 50+ styles, 161 color palettes, 57 font pairings
- Use shadcn/ui MCP for component search and examples
- Cover: React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind
- Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor

### laravel-tdd
- Write Pest PHP tests first
- Use factory states for test data setup
- Test feature/integration layer, not just unit
- Target >85% coverage

### go-testing
- Use teatest for Bubbletea TUI testing
- Table-driven tests preferred in Go
- Use httptest for HTTP testing
- Coverage: go test -cover

### caveman
- Ultra-compressed mode: "me speak like caveman"
- Cut 75% tokens while keeping technical accuracy
- Levels: lite, full (default), ultra, wenyan-lite, wenyan-full, wenyan-ultra

### branch-pr
- Issue-first enforcement: create issue before any PR
- Use gh CLI for all GitHub operations
- Include description, body with summary bullets

### receiving-code-review
- Verify technical claims before accepting feedback
- Ask for clarification if feedback is unclear
- Require evidence, not just opinion

### code-quality
- General correctness rules
- Rust patterns (if applicable)
- Avoid over-engineering
- Comments where necessary

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| API Spec | C:\apiwox\apiwox.json | Swagger 2.0 — GPS tracking API |
| Documentation | C:\apiwox\desarollo.md | SUTRAN EMV v2 contract (Spanish) |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.