

export function grep(text, regexp) {
    if (!(text && regexp)) {
        return;
    }
    try {
        let matchAll = text.matchAll(regexp);

        matchAll = Array.from(matchAll);
        const firstMach = matchAll[0][1] || matchAll[0][0];
        if (firstMach) {
            return firstMach;
        }
    } catch (e) {
    }
}
const padded = (num, d) => num.toFixed(0).padStart(d, '0');

export const TimeStamp = (time) => {
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const ms = time.getMilliseconds();
    return (

      (padded(h, 2)+':'+padded(m, 2)+':'+padded(s, 2)+'.'+padded(ms, 3))

    );
};

