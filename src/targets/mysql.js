
const Mysql = require('mysql');

module.exports = (config) => {

    const getConnection = config => {
        return Mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });
    }
    
    const saveElectricity = (sensorId, equipmentId, timestamp, data) => {
        return new Promise((resolve, reject) => {
            const mysql = getConnection(config);

            try {
                mysql.connect(error => {
                    if (error) reject(error.message);

                    const table = config.tables.electricity;
                    const statement = `INSERT INTO ${table} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    const values = [
                        sensorId,
                        equipmentId,
                        new Date(timestamp),
                        data.received.tariff1.reading,
                        data.received.tariff2.reading,
                        data.received.actual.reading,
                        data.delivered.tariff1.reading,
                        data.delivered.tariff2.reading,
                        data.delivered.actual.reading,
                        data.tariffIndicator,
                        data.switchPosition
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

    const saveGas = (sensorId, equipmentId, data) => {
        return new Promise((resolve, reject) => {
            const mysql = getConnection(config);
            
            try {
                mysql.connect(error => {
                    if (error) reject(error.message);
                  
                    const table = config.tables.gas;
                    const statement = `INSERT INTO ${table} VALUES (?, ?, ?, ?, ?)`;
                    const values = [
                        sensorId,
                        equipmentId,
                        new Date(data.timestamp),
                        data.reading,
                        data.valvePosition
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
        saveElectricity: saveElectricity,
        saveGas: saveGas
    }
}