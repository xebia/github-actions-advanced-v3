import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const directory = new URL('../examples/workflows/', import.meta.url);
const solutionDirectory = new URL('../solutions/workflows/', import.meta.url);
const workflow = (name, folder = directory) => readFileSync(new URL(name, folder), 'utf8');

test('workflows and teaching examples match the dated latest-release lookup', () => {
  const lookup = readFileSync(new URL('../ACTION-VERSIONS.md', import.meta.url), 'utf8');
  const versions = new Map(
    [...lookup.matchAll(/^\| `([^`]+)` \| `(v[^`]+)` \| \[(v[^\]]+)\]/gm)]
      .map(([, action, used, latest]) => {
        assert.equal(used, latest, action);
        return [action, latest];
      }),
  );
  assert.equal(versions.size, 9);
  const seen = new Set();
  for (const folder of ['examples/workflows/', 'solutions/workflows/', 'slides/', 'hol/day-2/']) {
    const url = new URL(`../${folder}`, import.meta.url);
    for (const name of readdirSync(url).filter(name => /\.(?:yml|yaml|md)$/.test(name))) {
      const text = readFileSync(new URL(name, url), 'utf8');
      for (const [, action, version] of text.matchAll(/uses:\s+([\w.-]+\/[\w./-]+)@([^\s#]+)/g)) {
        assert.equal(version, versions.get(action), `${folder}${name}: ${action}`);
        seen.add(action);
      }
    }
  }
  assert.deepEqual([...seen].sort(), [...versions.keys()].sort());
});

test('example action references use readable version tags', () => {
  for (const folder of [directory, solutionDirectory]) {
    for (const name of readdirSync(folder).filter(name => name.endsWith('.yml'))) {
      const text = workflow(name, folder);
      assert.doesNotMatch(text, /uses:\s+\S+@[0-9a-f]{40}\b/, name);
      for (const match of text.matchAll(/uses:\s+([^\s#]+)/g)) {
        if (match[1].startsWith('./')) continue;
        assert.match(match[1], /^[\w.-]+\/[\w./-]+@v\d+(?:\.\d+){0,2}$/, name);
      }
    }
  }
});

const triggers = (name, folder = directory) => {
  const match = workflow(name, folder).match(/^on:\r?\n([\s\S]*?)(?=^\S)/m);
  assert.ok(match, `${name}: missing event block`);
  return match[1];
};

test('baseline always downloads into a fresh temporary directory and runs the verified bundle', () => {
  for (const folder of [directory, solutionDirectory]) {
    const text = workflow('01-baseline.yml', folder);
    assert.match(text, /^cache-mode: none$/m);
    assert.match(text, /package-manager-cache: false/);
    assert.match(text, /working-directory: \./);
    assert.match(text, /mkdtemp\(join\(process\.env\.RUNNER_TEMP, 'lab01-codeql-downloads-'\)\)/);
    assert.match(text, /prepareArchive\(manifest, directory\)/);
    assert.match(text, /time tar --zstd -xf "\$ARCHIVE"/);
    assert.match(text, /"\$RUNNER_TEMP\/lab01-codeql\/codeql\/codeql" version/);
    assert.doesNotMatch(text, /uses: actions\/cache|path: \.cache/);
  }
});

test('completed image builder installs, seeds and uninstalls the pinned archive-cache extension', () => {
  const text = workflow('03-build-prewarm.yml', solutionDirectory);
  const lab = readFileSync(new URL('../hol/day-2/03-Prewarm.md', import.meta.url), 'utf8');
  const commands = [
    'gh extension install jessehouwing/gh-actions-archive-cache --pin v0.0.2',
    'gh actions-archive-cache download "tj-actions/changed-files@$ACTION_SHA"',
    '--hostname github.com --cache-dir "$cache" --format tar.gz',
    'gh extension remove actions-archive-cache',
  ];
  for (const command of commands) {
    assert.ok(text.includes(command), `builder: ${command}`);
    assert.ok(lab.includes(command), `lab: ${command}`);
  }
  assert.ok(text.indexOf(commands[0]) < text.indexOf(commands[1]));
  assert.ok(text.indexOf(commands[1]) < text.indexOf(commands[2]));
  assert.ok(text.indexOf(commands[2]) < text.indexOf(commands[3]));
  for (const document of [text, lab]) {
    assert.ok(document.includes("if: ${{ always() && steps.install-extension.outcome == 'success' }}"));
    assert.match(document, /id: install-extension/);
    assert.doesNotMatch(document, /trap 'status=|^\s+continue-on-error: true/m);
    assert.doesNotMatch(document, /seed-action/);
  }
  assert.doesNotMatch(workflow('03-build-prewarm.yml'), /seed-action/);
  assert.match(text, /^permissions: \{\}$/m);
  assert.match(text, /^    permissions:\r?\n      contents: read$/m);
  assert.match(text, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.doesNotMatch(text, /\bcurl\b|\bgh auth login\b/);
});

test('optional cache workflows filter bundle, helper, self, and action lockfile inputs', () => {
  for (const folder of [directory, solutionDirectory]) {
    for (const [name, event] of [
      ['02-cache-main.yml', 'push'],
      ['02-cache-pr.yml', 'pull_request'],
    ]) {
      const block = triggers(name, folder);
      assert.match(block, new RegExp(`^  ${event}:`, 'm'));
      const paths = [...block.matchAll(/^      - '([^']+)'$/gm)].map(match => match[1]);
      assert.deepEqual(paths, [
        'examples/codeql-bundle.json',
        'tools/prepare-codeql.mjs',
        `.github/workflows/${name}`,
        `examples/workflows/${name}`,
        '.github/workflows/actions.lock',
      ]);
    }
    assert.match(triggers('02-cache-main.yml', folder), /^    branches: \[main\]$/m);
  }
});

test('required evidence is not removed by trigger path filters', () => {
  for (const folder of [directory, solutionDirectory]) {
    for (const name of [
      '05-stack-queue.yml', '06-gates.yml', '06-staging.yml', '06-central-required.yml',
    ]) {
      const block = triggers(name, folder);
      assert.match(block, /^  pull_request:/m);
      assert.match(block, /^  merge_group:/m);
      assert.doesNotMatch(block, /\bpaths(?:-ignore)?:/);
    }
  }
});

test('stack cancellation allows the documented 150-second window in both workflow variants', () => {
  for (const folder of [directory, solutionDirectory]) {
    const text = workflow('05-stack-queue.yml', folder);
    assert.match(text, /DELAY_SECONDS > 150/);
    assert.match(text, /must be an integer from 0 to 150/);
    assert.match(text, /Waiting %s seconds before validation/);
    assert.match(text, /sleep "\$DELAY_SECONDS"/);
    assert.match(text, /^    timeout-minutes: 10$/m);
  }
  const lab = readFileSync(new URL('../hol/day-2/05-Stacks-and-queue.md', import.meta.url), 'utf8');
  assert.match(lab, /`LAB_STACK_DELAY_SECONDS` to `150`/);
  assert.match(lab, /add one harmless YAML comment/);
  assert.match(lab, /add a second harmless YAML comment/);
  const waiting = lab.indexOf('shows `Waiting 150 seconds`');
  const replacement = lab.indexOf('add a second harmless YAML comment');
  assert.ok(waiting >= 0 && waiting < replacement);
  assert.doesNotMatch(lab, /HEAD~1|refspec/i);
});

test('stack teaching uses GitHub bottom/top terminology consistently', () => {
  for (const name of ['hol/day-2/05-Stacks-and-queue.md', 'CLASS-OUTLINE.md', 'slides/03-policy.md']) {
    const text = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(text, /\b(?:first|second)[ -]PR\b|lab-05-(?:first|second)\b/i, name);
    assert.match(text, /bottom PR/i, name);
    assert.match(text, /top PR/i, name);
  }
  const lab = readFileSync(new URL('../hol/day-2/05-Stacks-and-queue.md', import.meta.url), 'utf8');
  assert.match(lab, /`lab-05-bottom` from `main`/);
  assert.match(lab, /`lab-05-top` from `lab-05-bottom`/);
});

test('managed-account and ghe.com setup require organization-owned lab repositories', () => {
  const setup = readFileSync(new URL('../hol/day-2/00-Setup.md', import.meta.url), 'utf8');
  for (const section of ['With an Enterprise Managed User account', 'On a `ghe.com` host']) {
    const text = setup.split(`**${section}:**`)[1]?.split(/\r?\n\d\. /)[0];
    assert.ok(text, section);
    assert.match(text, /organization-owned repository/i, section);
    assert.match(text, /Personal repositories cannot use/, section);
    assert.doesNotMatch(text, /may not be available/i, section);
  }
});

test('participant and slide fallbacks do not assume recordings exist', () => {
  for (const folder of ['hol/day-2/', 'slides/']) {
    const url = new URL(`../${folder}`, import.meta.url);
    for (const name of readdirSync(url).filter(name => name.endsWith('.md'))) {
      const text = readFileSync(new URL(name, url), 'utf8');
      assert.doesNotMatch(text, /\brecordings?\b|\brecorded (?:runs?|logs?|baseline|queue|evidence|example|observations)/i, `${folder}${name}`);
    }
  }
});

test('gate lab runs a temporary PR before selecting required checks and uses ruleset names', () => {
  const lab = readFileSync(new URL('../hol/day-2/06-Gates.md', import.meta.url), 'utf8');
  const createPr = lab.indexOf('Create branch `lab-06-gates`');
  const selectCheck = lab.indexOf('In the check selector, search for `required`');
  assert.ok(createPr >= 0 && selectCheck > createPr);
  assert.match(lab, /will not appear until it has run at least once/);
  assert.match(lab, /workflow_dispatch/);
  assert.match(lab, /Keep this PR open for the tasks below/);
  assert.doesNotMatch(lab, /Record its ID|recorded rule IDs/i);
  assert.match(lab, /find .*by name/i);
});

test('CodeQL cache solutions reconcile and verify the requested bundle on every hit path', () => {
  for (const name of ['02-cache-main.yml', '02-cache-pr.yml']) {
    for (const folder of [directory, solutionDirectory]) {
      const text = workflow(name, folder);
      assert.match(text, /id: bundle\r?\n        run: node tools\/prepare-codeql\.mjs/);
      assert.match(text, /time tar --zstd -xf "\$ARCHIVE"/);
      assert.match(text, /"\$RUNNER_TEMP\/lab02-codeql\/codeql\/codeql" version/);
      assert.doesNotMatch(text, /~\/\.npm|npm ci|hashFiles\('app\/package-lock\.json'\)/);
    }
    const text = workflow(name, solutionDirectory);
    assert.match(text, /path: \.cache\/codeql-downloads/);
    assert.match(text, /hashFiles\('examples\/codeql-bundle\.json'\)/);
    assert.ok(text.indexOf('uses: actions/cache/restore@') < text.indexOf('id: bundle'));
  }
  const writer = workflow('02-cache-main.yml', solutionDirectory);
  assert.ok(writer.indexOf('uses: actions/cache/save@') > writer.indexOf('time tar --zstd'));
  assert.match(writer, /if: steps\.cache\.outputs\.cache-hit != 'true'/);
  assert.doesNotMatch(workflow('02-cache-pr.yml', solutionDirectory), /uses: actions\/cache\/save@/);
});

test('all other exercises are dispatch-only or issue-activity examples', () => {
  const scoped = new Set([
    '02-cache-main.yml', '02-cache-pr.yml', '05-stack-queue.yml',
    '06-gates.yml', '06-staging.yml', '06-central-required.yml',
  ]);
  for (const folder of [directory, solutionDirectory]) {
    const names = readdirSync(folder).filter(name => name.endsWith('.yml'));
    assert.equal(names.length, 17);
    for (const name of names.filter(name => !scoped.has(name))) {
      const block = triggers(name, folder);
      assert.match(block, /^  (?:workflow_dispatch|issues):/m, name);
      assert.doesNotMatch(block, /^  (?:push|pull_request|merge_group):/m, name);
      assert.doesNotMatch(block, /\bpaths(?:-ignore)?:/, name);
    }
  }
});

test('every completed workflow has a starter and only observation scaffolds are identical', () => {
  const names = readdirSync(directory).filter(name => name.endsWith('.yml')).sort();
  assert.deepEqual(names, readdirSync(solutionDirectory).filter(name => name.endsWith('.yml')).sort());
  const observation = new Set(['01-baseline.yml', '04-issues-all.yml', '06-staging.yml', '07-local-emulator.yml']);
  for (const name of names) {
    const starter = workflow(name);
    const solution = workflow(name, solutionDirectory);
    assert.match(starter, /^permissions: \{\}$/m, name);
    assert.match(solution, /^permissions: \{\}$/m, name);
    if (observation.has(name)) {
      assert.equal(starter, solution, name);
    } else {
      assert.notEqual(starter, solution, name);
      assert.match(starter, /TODO/, name);
      assert.doesNotMatch(solution, /TODO/, name);
    }
  }
});

test('implementation starters withhold the target logic and fail unfinished evidence', () => {
  const withheld = new Map([
    ['02-cache-main.yml', /uses: actions\/cache\/(?:restore|save)@/],
    ['02-cache-pr.yml', /uses: actions\/cache\/restore@/],
    ['03-build-prewarm.yml', /npm cache (?:add|ls)|gh extension install|docker pull/],
    ['03-prewarm.yml', /uses: tj-actions\/changed-files@/],
    ['04-parallel.yml', /^      - parallel:|^    strategy:/m],
    ['04-timeout.yml', /sleep 120|^        timeout-minutes:/m],
    ['05-stack-queue.yml', /^concurrency:/m],
    ['06-gates.yml', /needs\.application\.result != 'success'/],
    ['06-central-required.yml', /^        if:|^        env:/m],
    ['07-debug.yml', /find app\/src|run: test -f app\/src\/server\.js/],
    ['08-dependencies.yml', /uses: jessehouwing\/actions-dependency-submission@/],
    ['09-release.yml', /uses: actions\/attest@|gh attestation verify/],
  ]);
  for (const [name, pattern] of withheld) assert.doesNotMatch(workflow(name), pattern, name);
  assert.doesNotMatch(workflow('04-issues-filtered.yml'), /^    types:/m);
  for (const name of [
    '02-cache-main.yml', '02-cache-pr.yml', '03-build-prewarm.yml',
    '04-parallel.yml', '04-timeout.yml', '06-gates.yml',
    '08-dependencies.yml', '09-release.yml',
  ]) {
    assert.match(workflow(name), /TODO:[^\n]+\n\s+exit 1/, name);
  }
  assert.match(workflow('06-central-required.yml'), /title = os\.environ\.get\("TITLE"\)/);
  assert.match(workflow('06-central-required.yml', solutionDirectory), /if: github\.event_name == 'pull_request'\r?\n        env:\r?\n          TITLE: \$\{\{ github\.event\.pull_request\.title \}\}/);
  assert.match(workflow('07-debug.yml'), /run: test -f app\/src\/serve\.js/);
});

test('timeout starter explains the learner action and distinguishes a timeout from its placeholder error', () => {
  const text = workflow('04-timeout.yml');
  assert.match(text, /^    timeout-minutes: 3$/m);
  for (const instruction of [
    'wait for two minutes',
    "step's timeout-minutes setting",
    'alongside run, not inside the shell script',
    'three-minute limit on the job unchanged',
    'after about one minute',
    'not success or an immediate script error',
  ]) assert.ok(text.includes(instruction), instruction);
  const readme = readFileSync(new URL('README.md', directory), 'utf8');
  assert.match(readme, /replace the whole placeholder with your implementation/i);
});

test('lab solution links select completed references only inside collapsed solutions', () => {
  const labs = new URL('../hol/day-2/', import.meta.url);
  for (const name of readdirSync(labs).filter(name => name.endsWith('.md'))) {
    const text = readFileSync(new URL(name, labs), 'utf8');
    let details = false;
    for (const line of text.split(/\r?\n/)) {
      if (line.includes('<details>')) details = true;
      if (/\]\(\.\.\/\.\.\/solutions\/workflows\//.test(line)) assert.ok(details, name);
      if (line.includes('</details>')) details = false;
    }
  }
});
