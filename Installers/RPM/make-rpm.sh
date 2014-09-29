#!/usr/bin/env bash

# IMPORTANT 
# Protect agaisnt mispelling a var and rm -rf /
set -u
set -e

VERSION="1.2"
SRC=/tmp/magepanel-rpm-src
DIST=/tmp/magepanel-rpm-dist
SYSROOT=${SRC}/sysroot
DEBIAN=${SRC}/DEBIAN

rm -rf ${DIST}
mkdir -p ${DIST}/

rm -rf ${SRC}
rsync -a rpm-src/ ${SRC}/
mkdir -p ${SYSROOT}/opt/

rsync -a ../../ ${SYSROOT}/opt/magepanel/ --delete --exclude='.idea/' --exclude='*.db' --exclude='logs/*' --exclude='public/tmp/*' --exclude='Installers' --exclude='*.iss' --exclude='.gitignore' --exclude='*.bat' --exclude='run.sh' --exclude='.git/'
rsync -a ./install-chrome.sh ${SYSROOT}/opt/magepanel/

find ${SRC}/ -type d -exec chmod 0755 {} \;
find ${SRC}/ -type f -exec chmod go-w {} \;
chown -R root:root ${SRC}/

let SIZE=`du -s ${SYSROOT} | sed s'/\s\+.*//'`+8
pushd ${SYSROOT}/
tar czf ${DIST}/data.tar.gz [a-z]*
popd
sed s"/SIZE/${SIZE}/" -i ${DEBIAN}/control
pushd ${DEBIAN}
tar czf ${DIST}/control.tar.gz *
popd

pushd ${DIST}/
echo 2.0 > ./debian-binary

find ${DIST}/ -type d -exec chmod 0755 {} \;
find ${DIST}/ -type f -exec chmod go-w {} \;
chown -R root:root ${DIST}/
ar r ${DIST}/magepanel-v${VERSION}.deb debian-binary control.tar.gz data.tar.gz
popd
rsync -a ${DIST}/magepanel-v${VERSION}.deb ./

echo -e "\n\t--> Debian package generated, now converting to RPM package..\n"
alien --to-rpm --scripts --keep-version --verbose ./magepanel-v${VERSION}.deb
