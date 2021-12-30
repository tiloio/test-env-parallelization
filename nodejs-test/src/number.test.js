import fetch from 'node-fetch';

describe('server returns counter', () => {

    test('count two', async () => {

        await import('./index.js');

       await fetch('http://localhost:3000', { method: 'POST' })
       const res = await fetch('http://localhost:3000', { method: 'POST' })

       const resText = await res.text()
        expect(parseInt(resText, 10)).toEqual(1);
    });
});
