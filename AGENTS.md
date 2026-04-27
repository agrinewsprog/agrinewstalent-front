## agrinewstalent-front Agents

Use these repo-specific rules for every task in this frontend.

### Default Working Policy

- Use installed repo-relevant skills implicitly whenever the task clearly matches their description.
- Do not wait for the user to invoke a skill manually if the task clearly fits.
- Combine multiple relevant skills when a task spans contracts, ids, routing, i18n, applications, program offers, dashboards, or profile flows.
- Do not invoke irrelevant skills just because they are available.
- Prefer the approach that best matches the repo architecture, shared helpers, and App Router plus `next-intl` conventions.

### Skills To Prioritize By Default

- `front-contracts`: use by default for API parsing, defensive mappers, dashboards, applications, company profiles, and any ambiguous entity shape.
- `front-ids-routing`: use by default for dynamic routes, `Link`, `router.push`, query params, locale-aware navigation, and id-bearing hrefs.
- `front-applications`: use by default for candidate/application flows, application detail, status badges, changers, and dashboard recent-activity blocks.
- `front-program-offers`: use by default for any task involving offers inside programs, program-offer detail, apply flows from program contexts, or mixed `offerId` and `programOfferId`.
- `front-next-intl`: use by default for labels, translated statuses, layouts, shared shell components, auth copy, locale-aware navigation, and message files.

### Priority Areas Requiring Skills By Default

- Canonical data contracts and response normalization
- Id semantics and resolvers
- Dashboards and recent activity cards
- `next-intl` and locale-aware UI
- Routes, href builders, and manual links
- Applications and candidate flows
- Offers, program offers, and apply flows
- Profiles, company profile parsing, and logo or file upload flows

### Non-Negotiable Guardrails

- Respect the canonical data contract before changing display logic.
- Do not mix `offerId` and `programOfferId`.
- Do not mix `studentId`, `candidateId`, and `userId` without an explicit shared resolver.
- Do not mix normal applications and program applications unless the screen explicitly needs both.
- Do not mix normal offers and program offers unless the screen explicitly needs both.
- Do not break `next-intl` namespace or label consistency.
- Do not introduce manual fragile links when a shared builder should exist or be extended.

### Specialized Agents

Use these repo-specific agent roles when delegating or framing work for this frontend.

### front-contracts-guardian

- Mission: protect canonical frontend data contracts, entity shapes, and id semantics.
- Use when: a task touches API response parsing, mappers, dashboards, applications, program offers, or company profile parsing.
- Primary targets:
  - `src/app/[locale]/intranet/company/dashboard/page.tsx`
  - `src/app/[locale]/intranet/company/offers/[id]/applications/page.tsx`
  - `src/app/[locale]/intranet/student/applications/page.tsx`
  - `src/app/[locale]/intranet/university/programs/[programId]/page.tsx`
  - `src/components/applications/applications-list.tsx`
- Guardrails:
  - Never treat `programOfferId` as interchangeable with real `offerId`.
  - Never treat `studentId`, `candidateId`, and `userId` as interchangeable without an explicit resolver.
  - Prefer one shared normalizer over page-local fallback chains.

### front-routing-ids

- Mission: keep routing, params, and locale-aware links stable across the app.
- Use when: a task touches `Link`, `router.push`, dynamic routes, path building, or query params.
- Primary targets:
  - `src/lib/utils.ts`
  - company offers/detail screens
  - student program/detail screens
  - university program/detail screens
- Guardrails:
  - Always preserve `locale`.
  - Prefer shared href builders over inline string interpolation.
  - Separate navigation ids from mutation ids when the route uses `programOfferId` but the API action needs `offerId`.

### front-i18n-shell

- Mission: protect `next-intl`, namespaces, labels, and shared intranet shell behavior.
- Use when: a task touches layouts, navigation, labels, dashboard copy, auth copy, or status labels.
- Primary targets:
  - `src/i18n/request.ts`
  - `src/i18n/routing.ts`
  - `messages/*`
  - `src/components/intranet/*`
  - `src/components/company/ApplicationStatusChanger.tsx`
- Guardrails:
  - Use `getTranslations` on the server and `useTranslations` on the client.
  - Do not introduce literal translation keys in rendered output.
  - Keep status labels aligned with canonical status normalization.

### front-role-screens

- Mission: implement screen-level changes once contracts, ids, and navigation rules are clear.
- Use when: the task is scoped to one intranet flow and the data contract is already understood.
- Primary targets:
  - company: dashboard, offers, applications, candidates, programs
  - student: dashboard, applications, programs, profile
  - university: dashboard, students, programs, company views
- Guardrails:
  - Reuse shared resolvers before adding screen-local parsing.
  - Keep role-specific display logic in the screen, but move entity normalization to shared helpers.

### Delegation Policy

- Use specialized agents for complex or cross-cutting tasks that materially benefit from separation of concerns.
- Use subagents only when there is real delegation value, such as parallelizable analysis, independent code slices, or non-overlapping verification.
- Do not use subagents for simple or tightly scoped edits.
- For tasks that cross contracts, ids, routing, and i18n together, decide the skill set first, then delegate only if the work is clearly divisible.
- When a task is complex, briefly state which skills and agents are being applied.

### Default Mapping Between Task Type And Help

- Contract-heavy task: apply `front-contracts`, consider `front-contracts-guardian`.
- Routing or params task: apply `front-ids-routing`, consider `front-routing-ids`.
- i18n or shell task: apply `front-next-intl`, consider `front-i18n-shell`.
- Application-flow task: apply `front-applications`, often combine with `front-contracts`.
- Program-offer task: apply `front-program-offers`, often combine with `front-ids-routing` and `front-contracts`.
- Screen implementation task with clear inputs: apply the relevant skills first, then use `front-role-screens` if delegation helps.

### Maintenance Rule

- If a recurring task in this repo is not being matched well by the installed skills, propose adjusting an existing skill or creating a new one before repeating ad hoc patterns.
