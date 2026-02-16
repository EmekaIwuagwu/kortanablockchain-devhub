#!/bin/bash
# Setup Nginx and SSL for Kortana Node
set -e

if [[ $EUID -ne 0 ]]; then
   echo "Please run as root/sudo"
   exit 1
fi

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "Usage: sudo ./setup_domain.sh yourdomain.com"
    exit 1
fi

echo "--- Installing Nginx and Certbot ---"
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "--- Configuring Nginx ---"
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8545;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Standard RPC headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "--- Requesting SSL Certificate via Let's Encrypt ---"
# This will handle the SSL handshake and auto-update Nginx config
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || echo "Certbot failed. Ensure your DNS is pointed to this IP!"

echo "--- Finalizing Firewall ---"
ufw allow 'Nginx Full'

echo "===================================================="
echo " ✅ SUCCESS: Kortana Node is now available at:"
echo " https://$DOMAIN"
echo "===================================================="
