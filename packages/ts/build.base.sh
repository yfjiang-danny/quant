image_name=quant
version=base
docker build -f Dockerfile.base . --tag ${image_name}:${version}