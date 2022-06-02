FROM node:14 AS uiauto-web-complie
WORKDIR /app
COPY . /app
RUN npm -v
RUN rm -rf package-lock.json
RUN npm config set registry https://registry.npm.taobao.org/
RUN npm install
# 修改g6Editor源代码(解决部分快捷键失效问题)
COPY g6Editor.js /app/node_modules/@antv/g6-editor/build/g6Editor.js
# 修改时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
RUN npm run build:prod
FROM nginx:1.21.3
VOLUME /tmp
ENV LANG en_US.UTF-8
WORKDIR /app
COPY nginx.conf /app/nginx.conf
RUN cat /app/nginx.conf > /etc/nginx/nginx.conf &&  mkdir  -p  /var/www &&  mkdir -p /var/www/html
COPY --from=uiauto-web-complie /app/dist/ /var/www/html
EXPOSE 80
EXPOSE 443
