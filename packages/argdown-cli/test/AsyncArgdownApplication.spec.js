import { expect } from 'chai';
import { AsyncArgdownApplication } from '../src/index.js';

const app = new AsyncArgdownApplication();

describe("Application", function () {
    it("can run async", function () {
        let plugin1 = {
            name: "TestPlugin2",
            runAsync: (request, response) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        response.asyncRunCompleted = true;
                        resolve(response);
                    }, 500);
                });
            }
        };
        let plugin2 = {
            name: "TestPlugin1",
            run(request, response) {
                if (response.asyncRunCompleted) {
                    response.syncRunCompleted = true;
                }
                return response;
            }
        };
        app.addPlugin(plugin1, 'test');
        app.addPlugin(plugin2, 'test');
        return app.runAsync({ process: ['test'], input: 'Hallo Welt!'})
            .then((response) => {
                expect(response.asyncRunCompleted).to.be.true;
                expect(response.syncRunCompleted).to.be.true;
            });
    });
});
