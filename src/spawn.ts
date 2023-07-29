import { spawn as spawnNode } from "child_process";

import type { SpawnOptions, SpawnReturnValue } from "./types";

const spawn = (command: string, args: readonly string[] = [], options: SpawnOptions = {}): SpawnReturnValue => {
    const childProcess = spawnNode(command, args, options);

    const promise = new Promise<void>((resolve, reject) => {
        let error: Error | null = null;

        childProcess.on(`error`, (err: Error) => {
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

        childProcess.on(`close`, code => {
            if (code === 0)
                resolve();

            if (error !== null)
                reject(error);

            if (code !== null)
                reject(new Error(`Child process exited with code ${code}`));

            resolve();
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

export default spawn;