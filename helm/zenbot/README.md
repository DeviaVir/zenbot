# Helm Chart for ZenBot

>This chart is very basic without many configuration options. It's an umbrella chart which has a dependency to the mongodb chart from Bitnami.

## Configuration

Copy the **conf-sample.js** file in *helm/zenbot/resources* to **conf.js**. This hasn't changed from the normal conf.js file.

## Setup

Configure your values.yaml file to match your settings (MongoDB User, PW, DB etc.)

### Persistence
For MongoDB you can choose if persistence is enabled. At the moment you it is not possible to disable persistence for the ZenBot part.

