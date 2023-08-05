import { ChildProcess, spawn as spawnNode } from "child_process";

import type { SpawnError, SpawnOptions } from "./types";

const spawn = (command: string, args: readonly string[] = [], options: SpawnOptions = {}): Promise<void> & { child: ChildProcess } => {
    const child = spawnNode(command, args, options);

    const promise = new Promise<void>((resolve, reject) => {
        let error: Error | null = null;

        child.once(`error`, (err: Error) => {
            error = err;
        });

        child.stdout?.on(`data`, (data: string | Buffer) => {
            if (options.stdoutListener)
                options.stdoutListener(data);
            else
                consoleLog(data);
        });

        child.stderr?.on(`data`, (data: string | Buffer) => {
            if (options.stderrListener)
                options.stderrListener(data);
            else
                consoleError(data);
        });

        child.once(`close`, (code, signal) => {
            if (code === 0)
                resolve();

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

            resolve();
        });
    });

    return Object.assign(promise, { child });
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

function enrichError(error: Error, exitCode: number | null, signal: NodeJS.Signals | null): SpawnError {
    return Object.assign(error, { exitCode, signal });
}

export default spawn;