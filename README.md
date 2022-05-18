![](./doc/badges/coverage.svg)
# Uni-verse API
Uni-verse is a platform allowing music creators to share both their content and their resources. 

This API serves for business rules, and is used aas main API as opposed to a microservice architecture. 

It communicates with another tinier API for fingerprinting purposes, and with 3 clients
## Documentation

### UML
![UML](doc/assets/UML.png)

### Routes
Routes are documented automatically using Swagger.

Documentation can be found at [https://uni-verse.api.vagahbond.com/docs/](https://uni-verse.api.vagahbond.com/docs/)
## Setup

### Requirements
* Docker
* docker-compose

### Run
To setup locally:
* Clone this repository
* Fill env file according to your needs
* Run `docker-compose up`.


## Production
Production is automaticaly updated thanks to the CI pipeline.

It runs on a self hosted Kubernetes cluster. So far, we use a subdomain of vagahbond.com for money reasons.

The url is [uni-verse.api.vagahbond.com](uni-verse.api.vagahbond.com)

The pipeline builds a docker image that it sends to a private registry. 
Then, production pods that are restarted will pull the latest version of the api.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage and coverage badge generation
$ npm run test:cov
```
