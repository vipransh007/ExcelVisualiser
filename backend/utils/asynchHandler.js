// const asynchHandler = (fn) => (req, res, next) => {
//     return (req, res, next) => {
//         Promise.resolve(fn(req, res, next)).catch(next);
//     }
// }

// export default asynchHandler;

const asynchHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}

export default asynchHandler;