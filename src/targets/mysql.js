
const Mysql = require('mysql');

module.exports = (config, logger) => {

    logger.log(`MySQL: module initialized to connect ${config.host}:`);

    const getConnection = config => {
        return Mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });
    }
    
    const handleElectricity = (sensorId, { equipmentId, timestamp, electricity}) => {
        return new Promise((resolve, reject) => {
            const mysql = getConnection(config);
            const { received, delivered, tariffIndicator, switchPosition } = electricity;

            try {
                mysql.connect(error => {
                    if (error) reject(error.message);

                    const table = config.tables.electricity;
                    const statement = `INSERT INTO ${table} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    const values = [
                        sensorId,
                        equipmentId,
                        new Date(timestamp),
                        received.tariff1.reading,
                        received.tariff2.reading,
                        received.actual.reading,
                        delivered.tariff1.reading,
                        delivered.tariff2.reading,
                        delivered.actual.reading,
                        tariffIndicator,
                        switchPosition
                    ];

                    mysql.query(statement, values, (error) => {
                        if (error) { reject(error); return; }

                        mysql.destroy();
                        resolve();
                    });
                });
            } catch (e) { reject(e); }
        });       
    }

    const handleGas = (sensorId, { equipmentId, gas }) => {
        return new Promise((resolve, reject) => {
            const mysql = getConnection(config);
            const { timestamp, reading, valvePosition } = gas;

            try {
                mysql.connect(error => {
                    if (error) reject(error.message);
                  
                    const table = config.tables.gas;
                    const statement = `INSERT INTO ${table} VALUES (?, ?, ?, ?, ?)`;
                    const values = [
                        sensorId,
                        equipmentId,
                        new Date(timestamp),
                        reading,
                        valvePosition
                    ];
                    
                    mysql.query(statement, values, (error) => {
                        if (error) { reject(error); return; }

                        mysql.destroy();
                        resolve();
                    });
                });
            } catch (e) { reject(e); }
            

        });       
    }

    return {
        name: 'MySQL',
        messages: {
            successElectricity: 'Electricity readings saved to MySQL database.',
            successGas: 'Gas readings saved to the MySQL database.',
            finished: 'MySQL operations are finished.',
            error: 'MySQL error:'
        },
        handleElectricity: handleElectricity,
        handleGas: handleGas
    }
}