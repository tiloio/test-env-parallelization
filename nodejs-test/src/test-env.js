import createCustomDescribe, { JestWorkerId } from 'test-env-parallelization-jest-adapter';
import { createResource, Resource } from 'test-env-parallelization';
import { spawnAndWaitForLog } from "./run";

export const describeServer = createCustomDescribe(body => {

    let port;
    beforeAll(async () => {

        const polkaServer = Resource(
            'polka-server',
            async (options) => {
                const port = 3000 + options.workerId;
                await spawnAndWaitForLog(`PORT=${port} npm start`, '> Running on localhost:');
                return { port }
            }
        );

        const createdPolkaServer = await createResource(polkaServer, JestWorkerId);
        port = createdPolkaServer.port;
    })

    body({ port })
});