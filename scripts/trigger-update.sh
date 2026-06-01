#!/bin/bash
# Trigger GitHub Actions workflow to update scores
# Run every 5 minutes via local cron

cd /Users/ztbee/Documents/worldcup
gh api repos/StinglessScript/worldcup-2026-pool/dispatches -X POST -f event_type=update-scores 2>/dev/null
echo "$(date): Workflow triggered" >> /tmp/worldcup-cron.log
