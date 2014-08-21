#!/bin/bash
set -e

echo "Starting MagePanel.." >> /var/log/magepanel.log
node /opt/magepanel/app.js
