import { spawn as spawnNode } from "child_process";

import type { SpawnError, SpawnOptions, SpawnReturnValue } from "./types";

const spawn = (command: string, args: readonly string[] = [], options: SpawnOptions = {}): SpawnReturnValue => {
    const childProcess = spawnNode(command, args, options);

    const promise = new Promise<number>((resolve, reject) => {
        let error: Error | null = null;

        childProcess.once(`error`, (err: Error) => {
            error = err;
        });

        childProcess.stdout?.on(`data`, (data: string | Buffer) => {
            if (options.stdoutListener)
                options.stdoutListener(data);
            else
                consoleLog(data);
        });

        childProcess.stderr?.on(`data`, (data: string | Buffer) => {
            if (options.stderrListener)
                options.stderrListener(data);
            else
                consoleError(data);
        });

        childProcess.once(`close`, (code, signal) => {
            if (code === 0)
                resolve(code);

            if (error !== null) {
                const enrichedError = enrichError(error, code, signal);
                reject(enrichedError);
            }

            if (code !== null) {
                error = new Error(`Child process exited with code ${code}`);
                const enrichedError = enrichError(error, code, signal);

                reject(enrichedError);
            }

            if (signal !== null) {
                error = new Error(`Child process exited due to the ${signal} signal`);
                const enrichedError = enrichError(error, code, signal);

                reject(enrichedError);
            }

            resolve(0);
        });
    });

    (promise as SpawnReturnValue).child = childProcess;

    return promise as SpawnReturnValue;
};

function consoleLog(data: string | Buffer) {
    const message = getMessage(data);
    console.log(message);
}

function consoleError(data: string | Buffer | Error) {
    const message = getMessage(data);
    console.error(message);
}

function getMessage(data: string | Buffer | Error) {
    if (Buffer.isBuffer(data))
        return data.toString(`utf8`);

    if (typeof data === `string`)
        return data;

    return data.message;
}

function enrichError(error: Error, code: number | null, signal: NodeJS.Signals | null): SpawnError {
    (error as SpawnError).exitCode = code;
    (error as SpawnError).signal = signal;

    return error as SpawnError;
}

export default spawn;