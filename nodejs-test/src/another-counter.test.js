import fetch from 'node-fetch';
import { describeServer } from './test-env';
describeServer('server returns another counter', ({ port }) => {

    test('count one', async () => {

        const res = await fetch('http://localhost:' + port, { method: 'POST' })

        const resText = await res.text()
        expect(parseInt(resText, 10)).toEqual(1);
    });
});
