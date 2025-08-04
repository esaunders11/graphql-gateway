# GraphQL Gateway

A lightweight, high-performance GraphQL Gateway built with JavaScript. This project serves as a single entry point for multiple GraphQL services, enabling seamless API composition and federation.

## Features

- **API Gateway:** Route and aggregate queries to underlying GraphQL services.
- **Service Stitching:** Combine multiple GraphQL schemas into a unified interface.
- **Extensible:** Easily add or remove backend services.
- **Performance-Oriented:** Built with efficiency and scalability in mind.
- **Docker Support:** Deploy anywhere with the provided Dockerfile.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (optional, for containerization)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/esaunders11/graphql-gateway.git
   cd graphql-gateway
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

### Running Locally

```sh
npm start
# or
yarn start
```

By default, the server will start at `http://localhost:4000/graphql`. You can change the port or other configs in the environment variables or config files.

### Docker

To build and run using Docker:

```sh
docker build -t graphql-gateway .
docker run -p 4000:4000 graphql-gateway
```

## Configuration

Configuration details (such as service endpoints, ports, etc.) can be set via environment variables or configuration files. See the `config` directory or sample `.env.example` for guidance.

## Usage

Once running, you can send GraphQL queries to the gateway endpoint:

```
POST http://localhost:4000/graphql
```

You may use tools like [GraphQL Playground](https://github.com/graphql/graphql-playground) or [Apollo Studio](https://studio.apollographql.com/) for exploration.



## License

This project is licensed under the MIT License.

---

**Author:** [esaunders11](https://github.com/esaunders11)
