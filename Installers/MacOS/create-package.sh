#!/bin/bash
# Stop & Tail service using
# sudo launchctl unload -w /Library/LaunchDaemons/com.erincinci.magepanel.plist
# tail -f /var/log/magepanel.err.log
set -e

# Variables
PACKAGE_MAKER=/Applications/PackageMaker.app/Contents/MacOS/PackageMaker
INSTALL_USER=`whoami`
TEMP_DIR="tmp/MagePanel"
OUT_DIR="."
VERSION="1.0"
echo -e "\n\t--> Executing script as '${INSTALL_USER}'\n"

# Init temp dir & Copy files
echo -e "\n\t--> Initializing temp dir & Copying files..\n"
rm -rf ${TEMP_DIR} || true
mkdir -p ${TEMP_DIR}
rsync --progress -a ../../ ${TEMP_DIR} --exclude='.idea/' --exclude='*.db' --exclude='logs/*' --exclude='public/tmp/*' --exclude='Installers' --exclude='*.iss' --exclude='.gitignore' --exclude='*.bat' --exclude='run.sh' --exclude='.git/'

# Find & Remove problematic files
echo -e "\n\t--> Finding and removing problematic files on source dir..\n"
find ${TEMP_DIR} -name "~*" -exec rm -f {} \;
find ${TEMP_DIR} -name ".DS_Store" -exec rm -f {} \;

# Changing ownership of folders for the process
#echo -e "\n\t--> Changing ownership to root for creating package..\n";
#sudo chown root:wheel pkg/Payload.d/com.erincinci.magepanel.plist
#ls -alh pkg/Payload.d/com.erincinci.magepanel.plist
#sudo chown -R ${INSTALL_USER}:staff MagePanel-PackageMaker.pmdoc

# Create package installer with verbose (Alternate: GUI)
echo -e "\n\t--> Creating installer package with PackageMaker..\n"
#${PACKAGE_MAKER} --verbose --no-recommend -d MagePanel-PackageMaker.pmdoc -o ${OUT_DIR}/MagePanel-v${VERSION}.pkg -p dmg
${PACKAGE_MAKER} --verbose --no-recommend -d MagePanel-PackageMaker.pmdoc -o ${OUT_DIR}/MagePanel-v${VERSION}.pkg

# Clean TEMP folder
echo -e "\n\t--> Cleaning temp folder..\n"
rm -rf ${TEMP_DIR}

# Tail GUI installer
echo -e "\n\t--> Press any key to continue script.."
read toContinue
echo -e "\n\t--> Tailing Mac Installer log..\n"
tail -f /var/log/install.log