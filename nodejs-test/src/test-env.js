import createCustomDescribe, { jestWorkerId } from 'test-env-parallelization-jest-adapter';
import { createResource, Resource } from 'test-env-parallelization';
import { spawnAndWaitForLog } from "./run";

export const describeServer = createCustomDescribe(body => {
    let port;
    beforeAll(async () => {

        const polkaServer = Resource(
            'polka-server',
            async (options) => {
                console.log('options', options);
                const port = 3000 + options.workerId;
                console.log('spawn');
                await spawnAndWaitForLog(`PORT=${port} npm start`, '> Running on localhost:');
                return { port }
            }
        );

        console.log('create');
        const createdPolkaServer = await createResource(polkaServer, jestWorkerId());
        console.log('created');
        port = createdPolkaServer.port;
    });

    body({ port });
});