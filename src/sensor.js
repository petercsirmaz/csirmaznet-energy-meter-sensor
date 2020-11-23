const moment = require('moment');
const P1Reader = require('p1-reader');
const config = require('./config.json');
const loggerModule = require('./utils/logger.js');
const influxModule = require('./targets/influx.js');
const mqttModule = require('./targets/mqtt.js');
const mysqlModule = require('./targets/mysql.js');
const rabbitmqModule = require('./targets/rabbitmq.js');

// Configuration

let lastState = null;
const logger = loggerModule();
const reader = new P1Reader(config.p1);
const handlers = config.targets.map(targetConfig => {
    switch (targetConfig.type) {
        case 'rabbitmq':
            return rabbitmqModule(targetConfig, logger);
        case 'mqtt':
            return mqttModule(targetConfig, logger)
        case 'mysql':
            return mysqlModule(targetConfig, logger);
        case 'influx':
            return influxModule(targetConfig, logger)
        default:
            return null;
    }
});

// Functions

const handle = (sensorId, data, handler, update) => {
    if (!update || update.length === 0) { return; }

    const start = moment();
    const promises = [];

    const { successElectricity, successGas, finished, error } = handler.messages;

    if (update.includes('electricity')) {
        promises.push(
            handler.handleElectricity(sensorId, data)
                .then(() => logger.log(successElectricity, start))
        );
    }

    if (update.includes('gas')) {
        promises.push(
            handler.handleGas(sensorId, data)
            .then(() => logger.log(successGas, start))
        )
    }

    Promise.all(promises)
        .then(() => logger.log(finished, start))
        .catch(e => logger.error(`${error} ${e.message}`)); 
}

// Main loop

logger.log('Listening to reader events...');

reader.on('reading', data => {
    //const start = moment();
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
    const updates = gasReadingUpdated ? [ 'electricity', 'gas' ] : ['electricity'];

    handlers.forEach(handler => {
        if (handler)
            handle(sensorId, data, handler, updates, moment());
    });
});

reader.on('error', e => logger.error('Error while reading: ' + e));
