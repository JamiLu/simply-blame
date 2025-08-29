/**
 * License GPL-2.0
 */
import { spawn } from 'child_process';
import { log } from './Logger';

export const command = async (command: string): Promise<string> => {
    return await new Promise<string>((resolve, reject) => {
        let res = '';

        log.trace('Command ', command, 'started');
        const cmd = spawn(command, { shell: true });

        cmd.stdout.on('data', (chunk) => {
            res += String(chunk);
        });

        cmd.stderr.on('data', (chunk) => {
            res += String(chunk);
        });

        cmd.on('error', (e: Error) => {
            reject(e);
        });

        cmd.on('close', (code) => {
            log.trace('Command ', command, 'completed with code', code);
            if (code === 0) {
                resolve(res);
            } else {
                reject(new Error(res));
            }
        });
    });
};
