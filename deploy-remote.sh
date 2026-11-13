#!/usr/bin/env bash
# evanhq 服务器侧发布逻辑 —— 由 deploy.bat 通过 ssh 调用，一般不单独执行
set -euo pipefail

REMOTE_DIR="/opt/xjy"
UPLOAD="/home/ubuntu/xjy.tar.gz"
KEEP_VERSIONS=5
STAMP="$(date +%Y%m%d-%H%M%S)"
RELEASE="${REMOTE_DIR}/releases/${STAMP}"

# 1. 解压到新版本目录并修正属主
sudo mkdir -p "${RELEASE}"
sudo tar -xzf "${UPLOAD}" -C "${RELEASE}"
sudo chown -R ubuntu:ubuntu "${RELEASE}"

# 2. 切换前先验证现有 Nginx 配置
sudo nginx -t

# 3. 首次使用时将普通 dist 目录保留为备份，再原子切换软链
if [ -d "${REMOTE_DIR}/dist" ] && [ ! -L "${REMOTE_DIR}/dist" ]; then
  sudo mv "${REMOTE_DIR}/dist" "${REMOTE_DIR}/releases/dist-before-${STAMP}"
fi
sudo ln -sfn "${RELEASE}" "${REMOTE_DIR}/dist"
sudo systemctl reload nginx

# 4. 清理旧版本，只保留最近 N 个
cd "${REMOTE_DIR}/releases"
ls -1t | tail -n +$((KEEP_VERSIONS + 1)) | xargs -r sudo rm -rf

# 5. 清理临时包
rm -f "${UPLOAD}"

echo "    新版本: ${STAMP}"
echo "    生效路径: $(readlink -f ${REMOTE_DIR}/dist)"
echo "    保留版本:"
ls -1t "${REMOTE_DIR}/releases" | head -n "${KEEP_VERSIONS}" | sed 's/^/      /'
