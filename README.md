# Prisma Interactive Transactions Error Handling

Investigating error handling in Prisma's `interactiveTransactions` preview feature.

## Binary Engine

Locally testing `CHECK` constraint errors:

1. Boot up a PostgreSQL database containers

```sh
docker compose up
```

2. Install deps

```sh
pnpm i
```

3. Apply migrations and run the tests

```sh
pnpm prisma migrate reset --schema ./schema-binary.prisma
pnpm test
```

Expected:

```
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(Error { kind: Db, cause: Some(DbError { severity: \"ERROR\", parsed_severity: Some(Error), code: SqlState(\"23514\"), message: \"new row for relation \\\"Post\\\" violates check constraint \\\"Post_viewCount_check\\\"\", detail: Some(\"Failing row contains (1, 2022-04-18 12:42:07.239, 2022-04-18 12:42:07.239, Minima nulla ea., null, f, -1, 1).\"), hint: None, position: None, where_: None, schema: Some(\"public\"), table: Some(\"Post\"), column: None, datatype: None, constraint: Some(\"Post_viewCount_check\"), file: Some(\"execMain.c\"), line: Some(2003), routine: Some(\"ExecConstraints\") }) }) })"
```

Received:

```
 ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(Error { kind: Db, cause: Some(DbError { severity: \"ERROR\", parsed_severity: Some(Error), code: SqlState(\"25P02\"), message: \"current transaction is aborted, commands ignored until end of transaction block\", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some(\"postgres.c\"), line: Some(1718), routine: Some(\"exec_bind_message\") }) }) })"
```
