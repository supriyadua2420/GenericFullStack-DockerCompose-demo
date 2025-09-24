FROM node:18-alpine

ENV MONGO_USERNAME=admin \
    MONGO_PASSWORD=password

RUN mkdir -p /home/app

COPY ./app /home/app

# set default dir so that next commands executes in /home/app dir
WORKDIR /home/app

# will execute npm install in /home/app because of WORKDIR
RUN npm install

# Expose port
EXPOSE 3000

# no need for /home/app/server.js because of WORKDIR
CMD ["node", "/home/app/server.js"]


