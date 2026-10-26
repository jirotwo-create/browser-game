#!/bin/sh
set -eu
: "${GODOT_ANDROID_KEYSTORE_RELEASE_PATH:?Set the path to your signing keystore}"
: "${GODOT_ANDROID_KEYSTORE_RELEASE_USER:?Set the signing key alias}"
: "${GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD:?Set your signing password in the environment}"
project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$project_dir/builds"
godot --headless --path "$project_dir" --export-release Android "$project_dir/builds/GorbinosQuest-Android.apk"
