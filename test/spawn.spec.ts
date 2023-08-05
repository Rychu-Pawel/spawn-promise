import { ChildProcess } from "child_process";
import path from "path";

import test from "ava";

import spawn from "../src/index.js";

import type { SpawnError } from "../src/index.js";

test.serial(`Successfully spawns`, async t => {
    // Arrange
    const sutMethod = async () => await spawn(`node`, [`-v`]);

    // Act & Assert
    await t.notThrowsAsync(sutMethod);
});

test.serial(`Returns child inside promise`, async t => {
    // Arrange
    const promise = spawn(`node`, [`-v`]);

    // Act
    const child = promise.child;
    await promise;

    // Assert
    t.truthy(child);
    t.true(child instanceof ChildProcess);
});

test.serial(`Resolves when exit code and signal are null`, async t => {
    // Arrange
    let promise: ReturnType<typeof spawn> | undefined;

    const sutMethod = async () => {
        promise = spawn(`node`, [`-v`]);
        promise.child.emit(`close`, null, null);
        await promise;
    };

    // Act & Assert
    await t.notThrowsAsync(sutMethod);
});

test.serial(`Spawns with correct parameters`, async t => {
    // Arrange
    const spawnArgs = [`-v`];
    const spawnFile = `node`;

    // Act
    const promise = spawn(`node`, spawnArgs);

    // Assert
    t.is(promise.child.spawnfile, spawnFile);
    t.deepEqual(promise.child.spawnargs, [spawnFile, ...spawnArgs]);
});

test.serial(`Rejects on error`, async t => {
    // Arrange
    const sutMethod = async () => await spawn(`dummyCommandThatDoesn'tExist`);

    // Act & Assert
    const error = await t.throwsAsync(sutMethod);

    // Assert
    t.truthy(error?.message);
    t.true(error!.message!.indexOf(`ENOENT`) >= 0);
});

test.serial(`Rejects with correct signal`, async t => {
    // Arrange
    const signal = `SIGKILL`;

    const scriptPath = path.join(process.cwd(), `test/commands/fiveSecondsScript.sh`);

    const sutMethod = async () => {
        const promise = spawn(`bash`, [scriptPath]);
        promise.child.kill(signal);
        await promise;
    };

    // Act & Assert
    const error = await t.throwsAsync(sutMethod);

    // Assert
    t.is((error as SpawnError).signal, signal);
});

test.serial(`Rejects with correct exit code`, async t => {
    // Arrange
    let promise: ReturnType<typeof spawn> | undefined;

    const scriptPath = path.join(process.cwd(), `test/commands/exitNonZero.sh`);

    const sutMethod = async () => {
        promise = spawn(`bash`, [scriptPath]);
        await promise;
    };

    // Act
    await t.throwsAsync(sutMethod);

    // Assert
    t.is(promise?.child.exitCode, 12);
});

test.serial(`Writes to console.log when no stdout listener passed`, async t => {
    // Arrange
    let message: string | undefined;

    const originalConsoleImplementation = console.log;

    console.log = (data: string) => (message = data);

    // Act
    await spawn(`node`, [`-v`]);

    console.log = originalConsoleImplementation;

    // Assert
    t.is(message?.trim(), process.version);
});

test.serial(`Writes to console.error when no stderr listener passed`, async t => {
    // Arrange
    let message: string | undefined;

    const originalConsoleImplementation = console.error;

    console.error = (data: string) => (message = data);

    const scriptPath = path.join(process.cwd(), `test/commands/stderror.sh`);

    // Act
    await spawn(`bash`, [scriptPath]);

    console.error = originalConsoleImplementation;

    // Assert
    t.is(message?.trim(), `error message text`);
});

test.serial(`Does not write to console when stdout listener passed`, async t => {
    // Arrange
    let message: string | undefined;

    const listener = () => { };

    const originalConsoleImplementation = console.log;

    console.log = (data: string) => (message = data);

    // Act
    await spawn(`node`, [`-v`], { stdoutListener: listener });

    console.log = originalConsoleImplementation;

    // Assert
    t.is(message, undefined);
});

test.serial(`Does not write to console when stderr listener passed`, async t => {
    // Arrange
    let message: string | undefined;

    const listener = () => { };

    const originalConsoleImplementation = console.error;

    console.error = (data: string) => (message = data);

    const scriptPath = path.join(process.cwd(), `test/commands/stderror.sh`);

    // Act
    await spawn(`bash`, [scriptPath], { stderrListener: listener });

    console.error = originalConsoleImplementation;

    // Assert
    t.is(message, undefined);
});

test.serial(`Calls stdout listener when passed`, async t => {
    // Arrange
    let message: string | undefined;

    const listener = (data: string | Buffer) => (message = data.toString());

    // Act
    await spawn(`node`, [`-v`], { stdoutListener: listener });

    // Assert
    t.is(message?.trim(), process.version);
});

test.serial(`Calls stderr listener when passed`, async t => {
    // Arrange
    let message: string | undefined;

    const scriptPath = path.join(process.cwd(), `test/commands/stderror.sh`);

    const listener = (data: string | Buffer) => (message = data.toString());

    // Act
    await spawn(`bash`, [scriptPath], { stderrListener: listener });

    // Assert
    t.is(message?.trim(), `error message text`);
});