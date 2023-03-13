/**
 * Wait for a speficied amount of time to pass
 * @param ms time in ms to sleep for
 * @returns
 */
export const sleep = ms => new Promise(r => setTimeout(r, ms));
