module.exports = function (RED) {
    function ScreenshotNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        let path = config.path;
        let puppeteer = require('puppeteer');
        let option = {};

        if (path) {
            option.executablePath = path;
        }

        node.on('input', function (msg) {
            let url;

            if (msg.url) {
                url = msg.url;
            } else if (config.url) {
                url = config.url;
            } else {
                // set to default.
                url = 'http://www.example.com/';
            }

            puppeteer.launch(option).then(async browser => {
                const option = {
                    type: 'png',
                    fullPage: true,
                    encoding: 'base64'
                };
                const page = await browser.newPage();
                await page.setViewport({
                    width: (config.width ? parseInt(config.width) : 800),
                    height: (config.height ? parseInt(config.height) : 600),
                    deviceScaleFactor: (config.scale ? parseInt(config.scale) : 1),
                });
                if (config.wait === 'delay') {
                    await page.goto(url, { timeout: 0 })
                    await new Promise(resolve => setTimeout(resolve, config.delay));
                } else {
                    await page.goto(url, { waitUntil: config.wait, timeout: 0 });
                }
                const base64String = await page.screenshot(option);
                await browser.close();

                msg.payload = base64String;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("screenshot", ScreenshotNode);
}
