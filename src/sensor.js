const P1Reader = require('p1-reader');
const config = require('./config.json');
const loggerModule = require('./utils/logger.js');
const influxModule = require('./targets/influx.js');
const mqttModule = require('./targets/mqtt.js');

// Configuration

const reader = new P1Reader(config.p1);
const influx = config.influx ? influxModule(config.influx) : null;
const mqtt = config.mqtt ? mqttModule(config.mqtt) : null;
const logger = loggerModule();

// Main loop

reader.on('reading', data => {
    const start = new Date();

    if (influx) {
        Promise.all([
            influx.saveElectricity(config.sensorId, data.electricity)
                .then(() => logger.log(
                    'Electricity readings saved to influx database.', 
                    start
                )),
            influx.saveGas(config.sensorId, data.gas)
                .then(() => logger.log(
                    'Gas readings saved to the influx database.', 
                    start
                    ))
        ])
        .then(() => logger.log('Influx operations are finished.', start))
        .catch(e => logger.log(e.message));         
    }

    if (mqtt) {
        Promise.all([
            mqtt.publishElectricity(config.sensorId, data.electricity, data.timestamp)
                .then(() => logger.log(
                    'Electricity readings published on mqtt borker.',
                    start
                )),
            mqtt.publishGas(config.sensorId, data.gas)
                .then(() => logger.log(
                    'Gas readings published on mqtt borker.',
                    start,
                ))
        ])
        .then(() => logger.log('Mqtt operations are finished.', start))
        .catch(e => logger.log(e.message));         
    }
});

reader.on('error', e => log('Error while reading: ' + e));
