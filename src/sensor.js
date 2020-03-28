const P1Reader = require('p1-reader');
const config = require('./config.json');
const influxModule = require('./targets/influx.js');
const loggerModule = require('./utils/logger.js');

// Configuration

const reader = new P1Reader(config.p1);
const influx = config.influx ? influxModule(config.influx) : null;
const logger = loggerModule();

// Main loop

reader.on('reading', data => {
    const start = new Date();

    if (influx) {
        Promise.all([
            influx.saveElectricity(config.sensorId, data.electricity)
                .then(() => logger.log(
                    'Electricity readings saved to the database.', 
                    start
                )),
            influx.saveGas(config.sensorId, data.gas)
                .then(() => logger.log(
                    'Gas readings saved to the database.', 
                    start
                    ))
        ])
        .then(() => logger.log('Operations finished.', start))
        .catch(e => logger.log(e.message));         
    }
});

reader.on('error', e => log('Error while reading: ' + e));
