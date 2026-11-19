#!/usr/bin/env bash
#
# Release this package to npm.
#
#   scripts/deploy.sh [patch|minor|major|pre|x.y.z] [--dry-run] [--yes]
#
# Run from a clean, up-to-date `main`, logged in to npm (`npm login`) with
# publish rights to the package's scope. The default bump is patch. `pre` makes a
# prerelease (prepatch) and publishes it under the `next` dist-tag, so it never
# becomes `latest`.
#
#   --dry-run     run every check, build and `npm publish --dry-run`; make no
#                 commit, tag, push or publish
#   --yes         publish without the confirmation prompt (needed when there is no
#                 terminal, for example in CI)
#   SKIP_TESTS=1  skip `yarn test:unit` (for example when the tests need a
#                 service that is not running locally)
#
# Before anything is published the script checks that:
#   - the package belongs to the repository it is run from, and is not private
#   - main is not behind npm (an unmerged "record release" PR would make the next
#     release try to publish a version that already exists)
# and shows what is about to be published, including its dependencies, and asks
# for confirmation.
#
# `main` rejects direct pushes, so the release is recorded through a pull request:
# the version commit is made on a `release/vX.Y.Z` branch, the package is published,
# and only then are the branch and tag pushed and a PR opened. A failed publish
# therefore pushes nothing and leaves nothing behind. Merge the PR before the next
# release.

set -euo pipefail

BRANCH=main
TYPE=patch
DRY_RUN=0
ASSUME_YES=0
PUBLISH_ARGS=()

error_exit() {
  echo "Error: $1" >&2
  exit 1
}

# True when version $1 is lower than $2 (numeric x.y.z only; prerelease suffixes ignored).
version_lt() {
  node -e '
    const a = process.argv[1].split("-")[0].split(".").map(Number);
    const b = process.argv[2].split("-")[0].split(".").map(Number);
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) process.exit(a[i] < b[i] ? 0 : 1);
    process.exit(1);
  ' "$1" "$2"
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --yes) ASSUME_YES=1 ;;
    major | minor | patch) TYPE=$arg ;;
    pre) TYPE=prepatch ;;
    *)
      if [[ $arg =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TYPE=$arg
      else
        error_exit "Unknown argument \"$arg\". Use major | minor | patch | pre | x.y.z, optionally with --dry-run and --yes."
      fi
      ;;
  esac
done

[[ "$TYPE" == "prepatch" ]] && PUBLISH_ARGS=(--tag next)

cd "$(git rev-parse --show-toplevel)"

# Right repository? The package name must match the repository it is run from, so a
# release cannot be started from the wrong clone.
PKG_NAME=$(node -p "require('./package.json').name")
PKG_VERSION=$(node -p "require('./package.json').version")
ORIGIN_URL=$(git remote get-url origin)
REPO_NAME=$(basename "${ORIGIN_URL%.git}")
[[ "${PKG_NAME##*/}" == "$REPO_NAME" ]] ||
  error_exit "Package $PKG_NAME does not belong to repository $REPO_NAME (origin $ORIGIN_URL). Wrong directory?"
[[ "$(node -p "require('./package.json').private === true")" != "true" ]] ||
  error_exit "$PKG_NAME is marked private and is not published to npm."

[[ "$(git branch --show-current)" == "$BRANCH" ]] || error_exit "Releases are made from $BRANCH. Check it out first."
[[ -z "$(git status --porcelain)" ]] || error_exit "Working tree is not clean. Commit or stash your changes first."

git fetch origin --tags --quiet || error_exit "Fetching origin failed"
git pull --ff-only --quiet || error_exit "$BRANCH has diverged from origin/$BRANCH"
PKG_VERSION=$(node -p "require('./package.json').version")

NPM_USER=$(npm whoami 2>/dev/null) || error_exit "Not logged in to npm. Run \"npm login\" first."
echo "Releasing as npm user: $NPM_USER (bump: $TYPE)"

# Is main in step with npm? If npm is ahead, a release was published without its version
# commit reaching main; the next release would try to publish a version that exists.
PUBLISHED=$(npm view "$PKG_NAME" version 2>/dev/null || true)
if [[ -n "$PUBLISHED" ]] && version_lt "$PKG_VERSION" "$PUBLISHED"; then
  error_exit "npm already has $PKG_NAME@$PUBLISHED but $BRANCH says $PKG_VERSION. Merge the open \"record release\" PR first, then pull $BRANCH."
fi

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

# Work out the next version without leaving package.json changed.
NEXT_VERSION=$(npm version "$TYPE" --no-git-tag-version | tail -n1 | sed 's/^v//') ||
  error_exit "Failed to work out the next version"
git checkout --quiet -- package.json

if [[ $DRY_RUN == 1 ]]; then
  # A dry run makes no version commit, so package.json still holds the version that is
  # already on npm and the registry refuses it ("cannot publish over the previously
  # published version"). Bump the version in the working tree only, dry-publish that,
  # and always put package.json back.
  trap 'git checkout --quiet -- package.json' EXIT
  npm version "$TYPE" --no-git-tag-version > /dev/null || error_exit "Failed to work out the next version"
  echo "Dry run: would publish $PKG_NAME@$NEXT_VERSION"
  npm publish --access public ${PUBLISH_ARGS[@]+"${PUBLISH_ARGS[@]}"} --dry-run || error_exit "Dry-run publish failed"
  echo "Dry run complete. Nothing was versioned, tagged, pushed or published."
  exit 0
fi

echo
echo "About to publish:"
echo "  package:      $PKG_NAME  $PKG_VERSION -> $NEXT_VERSION   (npm latest: ${PUBLISHED:-none})"
echo "  repository:   $ORIGIN_URL"
echo "  directory:    $(pwd)"
echo "  commit:       $(git rev-parse --short HEAD)  $(git log -1 --format=%s)"
echo "  npm dist-tag: $([[ "$TYPE" == "prepatch" ]] && echo next || echo latest)"
echo "  dependencies:"
node -e '
  const deps = require("./package.json").dependencies || {};
  const names = Object.keys(deps);
  if (!names.length) console.log("    (none)");
  for (const n of names) console.log("    " + n + " " + deps[n]);
'
echo
if [[ $ASSUME_YES != 1 ]]; then
  [[ -t 0 ]] || error_exit "No terminal to ask for confirmation. Re-run with --yes to publish without a prompt."
  read -r -p "Publish $PKG_NAME@$NEXT_VERSION to npm? This cannot be undone. [y/N] " ANSWER
  [[ "$ANSWER" == "y" || "$ANSWER" == "Y" ]] || error_exit "Aborted. Nothing was changed."
fi

# The version commit and tag go on a release branch, never on main.
git show-ref --verify --quiet refs/heads/release/next && error_exit "A local branch release/next already exists. Delete it first."
git switch --quiet -c release/next
npm version "$TYPE" > /dev/null || {
  git switch --quiet "$BRANCH"
  git branch -D --quiet release/next
  error_exit "Failed to set a new version of the package"
}
VERSION=$(node -p "require('./package.json').version")
RELEASE_BRANCH="release/v$VERSION"
git branch -m release/next "$RELEASE_BRANCH"

if ! npm publish --access public ${PUBLISH_ARGS[@]+"${PUBLISH_ARGS[@]}"}; then
  git switch --quiet "$BRANCH"
  git branch -D --quiet "$RELEASE_BRANCH"
  git tag -d "v$VERSION" > /dev/null
  error_exit "Publish failed. Nothing was published or pushed, and the local release branch and tag were removed."
fi

if ! git push origin "$RELEASE_BRANCH" "v$VERSION"; then
  git switch --quiet "$BRANCH"
  error_exit "Published $PKG_NAME@$VERSION but pushing failed. Run: git push origin $RELEASE_BRANCH v$VERSION"
fi

if command -v gh > /dev/null 2>&1; then
  gh pr create --base "$BRANCH" --head "$RELEASE_BRANCH" \
    --title "chore: record release v$VERSION on $BRANCH" \
    --body "$PKG_NAME@$VERSION is published to npm and tagged v$VERSION. This PR brings the version commit onto $BRANCH. Merge it before the next release: the release script refuses to run while $BRANCH is behind npm." ||
    echo "Could not open the PR. Open one from $RELEASE_BRANCH into $BRANCH."
else
  echo "Open a pull request from $RELEASE_BRANCH into $BRANCH to record the release."
fi

git switch --quiet "$BRANCH"
echo "Released v$VERSION. Merge the release PR before the next release."
