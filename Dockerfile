FROM docker.io/nginx
MAINTAINER Jc  <juan.marquez@credicard.com.ve>
ENV TZ America/La_Paz
ADD ./Target/default.conf /etc/nginx/conf.d
ADD ./Target/nginx.conf /etc/nginx
ADD ./Target/nginx/lcsdevappmasterprueba01.credicard.com.key /etc/nginx/conf.d
ADD ./Target/nginx/lcsdevappmasterprueba01.credicard.com.ve.pem /etc/nginx/conf.d
COPY ./dist/* /usr/share/nginx/html
