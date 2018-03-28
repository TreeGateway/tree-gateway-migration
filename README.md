A Migration tool for old [Tree Gateway](https://github.com/Leanty/tree-gateway) configurations.

```sh
npm install -g tree-gateway-migration
```

And run the `treeGatewayMigration` command pointing to your old configuration files.

To convert all API yaml files under a specific folder run:

```sh
treeGatewayMigration --from 2 --to 3 --api ./myfolder/**/*.yaml
```

To convert the config files for the gateway, run:

```sh
treeGatewayMigration --from 2 --to 3 --gateway ./gateway.yaml
```

This tool supports, at the moment, only migrations between version 2 to 3.