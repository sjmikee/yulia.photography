# Project instructions

## Use Graphify for codebase navigation

Use the local Graphify map first when locating implementation, understanding
architecture, tracing dependencies, or assessing the impact of a change. Run
commands from the repository root. If `graphify` is missing from this session's
PATH, use `/Users/mike/.local/bin/graphify`.

At the start of a code-related task, refresh the code map before querying it:

```sh
graphify extract . --code-only --no-cluster
```

This is an incremental, local AST extraction. It also creates a missing map.
Keep `.graphifyignore` exclusions in effect; do not add `--no-gitignore`.

Use scoped queries rather than reading the entire graph or report:

```sh
graphify query "<question about the code>" --budget 2000
graphify explain "<symbol or file>"
graphify affected "<symbol or file>" --depth 2
graphify path "<source>" "<target>"
```

If a query is ambiguous, select the relevant file or symbol from its candidates.
Narrow truncated queries with `--seed <file-or-symbol>` or increase the budget
only when needed.

Read the source files identified by the map before editing or making claims.
Graph edges can be inferred, and a missing edge does not prove that no dependency
exists. Some Astro templates, data/configuration files, and dynamic references
produce no symbols. Use targeted `rg` searches and direct reads for those gaps,
excluded content, or when Graphify is unavailable; do not let a map failure block
the task. Report material map limitations.

After code changes, refresh the map again using the extraction command above.
After intentional deletions or renames, if Graphify refuses a smaller rebuild,
confirm that the reduction matches the changes before adding `--force`.

To regenerate the interactive map and architecture report after extraction:

```sh
graphify cluster-only . --no-label
```

## Map scope and artifacts

- Keep mapping local and code-only. Do not enable semantic/LLM extraction, cloud
  uploads, or API-backed labeling unless the user requests it.
- Preserve exclusions for photos/media, dependencies, build output, caches,
  temporary files, environment files, and credentials in `.graphifyignore`.
- The map is `graphify-out/graph.json`; the interactive view is
  `graphify-out/graph.html`; the report is `graphify-out/GRAPH_REPORT.md`.
- `graphify-out/` is generated locally and ignored by Git. Do not edit generated
  graph data manually or commit it. Commit the instructions and exclusion rules
  when a commit is requested.
- The machine installation includes `graphifyy[sql]` so database migrations can
  be parsed. On a new machine, install that extra as well.
