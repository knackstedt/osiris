FROM ubuntu:22.04

# Install apt dependencies
RUN apt install curl -y -qq

# Install Code Server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Install USB detection (possibly already installed?)
RUN apt-get install build-essential libudev-dev

# Install WINE
RUN dpkg --add-architecture i386
RUN mkdir -pm755 /etc/apt/keyrings
RUN wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key
RUN wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources
RUN apt update
RUN apt install --install-recommends winehq-stable -y -qq

RUN winecfg

# https://appdb.winehq.org/objectManager.php?sClass=version&iId=38203
$ sudo wget 'https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks' -O /usr/local/bin/winetricks
$ sudo chmod +x /usr/local/bin/winetricks
wineboot --init
wine uninstaller --remove '{E45D8920-A758-4088-B6C6-31DBB276992E}'

# Install .NET 4.0 on XP
winetricks winxp
wget 'http://download.microsoft.com/download/9/5/A/95A9616B-7A37-4AF6-BC36-D6EA96C8DAAE/dotNetFx40_Full_x86_x64.exe'
wine ./dotNetFx40_Full_x86_x64.exe

# Bump up to Windows 7 for .NET latest
winetricks win7
winetricks --force dotnet48 corefonts

# Base image dependencies
RUN apt-get install curl nano -y -qq

# Install VS Code remote
# RUN curl -fsSL https://code-server.dev/install.sh | sh

# This will start a code-server container and expose it at http://127.0.0.1:8080.
# It will also mount your current directory into the container as `/home/coder/project`
# and forward your UID/GID so that all file system operations occur as your user outside
# the container.
#
# Your $HOME/.config is mounted at $HOME/.config within the container to ensure you can
# easily access/modify your code-server config in $HOME/.config/code-server/config.json
# outside the container.
RUN mkdir -p ~/.config
RUN docker run -it --name code-server -p 127.0.0.1:8080:8080 \
    -v "$HOME/.config:/home/coder/.config" \
    -v "$PWD:/home/coder/source" \
    -u "$(id -u):$(id -g)" \
    -e "DOCKER_USER=$USER" \
    codercom/code-server:latest



