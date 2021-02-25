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
```

## Upgrade

```sh
# Upgrade existing deployment with new values
helm upgrade --install -n zenbot zenbot --create-namespace -f my-values.yaml .

# Restart Zenbot after deploying new config
kubectl delete pods -l app=zenbot -n zenbot
```

## Monitor

You can follow the log output of the ZenBot pod with this command. Hit Ctrl-C to exit.

```sh
kubectl logs -l app=zenbot -n zenbot -f
```

There will also be a web service listening on port 17365, unless overridden.
You can get by the IP by doing:

```sh
kubectl get service zenbot
```
