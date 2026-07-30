# Competition Radar Round 2: main-page performance

## Outcome

The main radar keeps all 184 records and the interactive workbench, but no longer
server-renders 184 full detail panels.

| Production artifact | Before | After | Change |
| --- | ---: | ---: | ---: |
| `dist/competitions/index.html` | 2,170,134 bytes | 795,219 bytes | -63.4% |
| Static HTML element estimate | 21,863 | 3,603 | -83.5% |

The acceptance budgets are `< 1,200,000` HTML bytes and `< 8,000` elements.

## Rendering model

- Astro still renders all competition list cards and each card links to its
  independent `/competitions/{id}/` page. The list therefore remains readable
  and navigable without JavaScript.
- One escaped JSON payload contains the complete searchable workbench data.
- One reusable detail panel is updated with `textContent`, `replaceChildren`,
  and DOM element creation. Record text is never interpolated through
  `innerHTML`.
- Independent detail routes remain the canonical full pages for SEO.

## Preserved workbench behavior

- Search, category/tier/status filters, and all five sort modes
- Complete URL state plus browser back/forward restoration
- Versioned local favorites, saved-only filtering, and empty state
- Dynamic countdown metrics and urgent list
- Confirmed-date-only ICS export; estimated dates keep the control disabled
- Official link, independent detail link, and summary copy
- 44 px controls, focus styles, live regions, reduced-motion behavior, and a
  horizontally scrollable mobile timeline

## Verification

- `npm run build`
- `node --test tests/competition-page-budget.test.mjs tests/competition-radar.test.mjs tests/competitions-data.test.mjs`
- Browser checks at 1280×720 and 390×844:
  - Search and combined status filtering
  - Sort URL state and back/forward restoration
  - Zero-result state
  - Favorite persistence through reload and saved-only filtering
  - Confirmed ICS success feedback and estimated ICS disabled state
  - Keyboard tab order from search to status
  - No document or list horizontal overflow
  - Mobile timeline `scrollWidth > clientWidth`

## Residual risks

- The initial JSON payload deliberately duplicates the short text already shown
  in list cards. Removing that duplication would require a separate network
  request and would weaken immediate/offline interaction.
- The list still contains 184 cards by design. If the data set grows far beyond
  this round, the next step should be accessible list virtualization or
  pagination while retaining no-JS links.
