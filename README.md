# ![MagePanel Logo](http://s23.postimg.org/t7m6upgzb/magepanel.png) MagePanel #

Web-based user interface for [Magallanes Deployment Tool](http://magephp.com/).

Enjoy!

![Console](http://s4.postimg.org/to4px58m5/console.png)

![Projects](http://s4.postimg.org/x6gptj9i5/projects.png)

![File Editor](http://s4.postimg.org/dakqdzsgt/editor.png)

*(Requires [Node](http://nodejs.org/) v0.10.2 or newer)*

## Recommended Installation ##

```bash
>> git clone https://github.com/erincinci/magepanel.git MagePanel
>> cd MagePanel
>> npm start

## Prerequisites ##

- For Debian Based Linux (Ubuntu, ...):
```bash
>> sudo apt-get install php5-cli
```
- For RedHat Based Linux (CentOS, ...):
```bash
>> sudo yum install php-cli
```
Rest of the requirements will be automatically installed with installers provided..

## Installers ##

- [![installers](http://s11.postimg.org/e3jzqgcn3/installer.png) Installers](https://github.com/erincinci/magepanel/releases/latest)

## Running Magallanes on Cygwin (Windows) ##

* Install **cygwin** *(Will be automatically installed with MagePanel Windows Installer)* → [**Here**](https://cygwin.com/install.html)
* Download & Extract latest **Magallanes** release → [**Here**](https://github.com/andres-montanez/Magallanes/releases/latest)
* Download & Setup your keys in **Putty Pageant** → [**Here**](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html)
* Download & Copy **ssh-pageant** binary in cygwin `/usr/bin/` directory as described → [**Here**](https://github.com/cuviper/ssh-pageant)
* Start **cygwin** and change dir to extracted **Magallanes** `bin/` dir → *ex:* `cd /cygdrive/c/Downloads/magallanes/bin/`
* Run commands →
```bash
>> ./mage compile
>> cp mage.phar /usr/bin/mage
>> chmod +x /usr/bin/mage
```
* Run `mage version` command on **cygwin** to test if **Magallanes** is working correctly