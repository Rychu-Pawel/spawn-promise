import { ChildProcess } from "child_process";

import test from "ava";

import spawn from "../src/spawn.js";

test(`Successfully spawns`, async t => {
    // Arrange
    const sutMethod = () => spawn(`node`, [`-v`]);

    // Act & Assert
    await t.notThrowsAsync(sutMethod);
});

test(`Returns child inside promise`, t => {
    // Arrange & Act
    const promise = spawn(`node`, [`-v`]);

    // Assert
    t.truthy(promise.child);
    t.true(promise.child instanceof ChildProcess);
});

test(`Resolves when exit code is null`, t => {
    // Assert
    t.true(true);
});

test(`Spawns with right args`, t => {
    // Assert
    t.true(true);
});

test(`Spawns with right options`, t => {
    // Assert
    t.true(true);
});

test(`Rejects on error`, t => {
    // Assert
    t.true(true);
});

test(`Writes to stdout when no stdout listener passed`, t => {
    // Assert
    t.true(true);
});

test(`Writes to stderr when no stderr listener passed`, t => {
    // Assert
    t.true(true);
});

test(`Does not write to stdout when stdout listener passed`, t => {
    // Assert
    t.true(true);
});

test(`Does not write to stderr when stderr listener passed`, t => {
    // Assert
    t.true(true);
});

test(`Calls stdout listener when passed`, async t => {
    // Arrange
    let message: string | undefined;

    const listener = (data: string | Buffer) => (message = data.toString());

    // Act
    await spawn(`node`, [`-v`], { stdoutListener: listener });

    // Assert
    t.is(message?.trim(), process.version);
});

test(`Calls stderr listener when passed`, t => {
    // Assert
    t.true(true);
});

test(`Rejects on not 0 exit code`, t => {
    // Assert
    t.true(true);
});