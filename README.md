# opsdroid desktop

[![Build Status](https://travis-ci.org/opsdroid/opsdroid-desktop.svg?branch=master)](https://travis-ci.org/opsdroid/opsdroid-desktop)
[![Build status](https://ci.appveyor.com/api/projects/status/7qdd8e650598u5vc/branch/master?svg=true)](https://ci.appveyor.com/project/opsdroid/opsdroid-desktop)
[![Dependency Status](https://dependencyci.com/github/opsdroid/opsdroid-desktop/badge)](https://dependencyci.com/github/opsdroid/opsdroid-desktop) [![Greenkeeper badge](https://badges.greenkeeper.io/opsdroid/opsdroid-desktop.svg)](https://greenkeeper.io/)

A cross-platform [electron](https://electron.atom.io/) & [react](https://facebook.github.io/react/) desktop app for chatting with [opsdroid](https://github.com/opsdroid/opsdroid).

![Screenshot]https://raw.githubusercontent.com/KartSriv/opsdroid-desktop/master/assets/icons/PictureForReadme.png)

## Installation

### macOS

- Download `opsdroid-desktop-{version}-macos-x64.zip` from the [latest release](https://github.com/opsdroid/opsdroid-desktop/releases/latest).
- Extract the zip.
- Move the `opsdroid-desktop.app` to `/Applications`

### Linux
- Download `opsdroid-desktop-{version}-linux-{arch}.tar.tgz` from the [latest release](https://github.com/opsdroid/opsdroid-desktop/releases/latest).
- Run `sudo mkdir /etc/opsdroid-desktop`.
- Run `sudo tar -xvzf opsdroid-desktop-*-linux-*.tar.tgz -C /etc/opsdroid-desktop`.
- Run the application with `/etc/opsdroid-desktop/opsdroid-desktop`.
- (optional for ubuntu) To add the application to the unity launcher run `sudo cp /etc/opsdroid-desktop/resources/app/scripts/ubuntu-launcher.desktop /usr/share/applications/opsdroid-desktop.desktop`

### Windows
- Download `opsdroid-desktop-{version}-win32-x64.zip` from the [latest release](https://github.com/opsdroid/opsdroid-desktop/releases/latest).
- Navigate to `C:\Program Files`.
- Create the folder `opsdroid-desktop`.
- Extract the zip into that folder.
- Run the application with `opsdroid-desktop.exe`.

## Development

```
git clone https://github.com/opsdroid/opsdroid-desktop.git
cd opsdroid-desktop
npm install -g electron-packager gulp
npm install
gulp serve
```

## Contributing

Pull requests are welcome!
