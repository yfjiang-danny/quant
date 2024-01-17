FROM quant:base

WORKDIR /opt/quant

COPY ./ ./
RUN npm run build

CMD [ "npm", "run", "start" ]