# Repository Scanner Frontend (RESC-Frontend)
[![Vue.js][vuejs-shield]][vuejs-url]
[![PrimeVue][primevue-shield]][primevuevue-url]
[![Chart.js][chartjs-shield]][chartjs-url]
[![CI][ci-shield]][ci-url]
[![OpenSSF Scorecard][ossf-shield]][ossf-url]
[![SonarCloud][sonar-cloud-shield]][sonar-cloud-url]

> [!NOTE]  
> ## This component is part of Repository Scanner - [resc](https://github.com/abnamro/repository-scanner)


> [!IMPORTANT]  
> ## DO NOT INSTALL resc-frontend VIA NPM. we do not publish this package there. Only the docker image is a valid and safe way to use/install the frontend.

<!-- TABLE OF CONTENTS -->
## Table of contents
1. [About the component](#about-the-component)
2. [Technology stack](#technology-stack)
3. [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Run locally](#run-locally)
    - [Run using docker](#run-using-docker)
    - [Enable or disable Single Sign-On for local run](#enable-or-disable-single-sign-on-for-local-run)
    - [Testing](#testing)
4. [Additional information](#additional-information)

<!-- ABOUT THE COMPONENT -->
## About the component
Repository Scanner (RESC) Frontend is a fully responsive dashboard application developed using Vue.js 3 and PrimeVue framework. It includes such screens as Analytics, Repositories, Scan Findings, Rule Analytics, and Rule Pack.

<!-- TECHNOLOGY STACK -->
## Technology stack
- [Vue js 3](https://vuejs.org/)
- [PrimeVue Vue](https://primevue.org/)
- [Docker](https://www.docker.com/)

<!-- GETTING STARTED -->
## Getting started

These instructions will help you to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- Install [Node.js](https://nodejs.org/en/) v16.17.0
- Install Vue cli using command: `npm install -g @vue/cli`  
- Install Vetur, ESLint and Prettier extensions to your VSCode IDE. 
- Install [Docker](https://www.docker.com/)
- Ensure RESC webservice is up and running in order to visualize data. This API is running at http://localhost:30800/.  

### Run locally

1. Clone the repository and refer the following steps to run the project locally.
```bash

cd components/resc-frontend

npm install

npm run serve
```
2. Access the application using this url: http://localhost:8080/  

***Note:***  Replace the actual values in the placeholders <branch-name> and <repository-scanner repo url>

### Run using Docker

Build the RESC Frontend Docker image locally by running the following commands.

- Pull the docker image from registry: 
```bash
docker pull rescabnamro/resc-frontend:latest
```
- Alternatively, build the docker image locally by running:
```bash
docker build -t rescabnamro/resc-frontend:latest .
```
- Run the RESC frontend by using the following command: 

```bash
docker run -p 8080:8080 -e VITE_AUTHENTICATION_REQUIRED="false" -e VITE_RESC_WEB_SERVICE_URL="http://localhost:30800/resc"  --name resc-frontend rescabnamro/resc-frontend:latest
```

 Access the application using this url: http://localhost:8080/

### Enable or disable Single Sign-On for local run
To enable/disable single sign-on (SSO) set the following values in .env.development file.
    
Enable SSO:```VITE_AUTHENTICATION_REQUIRED=true```
    
Disable SSO:```VITE_AUTHENTICATION_REQUIRED=false```
    
Note: Ensure to restart the server by running npm run serve for the change to take effect.    
    
### Testing
[(Back to top)](#table-of-contents)

Run your unit tests: ```npm run ut```

Linting files: ```npm run lint```

Linting and fixing files: ```npm run lint:autofix```

## Additional information
[(Back to top)](#table-of-contents)  

### Useful commands
Compiles and minifies for production: ```npm run build```


<!-- MARKDOWN LINKS & IMAGES -->
[vuejs-shield]: https://img.shields.io/badge/VueJS-%2335495e.svg?style=flat&logo=vuedotjs&logoColor=%234FC08D
[vuejs-url]: https://vuejs.org
[primevue-shield]: https://img.shields.io/badge/PrimeVue-%25238511FA.svg?style=flat&logo=primevue&logoColor=white
[primevue-url]: https://primevue.org/
[chartjs-shield]: https://img.shields.io/badge/Chart.js-F5788D.svg?style=flat&logo=chart.js&logoColor=white
[chartjs-url]: https://www.chartjs.org
[ci-shield]: https://img.shields.io/github/actions/workflow/status/abnamro/repository-scanner/frontend-ci.yaml?logo=github
[ci-url]: https://github.com/abnamro/repository-scanner/actions/workflows/frontend-ci.yaml
[sonar-cloud-shield]: https://sonarcloud.io/api/project_badges/measure?project=abnamro-resc_resc-frontend&metric=alert_status
[sonar-cloud-url]: https://sonarcloud.io/summary/new_code?id=abnamro-resc_resc-frontend
[ossf-shield]: https://api.securityscorecards.dev/projects/github.com/abnamro/resc-frontend/badge
[ossf-url]: https://securityscorecards.dev/viewer/?uri=github.com/abnamro/resc-frontend
