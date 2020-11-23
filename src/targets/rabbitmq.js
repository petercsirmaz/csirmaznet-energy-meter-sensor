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
        logger.log(`RabbitMQ: Connected to ${host}:${port}`);
        connection.createChannel().then(chnl => {
            channel = chnl;
            logger.log(`RabbitMQ: Channel opened`);
        })
    }).catch(error => logger.log(`RabbitMQ: Error on connection: ${error}`));
    
    const handleElectricity = (sensorId, data) => {
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
    
    const handleGas = (sensorId, data) => {
        return new Promise((resolve, reject) => {

            if (!connection || !channel) { 
                reject('No connecction or channel open'); 
            }

            const queue = config.queues.gas;
            const { equipmentId,  gas } = data;
            const { timestamp, reading } = gas;
            const message = {
                sensorId: sensorId,
                equipmentId: equipmentId,
                timestamp: timestamp,
                reading: reading
            };

            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    persistent: true
            });
            resolve();
        });
    }
    
    return {
        name: 'RabbitMQ',
        messages: {
            successElectricity: 'Electricity readings published on RabbitMQ queue.',
            successGas: 'Gas readings published on RabbitMQ queue.',
            finished: 'RabbitMQ operations are finished.',
            error: 'RabbitMQ error:'
        },
        handleElectricity: handleElectricity,
        handleGas: handleGas,
    }
}
