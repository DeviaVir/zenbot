# Helm Chart for ZenBot

This chart deploys the [ZenBot](https://github.com/DeviaVir/zenbot) crypto trading bot. It installed the MongoDB dependency using the
[Bitnami MongoDB chart](https://bitnami.com/stack/mongodb/helm).

## Configuration

By default, Zenbot gets all of its config from the `conf.js` file, but every value can also be overridden by setting environment variables.
The `values.yaml` file in this chart contains a copy of every config variable.

We sneakily load `conf-sample.js` into the deployment as this is required to load the environment variables.

To set these variables, **do not edit** the original `values.yaml` but create your own copy of it. Set the values you require and delete everything
else. This will override the defaults where necessary. Pass your customised variable file to Helm using the `-f` parameter.

## Install

```sh
# Fresh deployment accepting all defaults
helm install -n zenbot zenbot --create-namespace .

# Fresh deployment with some overrides
helm install -n zenbot zenbot --create-namespace -f my-values.yaml .

# Upgrade existing deployment
helm upgrade --install -n zenbot zenbot --create-namespace -f my-values.yaml .
```
