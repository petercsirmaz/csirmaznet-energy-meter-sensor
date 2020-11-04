var amqp = require('amqplib');

module.exports = (config, logger) => {

    let connection, channel;
    const { host, port, user, password } = config;

    amqp.connect({ 
        protocol: 'amqp',
        hostname: host, 
        port: port,
        username: user,
        password: password
    }).then(conn => {
        connection = conn;
        logger.log(`rabbitmq: Connected to ${host}:${port}`);
        connection.createChannel().then(chnl => {
            channel = chnl;
            logger.log(`[rabbitmq] Channel opened`);
        })
    }).catch(error => logger.log(`rabbitmq: Error on connection: ${error}`));
    
    const publishElectricity = (sensorId, data) => {
        return new Promise((resolve, reject) => {
            if (!connection || !channel) { 
                reject('No connecction or channel open'); 
            }

            const queue = config.queues.electricity;
            const { equipmentId, timestamp, electricity } = data;
            const { received, delivered } = electricity;
            const message = {
                sensorId: sensorId,
                equipmentId: equipmentId,
                timestamp: timestamp,
                received: received,
                delivered: delivered
            };

            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    persistent: true
            });
            resolve();

        });
    };
    
    const publishGas = (sensorId, data) => {
        return new Promise((resolve, reject) => {

            resolve();
            // const connection = getConnection();
            // connection.createChannel((error, channel) => {
            //     if (error) { reject(error); return; }

            //     const queue = config.queues.gas;
            //     const { equipmentId,  gas } = data;
            //     const { timestamp, reading } = electricity;
            //     const msg = {
            //         sensorId: sensorId,
            //         equipmentId: equipmentId,
            //         timestamp: timestamp,
            //         reading: reading
            //     };
            //     channel.assertQueue(queue, { durable: true });
            //     channel.sendToQueue(queue, Buffer.from(msg), { persitent: true });

            //     connection.close();
            //     resolve();
            // });
        });
    }
    
    return {
        publishElectricity: publishElectricity,
        publishGas: publishGas
    }
}
