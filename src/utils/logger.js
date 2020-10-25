var moment = require('moment');

module.exports = () => {

    const log = (message, date) => {
        const nowDate = new Date();
        const logMessage = '[' + moment().format('HH:mm:ss') + '] ' + message;
        console.log(date 
            ? logMessage + ' (' + (nowDate - date) + ' ms)'
            : logMessage
        );
    }

    return {
        log: log
    }
}