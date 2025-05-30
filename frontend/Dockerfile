# Use a imagem oficial do Nginx
FROM nginx:alpine

# Copia os arquivos estáticos para o diretório de serviço do Nginx
COPY . /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx (padrão da imagem)
CMD ["nginx", "-g", "daemon off;"]