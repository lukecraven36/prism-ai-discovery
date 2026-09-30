# Prism by Simpson Associates

Prism is a facilitator-led AI use-case discovery application. It starts with business problems, keeps value, readiness and risk separate, shows uncertainty honestly, and turns assessed opportunities into a dependency-aware roadmap and customer-ready report.

The first version is a dependency-free browser application. It uses transparent questions and deterministic rules; it does not call an LLM or require an API key.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:4173`. Set a different port with `PORT=8080 npm start`.

There is no install or build step. Run the validation suite with:

```bash
npm test
npm run check
```

## Open from any machine

The repository includes a GitHub Pages deployment workflow. Every push to `main` publishes the current application at:

`https://lukecraven36.github.io/prism-ai-discovery/`

On the first deployment, the repository owner may need to open **Settings → Pages** in GitHub and select **GitHub Actions** as the source. Deployment progress appears under the repository's **Actions** tab.

GitHub Pages publishes the application, but it does not create shared storage. Each browser keeps a separate local copy of customer data. To continue on another machine, export a JSON backup under **Settings & backup** on the first machine, then import it on the second machine.

## Workshop workflow

1. Create a customer or open the labelled demo.
2. Capture customer context once for the organisation.
3. Add one or more problem-led opportunities.
4. Use guided mode to capture the problem, approach, value, readiness, delivery and risk evidence.
5. Resolve gates, risks and business-case scenarios in the assessment review.
6. Compare complete opportunities in the priority matrix; incomplete cases remain in a range-based state.
7. Add shared foundations, validation tasks and pilots to the roadmap, including dependencies and capacity.
8. Save a decision snapshot, print the customer report, or export Markdown, CSV and JSON.

## Storage and limitations

Records are stored in this browser profile using a versioned local-storage adapter. Autosave detects and reports storage failures. JSON backup/import provides a portable copy, including stable IDs, null states and links. Imported data is validated before merge or replacement.

This local edition is not shared customer management. Other browsers and devices do not see the same records, and browser storage is not a substitute for managed backup. Export JSON before switching device, browser profile or storage settings. There is no authentication, collaboration backend, CRM integration, native PDF generator or file-upload evidence store. Browser print provides the PDF workflow.

## Documentation

- [Full product build brief](docs/PRISM_BUILD_BRIEF.md)
- [Methodology](docs/METHODOLOGY.md)
- [Facilitator guide](docs/FACILITATOR_GUIDE.md)
- [Delivery notes](docs/DELIVERY_NOTES.md)

The interface uses a temporary original prism treatment. The official Simpson Associates website was not accessible from the restricted build environment, so no colours, typefaces or logo artwork are claimed as official brand assets.
