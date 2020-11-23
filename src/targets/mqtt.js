const mqtt = require('mqtt');

module.exports = (config, logger) => {
    const url = `${config.protocol}://${config.host}:${config.port}`;
    client = mqtt.connect(url);

    client.on('connect', () => {
        logger.log(`MQTT: connected to ${url}`);
    })

    client.on('reconnect', () => {
        logger.log(`MQTT: reconnected to ${url}`);
    })

    client.on('error', () => {
        logger.log(`MQTT: connection error`);
    })

    client.on('disconnect', () => {
        logger.log(`MQTT: disconnected, trying to reconnect...`);
        client.reconnect();
    });

    client.on('offline', () => {
        logger.log(`MQTT: client went offline, trying to reconnect...`);
        client.reconnect();
    });
    
    const handleElectricity = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const { timestamp, electricity } = data;
            const { received, delivered } = electricity;
            
            try {
                client.publish(
                    config.topics.electricity, 
                    JSON.stringify({
                        sensorId: sensorId,
                        timestamp: timestamp,
                        received: received,
                        delivered: delivered
                }));
                resolve();
            } catch (e) { reject(e); }
        });       
    }

    const handleGas = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            const { timestamp, reading } = data.gas;
            
            try {
                client.publish(
                    config.topics.gas, 
                    JSON.stringify({
                        sensorId: sensorId,
                        timestamp: timestamp,
                        reading: reading
                    }));
                resolve();
            } catch (e) { reject(e); }
        });       
    }

    return {
        name: 'MQTT',
        messages: {
            successElectricity: 'Electricity readings published on MQTT broker.',
            successGas: 'Gas readings published on MQTT broker.',
            finished: 'MQTT operations are finished.',
            error: 'MQTT error:'
        },
        handleElectricity: handleElectricity,
        handleGas: handleGas
    }
}