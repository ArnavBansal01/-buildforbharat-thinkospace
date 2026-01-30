#!/bin/sh
# Generate env-config.js from environment variables
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
# Iterate over environment variables starting with VITE_
for var in $(env | grep '^VITE_'); do
    key=$(echo "$var" | cut -d '=' -f 1)
    value=$(echo "$var" | cut -d '=' -f 2-)
    echo "  \"$key\": \"$value\"," >> /usr/share/nginx/html/env-config.js
done
echo "}" >> /usr/share/nginx/html/env-config.js

# Execute the passed command (usually "nginx -g daemon off;")
exec "$@"
