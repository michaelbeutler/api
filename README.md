# API

## Install
Clone this repository into your working folder and run the following commands (i used yarn):
```bash
$ yarn install
$ yarn build
```

Create `.env` file and define all **not** optional variables. (see env variables)
Make api calls to [localhost:3000](http://localhost:3000) with your api client.

## Devlopment
If you want to test your changes localy for the first time run `yarn test` with the enviroment variable `CI = true`. This creates a dummy database insert.

## Enviroment Variables

| **Variable**       | **Description**              | **Type** | **Default** | **Optional** |
|--------------------|------------------------------|----------|-------------|--------------|
| PORT               | Port the api uses            | number   | 3000        | yes          |
| JWT\_TOKEN         | JWT secret                   | string   | \-          | **no**       |
| SALT\_WORK\_LENGTH | Length of the generated salt | number   | 10          | yes          |
| MYSQL\_HOST        | MySQL hostname               | string   | \-          | **no**       |
| MYSQL\_DATABASE    | MySQL database               | string   | \-          | **no**       |
| MYSQL\_USER        | MySQL user                   | string   | \-          | **no**       |
| MYSQL\_PASSWORD    | MySQL password               | string   | \-          | **no**       |

## Endpoint
Each api response is typed strict and uses the `IResponse` interface.
```ts
interface IResponse {
  status: number;
  message: string;
  code?: number;
  documentation?: string;
  payload?: object;
}
```