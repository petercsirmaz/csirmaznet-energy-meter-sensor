const moment = require('moment');
const P1Reader = require('p1-reader');
const config = require('./config.json');
const loggerModule = require('./utils/logger.js');
const influxModule = require('./targets/influx.js');
const mqttModule = require('./targets/mqtt.js');
const mysqlModule = require('./targets/mysql.js');
const rabbitmqModule = require('./targets/rabbitmq.js');


// Configuration

const logger = loggerModule();
const reader = new P1Reader(config.p1);
const influx = config.influx ? influxModule(config.influx) : null;
const mqtt = config.mqtt ? mqttModule(config.mqtt) : null;
const mysql = config.mysql ? mysqlModule(config.mysql) : null;
const rabbitmq = config.rabbitmq ? rabbitmqModule(config.rabbitmq, logger) : null;
let lastState = null;

// Main loop

reader.on('reading', data => {
    const start = moment();
    const { electricity, gas } = data;
    const { received, delivered } = electricity;
    const { sensorId } = config;

    const eReceived = `${received.actual.reading} ${received.actual.unit}`;
    const eDelivered = `${delivered.actual.reading} ${delivered.actual.unit}`;
    const gasReadings = `${gas.reading} ${gas.unit}`;
    const gasReadingUpdated = lastState ? lastState.gas.timestamp != data.gas.timestamp : true; 
    
    lastState = data;

    logger.log(
        `Data received form sensor (received: ${eReceived}, delivered: ${eDelivered}, gas: ${gasReadings})`);
    if (gasReadingUpdated) { logger.log('Gas reading has updated'); }

    if (influx) {
        Promise.all([
            influx
                .saveElectricity(sensorId, data)
                .then(() => logger.log(
                    'Electricity readings saved to influx database.', 
                    start
                )),
            gasReadingUpdated 
                ? influx
                    .saveGas(sensorId, data)
                    .then(() => logger.log(
                        'Gas readings saved to the influx database.', 
                        start
                    ))
                : Promise.resolve()
        ])
        .then(() => logger.log('Influx operations are finished.', start))
        .catch(e => logger.log(`Influx error: ${e.message}`));         
    }

    if (mqtt) {
        Promise.all([
            mqtt.publishElectricity(sensorId, data)
                .then(() => logger.log(
                    'Electricity readings published on mqtt borker.',
                    start
                )),
            gasReadingUpdated 
                ? mqtt.publishGas(sensorId, data)
                    .then(() => logger.log(
                        'Gas readings published on mqtt borker.',
                        start,
                    ))
                : Promise.resolve()
        ])
        .then(() => logger.log('MQTT operations are finished.', start))
        .catch(e => logger.log(`MQTT error: ${e.message}`));         
    }

    if (mysql) {
        Promise.all([
            mysql.saveElectricity(sensorId, data)
                .then(() => logger.log(
                    'Electricity readings saved to mysql database.', 
                    start
                )),
            gasReadingUpdated 
                ? mysql.saveGas(sensorId, data)
                    .then(() => logger.log(
                        'Gas readings saved to the mysql database.', 
                        start
                        ))
                : Promise.resolve()
        ])
        .then(() => logger.log('MySQL operations are finished.', start))
        .catch(e => logger.log(`MySQL error: ${e.message}`));
    }

    if (rabbitmq) {
        Promise.all([
            rabbitmq.publishElectricity(sensorId, data)
                .then(() => logger.log(
                    'Electricity readings published on RabbitMQ queue.',
                    start
                )),
            gasReadingUpdated 
                ? rabbitmq.publishGas(sensorId, data)
                    .then(() => logger.log(
                        'Gas readings published on RabbitMQ queue.',
                        start,
                    ))
                : Promise.resolve()
        ])
        .then(() => logger.log('RabbitMQ operations are finished.', start))
        .catch(e => logger.log(`RabbitMQ error: ${e.message}`));   
    }
});

reader.on('error', e => log('Error while reading: ' + e));
