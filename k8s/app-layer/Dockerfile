FROM ubuntu:22.04

# Install apt dependencies
RUN apt update
RUN apt install curl wget -y -qq


# Install WINE
RUN dpkg --add-architecture i386
RUN mkdir -pm755 /etc/apt/keyrings
RUN wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key
RUN wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources
RUN apt update
RUN apt install --install-recommends winehq-stable -y -qq
# Directions for installing wine !!!
# https://github.com/AlexAshs/musicbee-on-linux/blob/main/install_musicbee.sh
RUN winecfg

# https://appdb.winehq.org/objectManager.php?sClass=version&iId=38203
RUN wget 'https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks' -O /usr/local/bin/winetricks
RUN chmod +x /usr/local/bin/winetricks
RUN wineboot --init
RUN wine uninstaller --remove '{E45D8920-A758-4088-B6C6-31DBB276992E}'

# Install .NET 4.0 on XP
RUN winetricks winxp
RUN wget 'https://cdn.dotglitch.dev/bin/dotNetFx40_Full_x86_x64.exe'
RUN wine ./dotNetFx40_Full_x86_x64.exe

# Bump up to Windows 10 for .NET latest
RUN winetricks win10
RUN winetricks --force dotnet48 corefonts

####
####  From this point below, each section is the installation
####  procedure for a windows app that we run.
####

