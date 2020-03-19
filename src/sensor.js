const os = require('os');
const Influx = require('influx');
const P1Reader = require('p1-reader');
const config = require('./config.json');

// Configuration

const reader = new P1Reader(config.p1);
const influx = new Influx.InfluxDB({
    host: config.influx.host,
    database: config.influx.database,
    schema: [
        {
            measurement: config.influx.measurement.electricity,
            fields: {
                received_tariff1: Influx.FieldType.FLOAT,
                received_tariff2: Influx.FieldType.FLOAT,
                received_actual: Influx.FieldType.FLOAT,
                delivered_tariff1: Influx.FieldType.FLOAT,
                delivered_tariff2: Influx.FieldType.FLOAT,
                delivered_actual: Influx.FieldType.FLOAT,
                tariff_indicator: Influx.FieldType.INTEGER,
                number_of_power_failures: Influx.FieldType.INTEGER,
                number_of_long_power_failures: Influx.FieldType.INTEGER,
                switch_position: Influx.FieldType.INTEGER,
            },
            tags: [ 'sensor_id', 'sensor_os', 'sensor_ip', 'device_type', 'equipment_id' ]
        },
        {
            measurement: config.influx.measurement.gas,
            fields: {
                reading: Influx.FieldType.FLOAT
            },
            tags: ['sensor_id', 'sensor_os', 'sensor_ip', 'device_type', 'equipment_id' ]
        }
    ]
})

// Functions

const saveElectricity = data => {
    return new Promise((resolve, reject) => {
        influx.writePoints([
            {
                measurement: config.influx.measurement.electricity,
                tags: { 
                    sensor_id: config.sensorId,
                    sensor_os: os.hostname(),
                    device_type: data.meterType,
                    equipment_id: data.equipmentId
                },
                fields: { 
                    received_tariff1: data.received.tariff1.reading,
                    received_tariff2: data.received.tariff2.reading,
                    received_actual: data.received.actual.reading,
                    delivered_tariff1: data.delivered.tariff1.reading,
                    delivered_tariff2: data.delivered.tariff2.reading,
                    delivered_actual: data.delivered.actual.reading,
                    tariff_indicator: data.tariffIndicator,
                    number_of_power_failures: data.numberOfPowerFailures,
                    number_of_long_power_failures: data.numberOfLongPowerFailures,
                    switch_position: data.switchPosition,
                },
            }
        ])
        .then(resolve)
        .catch(reject)
    })
};

const saveGas = data => {
    return new Promise((resolve, reject) => {
        influx.writePoints([
            {
                measurement: config.influx.measurement.gas,
                tags: { 
                    sensor_id: config.sensorId,
                    sensor_os: os.hostname(),
                    device_type: data.meterType,
                    equipment_id: data.equipmentId
                },
                fields: { 
                    reading: data.reading
                },
            }
        ])
        .then(resolve)
        .catch(reject)
    });
}

const getTimeFromDate = date => {
    if (!date) { return '--:--:--'; }
    const formatValue = value => value < 10 ? '0' + value : value;
    return formatValue(date.getHours()) + ':' + 
        formatValue(date.getMinutes()) + ':' +
        formatValue(date.getSeconds()); 
}

const log = (message, date) => {
    const nowDate = new Date();
    const logMessage = '[' + getTimeFromDate(nowDate) + '] ' + message;
    console.log(date 
        ? logMessage + ' (' + (nowDate - refDate) + ' ms)'
        : logMessage
    );
}

// Main loop

reader.on('reading', data => {
    const start = new Date();
    Promise.all([
        saveElectricity(data.electricity)
            .then(() => log('Electricity readings saved to the database.', start)),
        saveGas(data.gas)
            .then(() => log('Gas readings saved to the database.', start))
     ])
     .then(() => log('Operations finished.', start))
     .catch(e => log(e.message));         
});

reader.on('error', e => log('Error while reading: ' + e));
