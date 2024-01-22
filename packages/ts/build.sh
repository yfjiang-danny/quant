image_name=quant
version=latest
image_file_name=quant-image.tar.gz
docker build -f Dockerfile . --tag ${image_name}:${version}
rm -fr *.tar.gz
docker save ${image_name}:${version} | gzip -9 >${image_file_name}