var moment = require('moment');

module.exports = () => {

    const log = (message, date) => {
        const nowDate = moment();
        const logMessage = '[' + nowDate.format('HH:mm:ss') + '] ' + message;
        console.log(date 
            ? logMessage + ' (' + moment.duration(nowDate.diff(date)) + ' ms)'
            : logMessage
        );
    }

    return {
        log: log
    }
}