# Docker

You can pull the image
```shell
docker pull learningtapestry/wicked_pdf
```

Or build it
```shell
docker buildx build --platform linux/arm64/v8,linux/amd64 -t learningtapestry/wicked_pdf --push .
```
