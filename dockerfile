FROM ubuntu:18.04
WORKDIR /home/node

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    apt-utils

RUN apt-get install -y \
    curl \
    nano \
    unzip \
    zip \
    libaio1

# Node js

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN bash -c "source ~/.nvm/nvm.sh && nvm install 16 && npm i -g nodemon pm2"

# Oracle instantclient

COPY ./oracle/instantclient-basic-linux.x64-12.2.0.1.0.zip \
    /tmp/
    # ./oracle/instantclient-sdk-linux.x64-12.2.0.1.0.zip \
    # ./oracle/instantclient-sqlplus-linux.x64-12.2.0.1.0.zip /tmp/

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient
ENV ORACLE_HOME=/opt/oracle/instantclient

# RUN mkdir /opt/oracle
RUN unzip -o /tmp/instantclient-basic-linux.x64-12.2.0.1.0.zip -d /opt/oracle/
# RUN unzip -o /tmp/instantclient-sdk-linux.x64-12.2.0.1.0.zip -d /opt/oracle/
# RUN unzip -o /tmp/instantclient-sqlplus-linux.x64-12.2.0.1.0.zip -d /opt/oracle/

RUN rm -f /tmp/*

RUN ln -s /opt/oracle/instantclient_12_2 /opt/oracle/instantclient
RUN ln -s /opt/oracle/instantclient/libocci.so.* /opt/oracle/instantclient/libocci.so
RUN ln -s /opt/oracle/instantclient/libclntsh.so.* /opt/oracle/instantclient/libclntsh.so
RUN ln -s /opt/oracle/instantclient/libclntshcore.so.* /opt/oracle/instantclient/libclntshcore.so
# RUN ln -s /opt/oracle/instantclient/sqlplus /usr/bin/sqlplus

RUN echo 'export LD_LIBRARY_PATH="/opt/oracle/instantclient"' >> /root/.bashrc && \
    echo 'export ORACLE_HOME="/opt/oracle/instantclient"' >> /root/.bashrc
    # echo 'umask 002' >> /root/.bashrc