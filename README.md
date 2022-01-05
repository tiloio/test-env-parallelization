<h1 align="center">
  test-env-parallelization
</h1>
<p align="center">
  Helps you to parallelize environments for tests (like DynamoDB, MongoDB, HTTP-Server, S3-Bucket...).
</p>

<p align="center">
 <a href="https://github.com/tiloio/test-env-parallelization"><img alt="GitHub stars" src="https://img.shields.io/github/stars/tiloio/test-env-parallelization?logo=github"></a>
 <a href="#badge"><img alt="vr scripts" src="https://badges.velociraptor.run/flat.svg"/></a>
 <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-success"/></a>
 <img alt="0 dependencies" src="https://img.shields.io/badge/dependencies-0-success"/>
</p>

## Goals

- Easy definition of test resources (name, creation, initializiation, teardown) with dependency structure (so you can make your `WebServer`-Resource depents on your `Database`-Resource).
- Two types of test resources: 
  1. resources which depends on frequently changing code (like WebServer under test) and 
  2. resources which has static code (like Database-Server). 
- Optional preheat caching: Resources which are not needed for the first runs but later are getting preheated after initialization to speed up test runs with reducing waiting times.
- Optional initialization of a test run (deleting of currently saved creations).
- Hanlding of single creation with multiple initializations (like starting one database server and creating multiple databases).
- Waiting mechanism for creation to run multiple processes in parallel.
- Pretty logging of each running resource.
- Optional teardown of all running test resources.

## How should it work

You define an `resources.js` or `resources.ts` module which holds the definitions of your resources.

You have one `process` which starts your tests. This process calls the `TestEnvParalellization.init('some-name');`. The provided name is used to name the `tempDir` which stores all configuration, log and `.lock` files.

You have multiple `processes` which execute the tests. Before you start any test you run `TestEnvParalellization.create(yourResources[])` to create your test resource. This method will, dependent of the resource definition, create and initialize the resource. It will check if there is already a `ResourceConfiguration` for the given name in the `tempDir` or a `.lock` file. If not it will create a `.lock` file and run the creation of the `ResourceConfiguration`. With the given or create configuration it will run the optional initialization and return the create or initialization result.

While the test are running: The processes, which where started in the create function of the `Resource`, will get logged all in one `.txt` file in the `tempDir`. This file could optionally be outputted from the `TestEnvParalellization.init()` method. 

After all tests are done you have to call `TestEnvParalellization.teardown('some-name')` this calla every teardown function of each `Resource`. It will also printout a path to a copy of the log-file and clears the `tempDir`.
  

## Future

- Dashboard (website) which shows all test runs ever done (via log readout) and live view of current runs (via `tempDir` file watcher). To archive that we need to also printout the testframeworks logs (e.g. we need a Jest-Adapter).

## License

MIT License

Copyright (c) 2021 Ti/o

## Development

Use `vr` ([Velociraptor](https://velociraptor.run/)) to run all commands like `vr check` and `vr publish`.
