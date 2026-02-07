#!/bin/bash
URL=$1
PORT=$2

# Extract Environment ID from path-based URL (e.g., https://domain.com/env/ID/rpc)
ENV_ID=$(echo $URL | sed 's/.*\/env\/\([^\/]*\)\/rpc/\1/')

# Add location block to the dynamic Nginx config
cat <<EOF > /etc/nginx/conf.d/env_$ENV_ID.conf
location /env/$ENV_ID/rpc {
    proxy_pass http://localhost:$PORT/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
}
EOF

nginx -s reload || service nginx reload
