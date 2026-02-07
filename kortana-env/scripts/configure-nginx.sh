#!/bin/bash
URL=$1
PORT=$2

# Extract Hostname from the URL
HOSTNAME=$(echo $URL | sed 's/https:\/\///' | sed 's/\///')

cat <<EOF > /etc/nginx/sites-available/$HOSTNAME
server {
    listen 80;
    server_name $HOSTNAME;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$HOSTNAME /etc/nginx/sites-enabled/
nginx -s reload || service nginx reload
