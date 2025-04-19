import chalk from 'chalk';

const logger = {
    log: (level, message, value = '') => {
        const now = new Date().toLocaleString();
        const colors = {
            info: chalk.cyan,
            warn: chalk.yellow,
            error: chalk.red,
            success: chalk.green,
            debug: chalk.magenta,
        };

        const color = colors[level] || chalk.white;
        const levelTag = `[${level.toUpperCase().padEnd(7)}]`;
        const timestamp = `[${now}]`;
        const prefix = `${chalk.greenBright('[Taker-Mine]')} ${chalk.gray(timestamp)} ${color(levelTag)}`;

        let formattedValue = value;
        if (typeof value === 'object') {
            formattedValue = JSON.stringify(value, null, 2);
        }

        const formattedMessage = `${prefix} ${message}${formattedValue ? `: ${color(formattedValue)}` : ''}`;
        console.log(formattedMessage);
    },

    info: (message, value = '') => logger.log('info', message, value),
    warn: (message, value = '') => logger.log('warn', message, value),
    error: (message, value = '') => logger.log('error', message, value),
    success: (message, value = '') => logger.log('success', message, value),
    debug: (message, value = '') => logger.log('debug', message, value),
};

export default logger;