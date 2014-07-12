#!/bin/bash
set -e

# Check if NodeJS is installed in system
command -v node >/dev/null 2>&1 || {
    echo >&2 "This application requires NodeJS, please install it using your package manager first.";
    exit 1;
}

echo -e "Installing node dependencies if necessary..\n"
npm install

# Check if nodemon command exists in system
command -v nodemon >/dev/null 2>&1 || {
    echo >&2 "\nThis script requires nodemon, installing..";
    sudo npm install nodemon -g;
}

echo -e "\nStarting MagePanel using nodemon..\n"
nodemon ./app.js localhost 4624
