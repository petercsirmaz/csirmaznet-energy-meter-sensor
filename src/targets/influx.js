const os = require('os');
const Influx = require('influx');

module.exports = (config) => {
    const influx = new Influx.InfluxDB({
        host: config.host,
        database: config.database,
        schema: [
            {
                measurement: config.measurement.electricity,
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
                measurement: config.measurement.gas,
                fields: {
                    reading: Influx.FieldType.FLOAT
                },
                tags: ['sensor_id', 'sensor_os', 'sensor_ip', 'device_type', 'equipment_id' ]
            }
        ]
    });
    
    const saveGas = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const hostname = os.hostname();
            const { gas, equipmentId, meterType } = data;
            influx.writePoints([
                {
                    measurement: config.measurement.gas,
                    tags: { 
                        sensor_id: sensorId,
                        sensor_os: hostname ? hostname : 'N/A',
                        device_type: meterType,
                        equipment_id: equipmentId
                    },
                    fields: { 
                        reading: gas.reading
                    },
                }
            ])
            .then(resolve)
            .catch(reject)
        });
    }

    const saveElectricity = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const hostname = os.hostname();
            const { equipmentId, meterType, electricity } = data;
            const { received, delivered, numberOfPowerFailures, 
                numberOfLongPowerFailures, switchPosition } = electricity;

            influx.writePoints([
                {
                    measurement: config.measurement.electricity,
                    tags: { 
                        sensor_id: sensorId,
                        sensor_os: hostname ? hostname : 'N/A',
                        device_type: meterType,
                        equipment_id: equipmentId
                    },
                    fields: { 
                        received_tariff1: received.tariff1.reading,
                        received_tariff2: received.tariff2.reading,
                        received_actual: received.actual.reading,
                        delivered_tariff1: delivered.tariff1.reading,
                        delivered_tariff2: delivered.tariff2.reading,
                        delivered_actual: delivered.actual.reading,
                        tariff_indicator: tariffIndicator,
                        number_of_power_failures: numberOfPowerFailures,
                        number_of_long_power_failures: numberOfLongPowerFailures,
                        switch_position: switchPosition,
                    },
                }
            ])
            .then(resolve)
            .catch(reject)
        })
    };

    return {
        saveElectricity: saveElectricity,
        saveGas: saveGas
    }
}