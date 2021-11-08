const { spawn } = require('child_process');
const moment = require('moment');

module.exports.backupMongoDb = () => {
    const DB_NAME = 'pharmaApp';
    const DATE = moment(new Date()).format("DD-MM-YYYY-HH-mm-ss");
    const ARCHIVE_PATH = `./public/${DATE}-${DB_NAME}.gzip`;

    console.log(ARCHIVE_PATH, "========================", DATE);

    const child = spawn('mongodump', [
        `--db=${DB_NAME}`,
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`
    ]);

    child.stdout.on('data', (data) => {
        console.log('studout: \n', data);
    });

    child.stderr.on('data', (data) => {
        console.log('stderr: \n', data);
    });

    child.on('error', (error) => {
        console.log('error: \n', error);
    });

    child.on('exit', (code, signal) => {
        if (code) console.log('Process exit with code: ', code);
        else if (signal) console.log('Process killed with signal ', signal);
        else console.log('Backup is successfull');
    });
};