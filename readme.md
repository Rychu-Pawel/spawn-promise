# spawn-promise

TS written promise wrapper for node's child_process. It doesn't store/cache any stdio. By default logs stdout to `console.log` and stderr to `console.error`.

## Installation

```shell
npm install @rychu-pawel/spawn-promise
```

## Usage - simple example:

```js
import spawn from "@rychu-pawel/spawn-promise";

try {
    await spawn(`git`, [`pull`]);
}
catch (error) {
    console.error(error);
}
```

output:

```
$ node ./example.js
Already up to date.
```

## Usage - full example:

```js
import spawn, { SpawnError, SpawnOptions } from "@rychu-pawel/spawn-promise";
import customLogger from "./customLogger";

try {
    let nodeVersion: string | undefined;

    const options: SpawnOptions = { // Same as original spawn options & { stdoutListener, stderrListener }
        stdoutListener: data => (nodeVersion = data.toString().trim()),
        stderrListener: data => customLogger.error(data),
    };

    const promise = spawn(`node`, [`-v`], options);

    console.log(`pid`, promise.child.pid);

    await promise;

    console.log(`Node version is ${nodeVersion}`);
}
catch (err) {
    const error = err as SpawnError;

    console.log(error.message);
    console.log(error.exitCode);
    console.log(error.signal);
}
```

output:

```
$ node ./example.js
pid 11556
Node version is v18.16.0
```

## What actually happens underneath (assuming above simple example):

```js
const childProcess = spawn(`git`, [`pull`], {});

const promise = new Promise((resolve, reject) => {
    let error = null;

    childProcess.once(`error`, err => {
        error = err;
    });

    childProcess.stdout?.on(`data`, data => {
        if (options.stdoutListener)
            options.stdoutListener(data);
        else
            console.log(data);
    });

    childProcess.stderr?.on(`data`, data => {
        if (options.stderrListener)
            options.stderrListener(data);
        else
            console.error(data);
    });

    childProcess.once(`close`, (code, signal) => {
        if (code === 0)
            resolve(code);

        if (error !== null) {
            error.code = code;
            error.signal = signal;
            reject(error);
        }

        if (code !== null) {
            error = new Error(`Child process exited with code ${code}`);
            error.code = code;
            error.signal = signal;
            reject(error);
        }

        if (signal !== null) {
            error = new Error(`Child process exited due to the ${signal} signal`);
            error.code = code;
            error.signal = signal;
            reject(error);
        }

        resolve(0);
    });
});

promise.child = childProcess;

return promise;
```