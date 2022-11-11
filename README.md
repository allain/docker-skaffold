# docker-skaffold

Sets up and tears down docker-compose skaffolding around any command.

Useful for writing integration tests that involve setting up database or other containers.

## Usage

```bash
# bring up and tear down docker environment from docker-compose.yml file in same directory
npx docker-skaffold -- echo hello

# or
npm install docker-skaffold
docker-skaffold -- echo hello
```

## Features

docker-compose arguments passthrough:

```bash 
docker-skaffold --project-name=test --file ./path/to/docker-compose.yml -- echo hello`
```

automatically detect if `docker-compose` or `docker compose` should be used.

passes through exit codes from wrapped command

