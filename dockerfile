FROM node:10-alpine

## Set default app port and directory
ENV PROJECT_DIR=/app \
   PUBSUB_TEST_PORT=80

WORKDIR ${PROJECT_DIR}   

COPY package.json package-lock.json $PROJECT_DIR/

## Install app dependencies for production
RUN npm install --production && \
  npm cache clean --force

## Bundle app source
COPY . ${PROJECT_DIR}

# Without curl,the app won't be able to deploy
RUN apk update && \
	apk add --no-cache curl && \
	apk add --no-cache bash

## ADDING glibC for PACT tests and directly remove dependant libraries after that
RUN apk add --no-cache git zip wget ca-certificates && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub \
    https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.27-r0/glibc-2.27-r0.apk && \
    apk add glibc-2.27-r0.apk

## Remove not-needed libraries
RUN apk del git zip wget ca-certificates

## Expose port
EXPOSE ${PUBSUB_TEST_PORT}

## Healtcheck
HEALTHCHECK CMD curl http://localhost:${PUBSUB_TEST_PORT}/arrowping.json || exit 1

## CMD is not accepted only ENTRYPOINT
ENTRYPOINT [ "./start_app.sh" ]
