const mqtt = require('mqtt');

module.exports = (config) => {
    

    const publishElectricity = (data, timestamp) => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            
            try {
                client.on('connect', () => {
                    client.publish(
                        config.topics.electricity, 
                        JSON.stringify({
                            timestamp: timestamp,
                            received:  {
                                reading: data.received.actual.reading,
                                unit: data.received.actual.unit
                            },
                            delivered: {
                                reading: data.delivered.actual.reading,
                                unit: data.delivered.actual.unit
                            }
                    }));
                    client.end();
                    resolve();
                });
            } catch (e) { reject(e); }
        });       
    }

    const publishGas = data => {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(config.host);
            
            try {
                client.on('connect', () => {
                    client.publish(
                        config.topics.gas, 
                        JSON.stringify({
                            timestamp: data.timestamp,
                            reading: data.reading,
                            unit: data.unit
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