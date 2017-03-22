#!/usr/bin/env bash
set -euo pipefail

sha1sum DOHMH_New_York_City_Restaurant_Inspection_Results.csv | grep 35354fe1fb1adc75b9b484d778c6b4d39c06b1d5
sha1sum sort_n.csv | grep 1e74e7d78cc112cd9540bd98a9a190993e969760
