#!/bin/bash
# Simple trigger script - call this URL from UptimeRobot
# This script triggers GitHub Actions workflow

gh api repos/StinglessScript/worldcup-2026-pool/dispatches \
  -X POST \
  -f event_type=update-scores \
  --silent

echo "OK"
