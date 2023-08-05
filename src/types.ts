import type { SpawnOptions as SpawnNodeOptions } from "node:child_process";

export type SpawnOptions = SpawnNodeOptions & {
    stdoutListener?: (data: string | Buffer) => void,
    stderrListener?: (data: string | Buffer) => void,
}

export type SpawnError = Error & { exitCode: number | null, signal: NodeJS.Signals | null };