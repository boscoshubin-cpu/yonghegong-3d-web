FROM node:20-alpine

WORKDIR /app

COPY package.json server.cjs index.html style.css app.js architecture.js visuals.js ui.js halls.js cushion.js fate.js world.js ./
COPY vendor ./vendor
COPY assets ./assets
COPY models ./models

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=18766

EXPOSE 18766

USER node

CMD ["node", "server.cjs"]
