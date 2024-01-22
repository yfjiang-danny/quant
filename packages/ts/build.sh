image_name=quant
version=latest
docker build -f Dockerfile . --tag ${image_name}:${version}
docker save ${image_name}:${version} | gzip -9 >quant-image.tar.gz