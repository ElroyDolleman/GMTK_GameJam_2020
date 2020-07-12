module GameTime
{
    export let currentElapsedMS:number = (1 / 60) * 1000;

    export function getElapsed():number {
        return this.currentElapsedMS / 1000;
    }

    export function getElapsedMS():number {
        return this.currentElapsedMS;
    }

    export let startTime:Date;
    export let endTime:Date;

    export function getTimeDifferenceMSMM(firstDate:Date, secondDate:Date) {
        var millisecondsDifference = Math.floor(this.getMillisecondsDifference(firstDate, secondDate));
        var secondsDifference = Math.floor(this.getSecondsDifference(firstDate, secondDate));
        var minutesDifference = Math.floor(this.getMinutesDifference(firstDate, secondDate));

        millisecondsDifference -= secondsDifference * 1000;
        secondsDifference -= minutesDifference * 60;
        
        return {
            minutes: minutesDifference,
            seconds: secondsDifference,
            milliseconds: millisecondsDifference
        };
    }
    export function getSecondsDifference(firstDate:Date, secondDate:Date) {
        return (secondDate.getTime() / 1000) - (firstDate.getTime() / 1000);
    }
    export function getMillisecondsDifference(firstDate:Date, secondDate:Date) {
        return secondDate.getTime() - firstDate.getTime();
    }
    export function getMinutesDifference(firstDate:Date, secondDate:Date) {
        return this.getSecondsDifference(firstDate, secondDate) / 60;
    }
}