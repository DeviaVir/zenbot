# Helm Chart for ZenBot

This Helm chart deploys the [ZenBot](https://github.com/DeviaVir/zenbot) crypto trading bot. It installs the MongoDB dependency using the
[Bitnami MongoDB chart](https://bitnami.com/stack/mongodb/helm).

Kubernetes runs ZenBot as a [Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) rather than a
[Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) so once the ZenBot run comes to an end,
Kubernetes does not try to restart it.

## Configuration

This chart creates its own `conf.js` config file from a template. All the settings are represented in `values.yaml` with their defaults.

To set these variables, **do not edit** the original `values.yaml` but create your own copy of it. Set the values you need to override, such as
the API key for your chosen exchange and other config values, and delete everything else. This will override the defaults where necessary.
Keep your personal values file secret, and pass it to Helm using the `-f` parameter.

## Install

The first install will set up a MongoDB and trigger a ZenBot run.

```sh
# Fresh deployment accepting all defaults - this will run a paper trade
helm install -n zenbot zenbot --create-namespace .

# Fresh deployment with some overrides
helm install -n zenbot zenbot --create-namespace -f my-values.yaml .
```

## Upgrade

Running `helm upgrade` will reconfigure your ZenBot and run a new job, but it won't overwrite MongoDB.

```sh
# Upgrade existing deployment with new values
helm upgrade --install -n zenbot zenbot --create-namespace -f my-values.yaml .
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
