const amqp = require('amqplib');
const config = require('./config.json');
const loggerModule = require('./utils/logger.js');

const logger = loggerModule();

if (!config || !config.rabbitmq) { 
    logger.log('RabbitMQ configuration does not found!')
    return;
}

const { host, port, user, password, queues } = config.rabbitmq;

amqp.connect(`amqp://${user}:${password}@${host}:${port}`)
    .then(connection => {
        logger.log(`Connected to ${host}:${port}`);
        connection.createChannel()
            .then(channel => {
                logger.log(`Channel opened`);

                channel.assertQueue(queues.electricity, { durable: true });
                channel.prefetch(1);
                logger.log(`Waiting for messages in ${queues.electricity}. To exit press CTRL+C`);

                channel.consume(queues.electricity, message => {
                    logger.log(`Message received: ${message.content.toString()}`);
                    channel.ack(message);
                });
            })
    })
    .catch(error => logger.log(`Error on connect: ${error}`));
    

// connection.on('ready', () => {
//     const queue = connection.queue(queues.electricity,{ durable: true });
//     logger.log(`Queue ${queue.name} is open`);

//     queue.subscribe(message => {
//         logger.log(`Message received: ${JSON.stringify(message)}`);
//     });
//});


