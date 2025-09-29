# Use lightweight Nginx to serve static files
FROM nginx:alpine

# Remove default config and add our own (optional)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website files to Nginx html directory
COPY premier-bank/ /usr/share/nginx/html/

# Cloud Run expects the container to listen on $PORT; map it to Nginx
# Use envsubst at runtime or set listen port in conf to 8080
