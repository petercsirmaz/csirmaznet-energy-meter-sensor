const mqtt = require('mqtt');

module.exports = (config) => {
    

    const publishElectricity = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            
            try {
                client.on('connect', () => {
                    client.publish(
                        config.topics.electricity, 
                        JSON.stringify({
                            sensor: sensorId,
                            received: data.received.actual.reading,
                            delivered: data.delivered.actual.reading
                    }));
                    resolve();
                });
            } catch (e) { reject(e); }
        });       
    }

    const publishGas = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            
            try {
                client.on('connect', () => {
                    client.publish(
                        config.topics.gas, 
                        JSON.stringify({
                            sensor: sensorId,
                            reading: data.reading,
                    }));
                    resolve();
                });
            } catch (e) { reject(e); }
            

        });       
    }

    return {
        publishElectricity: publishElectricity,
        publishGas: publishGas
    }
}