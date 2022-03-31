FROM alpine:3.14.0

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ##
#                                                                            #
#   This Dockerfile is only to refresh the MID docker images                 #
#                                                                            #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ##

RUN apk add --update nodejs \
    npm \
    docker \
    openrc \
    bash && \
    rm -rf /var/cache/apk/*

RUN mkdir /opt/node
WORKDIR /opt/node

COPY docker/ ./docker
COPY package*.json ./

RUN npm install --no-optional && npm cache clean --force

COPY ./app.js .

CMD node app.js
