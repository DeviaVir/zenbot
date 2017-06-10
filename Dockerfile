FROM node:latest
RUN apt update
RUN apt install -y python-pip  python-dev graphviz libgraphviz-dev pkg-config
RUN PKG_CONFIG_ALLOW_SYSTEM_LIBS=OHYESPLEASE pip install pygraphviz
ADD . /app
WORKDIR /app
RUN pip install -r /app/zen/requirements.txt

RUN npm install
RUN npm update
