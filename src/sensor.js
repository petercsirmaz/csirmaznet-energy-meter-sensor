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

    const eReceived = data.electricity.received.actual.reading + ' ' + data.electricity.received.actual.unit;
    const eDelivered = data.electricity.delivered.actual.reading + ' ' + data.electricity.delivered.actual.unit;
    const gasReadings = data.gas.reading + ' ' + data.gas.unit;

    logger.log('Data received form sensor (received: ' + eReceived + ', delivered: ' + eDelivered + ', gas: ' + gasReadings + ')');

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
            mqtt.publishElectricity(data.electricity, data.timestamp)
                .then(() => logger.log(
                    'Electricity readings published on mqtt borker.',
                    start
                )),
            mqtt.publishGas(data.gas)
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
