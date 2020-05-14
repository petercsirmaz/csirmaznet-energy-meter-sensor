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
                            received: data.received,
                            delivered: data.delivered
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
                        JSON.stringify(data));
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