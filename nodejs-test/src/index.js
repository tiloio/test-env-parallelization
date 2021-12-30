import polka from 'polka';
const { PORT = 3000 } = process.env;

let counter = 0;

polka()
    .post('/', (req, res) => {
        console.log(`~> Post`);
        counter++;
        res.end(counter.toString(10));
    })
    .listen(PORT, () => {
        console.log(`> Running on localhost:${PORT}`);
    });