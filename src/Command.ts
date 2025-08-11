/**
 * License GPL-2.0
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { log } from './Logger';
import Notifications from './Notifications';

const MAX_RETRY = 5;
const BUFFER = 1024;

const promiseExec = promisify(exec);

export const command = async (command: string): Promise<string | undefined> => {
    let retryCount = 0;
    let shouldRetry = false;

    do {
        try {
            const bufferLength = BUFFER + retryCount * 512;
            const { stdout } = await promiseExec(`${command}`, { maxBuffer: bufferLength * bufferLength });
	
            return stdout;
        } catch (e) {
            if (e instanceof RangeError) {
                if (retryCount < MAX_RETRY) {
                    retryCount++;
                    shouldRetry = true;
                } else {
                    log.error(`Max retry count reached, retries: ${retryCount}, buffer: ${BUFFER * retryCount * 512}`);
                    Notifications.commonErrorNotification(e as Error, true);
                }
            } else {
                throw e;
            }
		  }
    } while (shouldRetry);
};
