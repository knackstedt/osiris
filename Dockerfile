FROM node:16

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



