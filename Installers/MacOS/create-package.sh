#!/bin/bash
# If something breaks: stop service using
# sudo launchctl unload -w /Library/LaunchDaemons/com.erincinci.magepanel.plist
# tail -f /var/log/magepanel.err.log
#set -e

# Variables
INSTALL_USER=`whoami`
echo -e "\n\t--> Executing script as '${INSTALL_USER}'\n"

# Make sure only root can run our script
#if [ "$(id -u)" != "0" ]; then
#   echo -e "\n\t--> This script must be run as root!\n" 1>&2
#   exit 1
#fi

# Find & Remove problematic files
echo -e "\n\t--> Finding and removing problematic files on source dir..\n"
find ../.. -name "~*" -exec rm -f {} \;
find ../.. -name ".DS_Store" -exec rm -f {} \;

# Changing ownership of folders for the process
echo -e "\n\t--> Changing ownership to root for creating package..\n";
#sudo chown -R root:wheel ../../.
#ls -alh ../../.
sudo chown -R root:wheel /Users/${INSTALL_USER}/Downloads/MagePanel
ls -alh /Users/${INSTALL_USER}/Downloads/MagePanel
sudo chown root:wheel pkg/Payload.d/com.erincinci.magepanel.plist
ls -alh pkg/Payload.d/com.erincinci.magepanel.plist
sudo chown -R ${INSTALL_USER}:staff MagePanel-PackageMaker.pmdoc

# Create package installer with verbose (Alternate: GUI)
echo -e "\n\t--> Creating installer package with PackageMaker..\n"
#/Applications/PackageMaker.app/Contents/MacOS/PackageMaker -v -d MagePanel-PackageMaker.pmdoc -o /Users/${INSTALL_USER}/Desktop/MagePanel-v1.0.pkg -p dmg
/Applications/PackageMaker.app/Contents/MacOS/PackageMaker -v -d MagePanel-PackageMaker.pmdoc -o /Users/${INSTALL_USER}/Desktop/MagePanel-v1.0.pkg

# Taking back the ownership after process is done
#echo -e "\n\t--> Taking back ownership for user: ${INSTALL_USER}..\n"
#sudo chown -R ${INSTALL_USER}:staff ../../.

# Tail GUI installer
echo -e "\n\t--> Tailing Mac Installer log..\n"
tail -f /var/log/install.log