image_name=quant
version=latest
docker build -f Dockerfile . --tag ${image_name}:${version}