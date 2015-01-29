#!/bin/bash
set -e

# Options
host="localhost"
port=8886
url="http://${host}:${port}/"

# -------------------------
# Detect OS Function
# -------------------------
detectOS() {
	unamestr=`uname`
	if [[ "$unamestr" == CYGWIN_NT* ]]; then
	    platform='cygwin'
	elif [[ "$unamestr" == 'Linux' ]]; then
	    platform='linux'
	elif [[ "$unamestr" == 'Darwin' ]]; then
	    platform='macos'
	elif [[ "$unamestr" == 'Win32' ]]; then
        platform='windows'
	fi
}

# Detect platform
platform='unknown'
detectOS

# Console colors
if [ $platform = "macos" ]; then
    default="\033[39m\033[24m"
	light_red="\033[91m"
	red="\033[31m"
	green="\033[32m"
	light_green="\033[92m"
	yellow="\033[33m"
	light_yellow="\033[93m"
	blue="\033[34m"
	light_blue="\033[94m"
	magenta="\033[35m"
	light_magenta="\033[95m"
	cyan="\033[36m"
	light_cyan="\033[96m"
	clear_screen="\033c"
	underlined="\033[4m"
else
    default="\e[39m\e[24m"
    light_red="\e[91m"
    red="\e[31m"
    green="\e[32m"
    light_green="\e[92m"
    yellow="\e[33m"
    light_yellow="\e[93m"
    blue="\e[34m"
    light_blue="\e[94m"
    magenta="\e[35m"
    light_magenta="\e[95m"
    cyan="\e[36m"
    light_cyan="\e[96m"
    clear_screen="\033c"
    underlined="\e[4m"
fi

# -------------------------
# Print Title
# -------------------------
printTitle() {
    echo -e "          _____                   _____                   _____                   _____                   _____                   _____                   _____                   _____                   _____  "
    echo -e "         /\\    \\                 /\\    \\                 /\\    \\                 /\\    \\                 /\\    \\                 /\\    \\                 /\\    \\                 /\\    \\                 /\\    \\ "
    echo -e "        /::\\____\\               /::\\    \\               /::\\    \\               /::\\    \\               /::\\    \\               /::\\    \\               /::\\____\\               /::\\    \\               /::\\____\\"
    echo -e "       /::::|   |              /::::\\    \\             /::::\\    \\             /::::\\    \\             /::::\\    \\             /::::\\    \\             /::::|   |              /::::\\    \\             /:::/    /"
    echo -e "      /:::::|   |             /::::::\\    \\           /::::::\\    \\           /::::::\\    \\           /::::::\\    \\           /::::::\\    \\           /:::::|   |             /::::::\\    \\           /:::/    / "
    echo -e "     /::::::|   |            /:::/\\:::\\    \\         /:::/\\:::\\    \\         /:::/\\:::\\    \\         /:::/\\:::\\    \\         /:::/\\:::\\    \\         /::::::|   |            /:::/\\:::\\    \\         /:::/    /  "
    echo -e "    /:::/|::|   |           /:::/__\\:::\\    \\       /:::/  \\:::\\    \\       /:::/__\\:::\\    \\       /:::/__\\:::\\    \\       /:::/__\\:::\\    \\       /:::/|::|   |           /:::/__\\:::\\    \\       /:::/    /   "
    echo -e "   /:::/ |::|   |          /::::\\   \\:::\\    \\     /:::/    \\:::\\    \\     /::::\\   \\:::\\    \\     /::::\\   \\:::\\    \\     /::::\\   \\:::\\    \\     /:::/ |::|   |          /::::\\   \\:::\\    \\     /:::/    /    "
    echo -e "  /:::/  |::|___|______   /::::::\\   \\:::\\    \\   /:::/    / \\:::\\    \\   /::::::\\   \\:::\\    \\   /::::::\\   \\:::\\    \\   /::::::\\   \\:::\\    \\   /:::/  |::|   | _____   /::::::\\   \\:::\\    \\   /:::/    /     "
    echo -e " /:::/   |::::::::\\    \\ /:::/\\:::\\   \\:::\\    \\ /:::/    /   \\:::\\ ___\\ /:::/\\:::\\   \\:::\\    \\ /:::/\\:::\\   \\:::\\____\\ /:::/\\:::\\   \\:::\\    \\ /:::/   |::|   |/\\    \\ /:::/\\:::\\   \\:::\\    \\ /:::/    /      "
    echo -e "/:::/    |:::::::::\\____/:::/  \\:::\\   \\:::\\____/:::/____/  ___\\:::|    /:::/__\\:::\\   \\:::\\____/:::/  \\:::\\   \\:::|    /:::/  \\:::\\   \\:::\\____/:: /    |::|   /::\\____/:::/__\\:::\\   \\:::\\____/:::/____/       "
    echo -e "\\::/    / ~~~~~/:::/    \\::/    \\:::\\  /:::/    \\:::\\    \\ /\\  /:::|____\\:::\\   \\:::\\   \\::/    \\::/    \\:::\\  /:::|____\\::/    \\:::\\  /:::/    \\::/    /|::|  /:::/    \\:::\\   \\:::\\   \\::/    \\:::\\    \\       "
    echo -e " \\/____/      /:::/    / \\/____/ \\:::\\/:::/    / \\:::\\    /::\\ \\::/    / \\:::\\   \\:::\\   \\/____/ \\/_____/\\:::\\/:::/    / \\/____/ \\:::\\/:::/    / \\/____/ |::| /:::/    / \\:::\\   \\:::\\   \\/____/ \\:::\\    \\      "
    echo -e "             /:::/    /           \\::::::/    /   \\:::\\   \\:::\\ \\/____/   \\:::\\   \\:::\\    \\              \\::::::/    /           \\::::::/    /          |::|/:::/    /   \\:::\\   \\:::\\    \\      \\:::\\    \\     "
    echo -e "            /:::/    /             \\::::/    /     \\:::\\   \\:::\\____\\      \\:::\\   \\:::\\____\\              \\::::/    /             \\::::/    /           |::::::/    /     \\:::\\   \\:::\\____\\      \\:::\\    \\    "
    echo -e "           /:::/    /              /:::/    /       \\:::\\  /:::/    /       \\:::\\   \\::/    /               \\::/____/              /:::/    /            |:::::/    /       \\:::\\   \\::/    /       \\:::\\    \\   "
    echo -e "          /:::/    /              /:::/    /         \\:::\\/:::/    /         \\:::\\   \\/____/                 ~~                   /:::/    /             |::::/    /         \\:::\\   \\/____/         \\:::\\    \\  "
    echo -e "         /:::/    /              /:::/    /           \\::::::/    /           \\:::\\    \\                                         /:::/    /              /:::/    /           \\:::\\    \\              \\:::\\    \\ "
    echo -e "        /:::/    /              /:::/    /             \\::::/    /             \\:::\\____\\                                       /:::/    /              /:::/    /             \\:::\\____\\              \\:::\\____\\"
    echo -e "        \\::/    /               \\::/    /               \\::/____/               \\::/    /                                       \\::/    /               \\::/    /               \\::/    /               \\::/    /"
    echo -e "         \\/____/                 \\/____/                                         \\/____/                                         \\/____/                 \\/____/                 \\/____/                 \\/____/ "
    echo -e "                                                                                                                                                                                                                 "
}

# -------------------------
# Open URL in browser
# -------------------------
openUrlInBrowser() {
    if [[ $platform == 'cygwin' ]]; then
        cygstart ${url}
    elif [[ $platform == 'macos' ]]; then
        open ${url}
    else
        [[ -x $BROWSER ]] && exec "$BROWSER" "$url"
        path=$(which xdg-open || which gnome-open) && exec "$path" "$url"
        echo -e >&2 `date +"%d %b %T"`" - ${light_red}[runner] Can't find browser${default}\n"
    fi
}

# Print title
echo -e "${clear_screen}"
printTitle

# Check if NodeJS is installed in system
command -v npm >/dev/null 2>&1 || {
    echo -e >&2 `date +"%d %b %T"`" - ${light_red}[runner] This application requires NodeJS & NPM, please install it using your package manager first.${default}";
    exit 1;
}

# Check if pm2 exists in system
command -v pm2 >/dev/null 2>&1 || {
    echo >&2 "\n"`date +"%d %b %T"`" - ${magenta}[runner] This script requires pm2, installing..${default}";
    sudo npm install pm2 -g;
}

# Start app
echo -e "\n"`date +"%d %b %T"`" - ${cyan}[runner] Starting MagePanel using nodemon & Launching browser..${default}\n"
#openUrlInBrowser ${url}
npm start
