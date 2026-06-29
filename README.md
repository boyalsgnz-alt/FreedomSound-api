# FreedomSound API

The API to supplement the [FreedomSound iOS App](https://github.com/boyalsgnz-alt/FreedomSound). Written in TypeScript with [NestJS](https://nestjs.com/) framework.

## Description

What it does for now:
- Gets your likes from your favorite music streaming app (you'll have to implement & wire this part yourself) and put them in a MySQL database
- Tries to sync your local files with the liked songs from the streaming platform, linking the local path to the track
- Allows you to "tag" tracks, for example giving them more than 1 genre/subgenre, adding "moods"
- Generate playlists on the fly as [.m3u files](https://en.wikipedia.org/wiki/M3U) based on your criteria

More things will be added in the future!

Of course, your local files **must** have been obtained via totally legal means.

## Project setup

### Via Docker/Docker Compose

The recommended way of running this project is via [Docker](https://www.docker.com/), more specifically via [Docker Compose](https://docs.docker.com/compose/).

Rename the template `docker-compose 1.yml` file to `docker-compose.yml` and replace the fields marked with `# <- to be replaced`. Also rename the `.env-1` file to `.env` and fill in the blanks. Then:

```shell
docker compose up -d
```
It launches 3 containers:
- a MySQL instance
- an Adminer instance (optional)
- the API itself

This should work as-is. Of course, the modification/enhancement of this docker-compose is at your convenience.

### API Only

You can also run the API as a "standalone", which would be better if you plan to do modifications on the API. Of course, being a NestJS API, you'll still need [Node.js](https://nodejs.org/en) on the target machine.
Then:

```shell
npm i
npm run dev:start
```

This also means you'll have to have your own MySQL instance running, whether on your local machine or as a Docker container. If you chose this method, I'll assume you know what you're doing and you can wire it all together yourself.

## Documentation

I aim to have 2 forms of documentation:
- *in-code*, for anything that isn't a **route**
- an auto-generated, self-managed endpoints documentation (thanks NestJS!!)

The endpoints documentation is directly accessible on the `{root_url}/api-docs` endpoint of the API itself.