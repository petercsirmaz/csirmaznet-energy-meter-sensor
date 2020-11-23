var fs = require('fs');
var moment = require('moment');

module.exports = () => {
    const formatMessage = (message, date, includeDate) => {
        const nowDate = moment();
        const dateTime = includeDate 
            ? nowDate.format('YYYY-MM-DD HH:mm:ss') 
            : nowDate.format('HH:mm:ss');
        const logMessage = `[${dateTime}] ${message}`;
        
        if (!date) return logMessage;
        return `${logMessage} (${moment.duration(nowDate.diff(date))} ms)`; 
    };

    const log = (message, date) => {      
        console.log(formatMessage(message, date));
    }

    const error = (message, date) => {
        console.log(formatMessage(message, date));
        fs.appendFile(
            'errors.log', 
            formatMessage(message, date, true) + '\n', 
            'utf8', 
            err => { if (err) console.error(formatMessage(err)); }
        );
    }

    return {
        log: log,
        error: error
    }
}