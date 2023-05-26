#!/bin/sh

error_exit()
{
    echo "Error: $1"
    exit 1
}

# major | minor | patch
TYPE=patch

if [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
  then
    TYPE=$1
elif [[ $1 == "major" ]] || [[ $1 == "minor" ]] || [[ $1 == "patch" ]]
  then
    TYPE=$1
elif [[ $1 == "" ]]
  then
    TYPE=patch
else
    printf "Unknown update type \"%s\".\n- Please use \"major\" | \"minor\" | \"patch\"\n" "$1"
    exit 1;
fi

# Build package
yarn prepublish || error_exit "Prepublish failed"

# Pull latest changes
git pull || error_exit "Pulling failed"

# Update version and commit
npm version $TYPE || error_exit "Failed to set a new version of the package"

# Push changed package.json
git push origin || error_exit "Failed to submit changes to the repository"

# publish package
npm publish || error_exit "Failed to publish a new version"