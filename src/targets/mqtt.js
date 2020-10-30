const mqtt = require('mqtt');

module.exports = (config) => {
    
    const publishElectricity = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            const { timestamp, electricity } = data;
            const { received, delivered } = electricity;
            
            try {
                client.on('connect', () => {
                    client.publish(
                        config.topics.electricity, 
                        JSON.stringify({
                            sensorId: sensorId,
                            timestamp: timestamp,
                            received: received,
                            delivered: delivered
                    }));
                    client.end();
                    resolve();
                });
            } catch (e) { reject(e); }
        });       
    }

    const publishGas = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            const { timestamp, reading } = data.gas;
            
            try {
                client.on('connect', () => {
                    client.publish(
                        config.topics.gas, 
                        JSON.stringify({
                            sensorId: sensorId,
                            timestamp: timestamp,
                            reading: reading
                        }));
                    client.end();
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