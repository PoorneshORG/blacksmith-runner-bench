# blacksmith-runner-bench

Purpose-built benchmark repo for comparing GitHub Actions runner options (GitHub-hosted vs Blacksmith, across vCPU tiers) ahead of an org-wide Blacksmith rollout decision (IT-12620).

## What runs

A medium-size Node.js/TypeScript codebase (mini e-commerce domain: products, inventory, cart, pricing, discounts, tax, shipping, users, orders, notifications — ~59 unit tests) that does a real `npm ci` install, `tsc` + `webpack` build, `jest` test run, and a `docker build --no-cache` multi-stage image build. No caching is used anywhere (no `actions/cache`, no npm/Docker layer cache) so wall-clock time reflects raw runner performance, not cache hits.

## How the benchmark works

`.github/workflows/bench.yml` takes a `runner_label` input and runs two identical jobs (`bench-a`, `bench-b`) in parallel on that label — testing both raw speed and concurrent-job handling for that runner tier.

Dispatched 5 times per runner label across:
- `ubuntu-latest` (GitHub-hosted, 2-core — live control; this org's free plan doesn't support GitHub-hosted Larger Runners for a live 4/8-core comparison)
- `blacksmith-2vcpu-ubuntu-2404`
- `blacksmith-4vcpu-ubuntu-2404`
- `blacksmith-8vcpu-ubuntu-2404`

Results (per-job duration from the Actions API, billed minutes, and Blacksmith's own cost reporting) feed the IT-12620 rollout-approval report.
