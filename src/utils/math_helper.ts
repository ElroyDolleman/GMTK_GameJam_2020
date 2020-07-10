module MathHelper {

    /**
     * Returns an integer that indicates the sign of a number.
     * So anything > 0 will return 1, and < 0 will return -1
     */
    export function sign(value:number) {
        return value == 0 ? 0 : value > 0 ? 1 : -1;
    }
}