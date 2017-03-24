#!/usr/bin/env bash
set -euo pipefail

sha1sum data/sorted.csv | grep 1e74e7d78cc112cd9540bd98a9a190993e969760
