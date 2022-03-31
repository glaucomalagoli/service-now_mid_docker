FROM ubuntu:20.04

RUN mkdir -p /opt && \
    groupadd -g 999 mid && \
    useradd -r -u 999 -g mid mid

RUN apt-get -q update && apt-get install -qy unzip \
    wget vim curl iputils-ping jq && \ 
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/*

ENV HOST "default-host"
ENV HOST_2 "default-host_2"
ENV SN_HOST_NAME ""
ENV SN_HOST_NAME_2 ""
ENV USER_NAME "default-user"
ENV USER_NAME_2 "default-user_2"
ENV PASSWORD "default-password"
ENV PASSWORD_2 "default-password_2"
ENV PROXY ""
ENV PROXY_2 ""
ENV PROXY_PORT ""
ENV PROXY_PORT_2 ""


ARG URL
RUN echo "mid binary url: ${URL}"
# URL is mandatory
RUN test -n "$URL"

ARG VERSION
ENV PIN ${VERSION}
RUN echo "pinned to version: ${VERSION}"

RUN wget --progress=bar:force --no-check-certificate \
    ${URL} -O /tmp/mid.zip && \
    unzip -d /opt /tmp/mid.zip && \
    cp -r /opt/agent /opt/agent2 && \
    chmod -R 755 /opt/* && \
    chown -R mid:mid /opt/* && \
    mv /opt/agent/config.xml /opt/. && \
    rm -rf /tmp/*

RUN /bin/bash -c 'if [[ ! -d "/opt/agent/jre" ]] ; then apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends software-properties-common && \
    add-apt-repository -y ppa:openjdk-r/ppa && \
    apt-get update && \
    apt-get install -y openjdk-8-jre && \
    update-alternatives --config java && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/* && \
    ln -s /usr/lib/jvm/java-8-openjdk-amd64/jre /opt/agent/. \
    ; fi'

# install additional packages
RUN apt-get -q update && \
    apt-get install -qy \
    nmap \ 
    dnsutils \ 
    net-tools \ 
    lsof \
    zip && \ 
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/*

# mitigate CVE-2021-44228 Log4j and remove the JndiLookup class from the core jar
RUN zip -q -d /opt/agent/lib/log4j-core*.jar org/apache/logging/log4j/core/lookup/JndiLookup.class || true

# HEALTHCHECK --interval=15s --retries=6 --timeout=5s --start-period=30s CMD pgrep -af /opt/agent/bin/./wrapper-linux-x86-64 | grep `cat /opt/agent/work/mid.pid` || exit 1 

ADD ./start.sh /opt
RUN chmod +x /opt/start.sh

USER mid

CMD ["/opt/start.sh"]
