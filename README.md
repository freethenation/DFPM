
# **D**on't **F**inger**P**rint **M**e

DFPM is a browser extension for detecting browser fingerprinting. You can install it from [Chrome Web Store](https://chrome.google.com/webstore/detail/dont-fingerprint-me/nhbedikkbkakbjipijipejfojanppbfg).

Browser fingerprinting has gotten a lot of press over the last few years. The EFF and others have released tools ([panopticlick](https://panopticlick.eff.org/)) demonstrating it is possible but it is frustrating how few tools there are to actually identify companies using these techniques.

## Running DFPM

### Extension

Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/dont-fingerprint-me/nhbedikkbkakbjipijipejfojanppbfg?hl=en) or build it from source with `npm run build` and [install it manually](https://stackoverflow.com/questions/24577024/install-chrome-extension-not-in-the-store). Your devtools panel will now have a new tab, DFPM.

### Command line

DFPM includes a command line program that can connect to a running chrome or safari instance via [Chrome's debugger protocol](https://chromedevtools.github.io/devtools-protocol/). Run `dfpm -h` for more information.

### Other environments

I have ran DFPM in several environments and at scale. At its core, DFPM is a single script, `./dist/inject.js`, which must be ran before any other JS. I have found two good hooks in Chrome, [run_at:"document_start"](https://developer.chrome.com/extensions/content_scripts) and [scriptFirstStatement](https://chromedevtools.github.io/devtools-protocol/tot/Debugger/) (see `dfpm.js` for an example).

## Why do companies deploy browser fingerprinting?

There are many motivations for companies to deploy browser fingerprinting with varying ethical implications:

- **Tracking customers**: Companies use fingerprinting to track their customers/visitors around the web. This is the most frightening one and the least ethical reason to deploy fingerprinting.
- **Anti password testing**: Browser fingerprinting gives companies additional ways to identify and block hackers.
- **Anti web scraping**: Fingerprinting gives companies additional ways to "protect" their data. Web scraping is not illegal and it's common. It is often [deployed by large companies to hinder competitors and maintain market share](http://fortune.com/2017/05/10/amazon-bots/).

My motivations for creating the tool are some combination of the scraping and tracking. My day job involves a lot of web scraping but personally I care a lot more about individual privacy.

## DFPM Example: Dropbox

First, I like Dropbox as a product. Hopefully someone there still cares about user privacy.

If we run DFPM on their [mobile marketing site](https://www.dropbox.com) with no adblock but with DoNotTrack set we can see what data they are collecting. Specifically, it looks like they are using [canvas](https://browserleaks.com/canvas) and [font](https://browserleaks.com/fonts) fingerprinting.

![usage example screenshot](https://raw.githubusercontent.com/freethenation/DFPM/master/docs/example_db_marketing.png)

No one is scraping or hacking Dropbox's marketing site so hopefully the fingerprinting is just an oversight. :(

If we run DFPM on their [login page](https://www.dropbox.com/login) they initially run no fingerprinting.

![usage example screenshot](https://raw.githubusercontent.com/freethenation/DFPM/master/docs/example_db_login_before_attempt.png)

If we attempt to login and fail, they fingerprint us with [canvas](https://browserleaks.com/canvas) and [fonts](https://browserleaks.com/fonts).

![usage example screenshot](https://raw.githubusercontent.com/freethenation/DFPM/master/docs/example_db_login_after_attempt.png)

There is a good argument for including fingerprinting on the login page. The additional information can be very useful in stopping bad actors. That said, there's no way to know if they also use the data for less user-friendly reasons.

## Extending DFPM to detect additional fingerprinting techniques

Adding the ability for DFPM to detect another fingerprinting technique is relatively easy.

1. Create a new logger by copying `./src/loggers/example.js` to a new file in the loggers directory.
2. Modify the newly copied file.
3. Add your newly created logger to the list at the top of `./src/inject.js`.
4. Rebuild the app with `npm run build` and install your modified extension [manually](https://stackoverflow.com/questions/24577024/install-chrome-extension-not-in-the-store).
5. If you think others can benefit from your modifications, please submit a pull request.
