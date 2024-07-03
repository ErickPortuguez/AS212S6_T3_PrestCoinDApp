# Usar nginx como base
FROM nginx:alpine

# Copiar la carpeta de construcción al directorio correcto para nginx
COPY dist/pib/browser /usr/share/nginx/html

# Exponer el puerto 4200
EXPOSE 4200

# Modificar la configuración de nginx para escuchar en el puerto 4200
RUN echo "server { listen 4200; root /usr/share/nginx/html; index index.html index.htm; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

#docker build -t erickportuguez/pib .
#docker run -p 4200:4200 erickportuguez/pib 
