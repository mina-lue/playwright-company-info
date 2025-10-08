# https://docs.aws.amazon.com/lambda/latest/dg/nodejs-image.html#nodejs-image-clients
ARG FUNCTION_DIR="/function"

FROM mcr.microsoft.com/playwright:v1.55.0-noble AS build-image
ARG FUNCTION_DIR

RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}

COPY package.json .
RUN npm install

# aws-lambda-runtime-interface-client dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev \
    autoconf \
    libtool \
    python3-setuptools

RUN npm install aws-lambda-ric


FROM mcr.microsoft.com/playwright:v1.55.0-noble AS install-image
ARG FUNCTION_DIR
ARG HANDLER
WORKDIR ${FUNCTION_DIR}

COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}
COPY src src
COPY tsconfig.json .

RUN npx esbuild ./src/registry/script/${HANDLER}.ts \
--outfile=${HANDLER}.js \
--bundle --platform=node --format=cjs


FROM mcr.microsoft.com/playwright:v1.55.0-noble
ARG FUNCTION_DIR
ARG HANDLER
WORKDIR ${FUNCTION_DIR}

COPY --from=install-image ${FUNCTION_DIR}/${HANDLER}.js .
COPY --from=install-image ${FUNCTION_DIR}/node_modules ./node_modules

# dumb-ass fix
RUN echo '{}' > ../package.json

ENTRYPOINT [ "npx", "aws-lambda-ric" ]
