import type { ChildProcess, SpawnOptions as SpawnNodeOptions } from "node:child_process";

export type SpawnOptions = SpawnNodeOptions & {
    stdoutListener?: (data: string | Buffer) => void,
    stderrListener?: (data: string | Buffer) => void,
}

export type SpawnReturnValue = Promise<number> & { child: ChildProcess };

export type SpawnError = Error & { exitCode: number | null, signal: NodeJS.Signals | null };