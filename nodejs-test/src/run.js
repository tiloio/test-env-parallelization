import { spawn } from 'child_process';


export const spawnAndWaitForLog = (cmd, log) => new Promise((resolve, reject) => {

    console.log('run', cmd);
    const child = spawn(cmd, { shell: '/bin/sh'});

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);

        if (data.toString().includes(log)) resolve();
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        if (data.toString().includes(log)) resolve();
    });

    process.on('exit', () => {
        child.kill();
    });
});
