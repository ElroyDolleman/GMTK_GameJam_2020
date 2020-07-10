module GameTime
{
    export let currentElapsedMS: number = (1 / 60) * 1000;

    export function getElapsed(): number
    {
        return this.currentElapsedMS / 1000;
    }

    export function getElapsedMS(): number
    {
        return this.currentElapsedMS;
    }
}