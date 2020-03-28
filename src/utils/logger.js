module.exports = () => {

    const getTimeFromDate = date => {
        if (!date) { return '--:--:--'; }
        const formatValue = value => value < 10 ? '0' + value : value;
        return formatValue(date.getHours()) + ':' + 
            formatValue(date.getMinutes()) + ':' +
            formatValue(date.getSeconds()); 
    }
    
    const log = (message, date) => {
        const nowDate = new Date();
        const logMessage = '[' + getTimeFromDate(nowDate) + '] ' + message;
        console.log(date 
            ? logMessage + ' (' + (nowDate - date) + ' ms)'
            : logMessage
        );
    }

    return {
        log: log
    }
}