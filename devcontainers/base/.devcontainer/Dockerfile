FROM debian:bookworm-slim

# 必要なパッケージのインストール（sudo, bash, curl, git など）
RUN apt-get update && \
    apt-get install -y sudo bash curl git && \
    rm -rf /var/lib/apt/lists/*

# vscodeユーザーの作成
RUN useradd -m -s /bin/bash vscode \
    && echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/vscode \
    && chmod 0440 /etc/sudoers.d/vscode

USER vscode
WORKDIR /home/vscode