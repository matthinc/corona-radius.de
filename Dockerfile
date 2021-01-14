FROM golang:1.14

WORKDIR /app

COPY . .
RUN go get .
RUN go build -o app main.go

CMD ["./app"]
