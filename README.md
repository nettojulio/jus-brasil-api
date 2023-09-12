# JUS BRASIL api

## RESUMO

* API para consulta aos sites de primeira e segunda instância.
  * TJAL
    * 1º grau - <https://www2.tjal.jus.br/cpopg/open.do>
    * 2º grau - <https://www2.tjal.jus.br/cposg5/open.do>
  * TJCE
    * 1º grau - <https://esaj.tjce.jus.br/cpopg/open.do>
    * 2º grau - <https://esaj.tjce.jus.br/cposg5/open.do>

## Execução

### Requerimentos

* Node >= 18.17.1
* Docker Engine ou Docker Desktop
* Executar o projeto `jus-brasil-gateway` para que as requisições sejam feitas (pode ser executado via Docker, projeto ou pelos binários gerados).

### Instalar dependências

```bash
npm i
```

### Run Dev

```bash
npm run start:dev
```

### Testes

```bash
npm run test:e2e
```

### Docker Compose

```bash
# iniciar
$ docker-compose up
```

```bash
# encerrar
$ docker-compose down
```

### Rotas

Por default, a aplicação roda na porta `3000`

* POST

```bash
curl --location 'http://localhost:3000/v1/lawsuit' \
--header 'Content-Type: application/json' \
--data '{
    "lawsuitNumber": "0710802-55.2018.8.02.0001"
}'
```

### Documentação

* [Swagger](http://localhost:3000/swagger)
