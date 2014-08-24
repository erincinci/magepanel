#!/usr/bin/env node

echo "Starting MagePanel from script.." >> /var/log/magepanel.log
cd /opt/magepanel; npm start
