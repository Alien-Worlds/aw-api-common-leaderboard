#!/usr/bin/env bash
#
# Release this package to npm.
#
#   scripts/deploy.sh [patch|minor|major|pre|x.y.z] [--dry-run]
#
# Run from a clean, up-to-date `main`, logged in to npm (`npm login`) with
# publish rights to the package's scope. The default bump is patch. `pre` makes a
# prerelease (prepatch) and publishes it under the `next` dist-tag, so it never
# becomes `latest`.
#
#   --dry-run     run every check, build and `npm publish --dry-run`; make no
#                 commit, tag, push or publish
#   SKIP_TESTS=1  skip `yarn test:unit` (for example when the tests need a
#                 service that is not running locally)
#
# Order matters: the version commit and tag are made locally, the package is
# published, and only then are the commit and tag pushed. A failed publish
# therefore never leaves a pushed version with no package behind it.

set -euo pipefail

BRANCH=main
TYPE=patch
DRY_RUN=0
PUBLISH_ARGS=()

error_exit() {
  echo "Error: $1" >&2
  exit 1
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    major | minor | patch) TYPE=$arg ;;
    pre) TYPE=prepatch ;;
    *)
      if [[ $arg =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TYPE=$arg
      else
        error_exit "Unknown argument \"$arg\". Use major | minor | patch | pre | x.y.z, optionally with --dry-run."
      fi
      ;;
  esac
done

[[ "$TYPE" == "prepatch" ]] && PUBLISH_ARGS=(--tag next)

cd "$(git rev-parse --show-toplevel)"

[[ "$(git branch --show-current)" == "$BRANCH" ]] || error_exit "Releases are made from $BRANCH. Check it out first."
[[ -z "$(git status --porcelain)" ]] || error_exit "Working tree is not clean. Commit or stash your changes first."

git fetch origin --tags --quiet || error_exit "Fetching origin failed"
git pull --ff-only --quiet || error_exit "$BRANCH has diverged from origin/$BRANCH"

NPM_USER=$(npm whoami 2>/dev/null) || error_exit "Not logged in to npm. Run \"npm login\" first."
echo "Releasing as npm user: $NPM_USER (bump: $TYPE)"

yarn install --frozen-lockfile --ignore-scripts || error_exit "Install failed"
# Not every repo has a lint script, and some have no tests at all.
has_script() { node -e "process.exit(require('./package.json').scripts?.['$1'] ? 0 : 1)"; }
if has_script lint; then
  yarn lint || error_exit "Lint failed"
else
  echo "No lint script; skipping lint."
fi
if [[ "${SKIP_TESTS:-0}" != "1" ]]; then
  yarn test:unit --passWithNoTests || error_exit "Tests failed"
fi
yarn prepublish || error_exit "Build failed"

if [[ $DRY_RUN == 1 ]]; then
  npm publish --access public ${PUBLISH_ARGS[@]+"${PUBLISH_ARGS[@]}"} --dry-run || error_exit "Dry-run publish failed"
  echo "Dry run complete. Nothing was versioned, tagged, pushed or published."
  exit 0
fi

# Bumps package.json and makes the version commit and tag locally.
npm version "$TYPE" || error_exit "Failed to set a new version of the package"
VERSION=$(node -p "require('./package.json').version")

if ! npm publish --access public ${PUBLISH_ARGS[@]+"${PUBLISH_ARGS[@]}"}; then
  echo "Error: publish failed. The local commit and tag v$VERSION were not pushed." >&2
  echo "To undo them: git tag -d v$VERSION && git reset --hard HEAD~1" >&2
  exit 1
fi

git push origin "$BRANCH" "v$VERSION" || error_exit "Published v$VERSION but pushing failed. Run: git push origin $BRANCH v$VERSION"

echo "Released v$VERSION"
