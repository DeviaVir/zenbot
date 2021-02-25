# Helm Chart for ZenBot

This Helm chart deploys the [ZenBot](https://github.com/DeviaVir/zenbot) crypto trading bot. It installs the MongoDB dependency using the
[Bitnami MongoDB chart](https://bitnami.com/stack/mongodb/helm).

## Configuration

This chart creates its own `conf.js` config file from a template. All the settings are represented in `values.yaml` with their defaults.

To set these variables, **do not edit** the original `values.yaml` but create your own copy of it. Set the values you need to override, such as
the API key for your chosen exchange and other config values, and delete everything else. This will override the defaults where necessary.
Keep your personal values file secret, and pass it to Helm using the `-f` parameter.

## Install

```sh
# Fresh deployment accepting all defaults
helm install -n zenbot zenbot --create-namespace .

# Fresh deployment with some overrides
helm install -n zenbot zenbot --create-namespace -f my-values.yaml .

# Upgrade existing deployment
helm upgrade --install -n zenbot zenbot --create-namespace -f my-values.yaml .
```

## Monitor

You can follow the log output of the ZenBot pod with this command. Hit Ctrl-C to exit.

```
kubectl logs -l app=zenbot -n zenbot -f
```
