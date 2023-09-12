docker-build:
	@docker build -t nettojulio/jus-brasil-crawler .

docker-up:
	@docker-compose up

docker-down:
	@docker-compose down