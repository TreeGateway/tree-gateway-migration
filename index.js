#!/usr/bin/env node
'use strict';

const _ =  require('lodash');
const YAML = require('yamljs');
const glob = require('glob');
const fs = require('fs-extra');
const ArgumentParser = require('argparse').ArgumentParser;
const packageJson = require('./package.json');

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway Migration Tool',
    version: packageJson.version
});

parser.addArgument(
    ['-f', '--from'],
    {
        help: 'Inform version of the data to be migrated',
        required: true
    }
);
parser.addArgument(
    ['-t', '--to'],
    {
        help: 'Inform target version for the data to be migrated',
        required: true
    }
);

parser.addArgument(
    ['-a', '--api'], {
        help: 'Inform the path to the api config file (JSON or YAML format) to be converted. Supports glob patterns like config/**/*.yaml',
    }
);

parser.addArgument(
    ['-g', '--gateway'], {
        help: 'Inform the path to the gateway config file (JSON or YAML format) to be converted. Supports glob patterns like config/**/*.yaml',
    }
);

let configArgs = parser.parseArgs();

if (configArgs.api) {
    glob(configArgs.api, (err, files) => {
        files.forEach(file => {
            let isYaml = false;
            let api;
            if (file.endsWith('.yaml') || file.endsWith('yml')) {
                isYaml = true;
                api = YAML.load(file);
            } else {
                api = fs.readJSONSync(file);
            }
            api = migrateApiData(api, configArgs.from, configArgs.to);
            if (isYaml) {
                fs.writeFileSync(file, YAML.stringify(api, 15));
            } else {
                fs.writeJSONSync(file, api);
            }
        })
    });
}

if (configArgs.gateway) {
    glob(configArgs.gateway, (err, files) => {
        files.forEach(file => {
            let isYaml = false;
            let gateway;
            if (file.endsWith('.yaml') || file.endsWith('yml')) {
                isYaml = true;
                gateway = YAML.load(file);
            } else {
                gateway = fs.readJSONSync(file);
            }
            gateway = migrateGatewayData(gateway, configArgs.from, configArgs.to);
            if (isYaml) {
                fs.writeFileSync(file, YAML.stringify(gateway, 15));
            } else {
                fs.writeJSONSync(file, gateway);
            }
        })
    });
}

function migrateGatewayData(gateway, from, to) {
    if (from && from.startsWith('2') && to && to.startsWith('3')) {
        if (!gateway.disableStats) {
            gateway.analytics = { enabled: true, logger: { name: 'redis' } };
        }
        gateway = _.omit(gateway, 'statsConfig', 'monitor', 'disableStats');
    }
}

function migrateApiData(api, from, to) {
    if (from && from.startsWith('2') && to && to.startsWith('3')) {
        if (_.has(api, 'proxy.disableStats')) {
            api.disableAnalytics = _.get(api.proxy, 'disableStats');
        }
        if (_.has(api, 'errorHandler')) {
            api.errorHandler = { middleware: _.get(api.proxy, 'errorHandler') };
        }
        if (_.has(api, 'proxy.parseReqBody')) {
            api.parseReqBody = _.get(api.proxy, 'parseReqBody');
        }
        if (_.has(api, 'proxy.parseCookies')) {
            api.parseCookies = _.get(api.proxy, 'parseCookies');
        }
        if (_.has(api, 'proxy.interceptor')) {
            api.interceptor = _.get(api.proxy, 'interceptor');
        }
        return _.omit(api, 'proxy.statsConfig', 'proxy.disableStats',
                                'proxy.parseReqBody', 'proxy.parseCookies',
                                'proxy.interceptor');
    }
    return api
}
