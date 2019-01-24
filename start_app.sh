#!/bin/bash -x

# redirect all logs to STDOUT
if [[ "$RUNTIME_ENV" == "local" ]] ; then
    echo 'Logs redirected to stdout'
    exec npm start
fi

# command to retrieve the containerId inside docker container
CONTAINID=$(cat /proc/1/cgroup | grep 'docker/' | tail -1 | sed 's/^.*\///' | cut -c 1-12)

# replace the fake "serverId" with the real container id
if [ ! -z $CONTAINID ]; then
    ARROWCLOUD_APP_LOG_DIR=$(echo ${ARROWCLOUD_APP_LOG_DIR} | sed "s/serverId/${CONTAINID}/")
    export serverId=${CONTAINID}
fi

# ARROWCLOUD_APP_LOG_DIR is configured by ArrowCloud
APP_LOG_DIR="/ctdebuglog/${ARROWCLOUD_APP_LOG_DIR}"
APP_DEBUG_LOG_DIR="${APP_LOG_DIR}/debug"
APP_REQUESTS_LOG_DIR="${APP_LOG_DIR}/requests"
mkdir -p "${APP_DEBUG_LOG_DIR}"
if [ $? -ne 0 ]; then
    echo "Failed to create ${APP_DEBUG_LOG_DIR}"
    exit 1
fi
 
mkdir -p "${APP_REQUESTS_LOG_DIR}"
if [ $? -ne 0 ]; then
    echo "Failed to create ${APP_REQUESTS_LOG_DIR}"
    exit 1
fi
 
# make a symbolic link from ${APP_REQUESTS_LOG_DIR} to /ctlog to satisfy appc-logger
ln -sf ${APP_REQUESTS_LOG_DIR} /ctlog
if [ $? -ne 0 ]; then
    echo "Failed to create link from ${APP_REQUESTS_LOG_DIR} to /ctlog"
    exit 1
fi

STDOUT_LOG_FILE="${APP_DEBUG_LOG_DIR}/stdout.log"
STDERR_LOG_FILE="${APP_DEBUG_LOG_DIR}/stderr.log"
 
# curl is used for health-check when creating docker service for an app.
curl >/dev/null 2>&1
if [ $? -eq 127 ]; then
    echo "curl not found! App image must include curl for health-check purpose." >> ${STDOUT_LOG_FILE} 2>>${STDERR_LOG_FILE}
    exit 1
fi
 
# Start your application and capture your stderr and stdout outputs
exec npm start >> ${STDOUT_LOG_FILE} 2>>${STDERR_LOG_FILE}
