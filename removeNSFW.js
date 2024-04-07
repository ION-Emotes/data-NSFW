const axios = require('axios'),
    base64 = require('base-64'),
    fs = require('fs'),
    request = require('request'),
    nsfwjs = require('nsfwjs'),
    tf = require("@tensorflow/tfjs-node"),
    sharp = require('sharp');

const download = function (uri, callback) {
    const filename = uri.replace("https://cdn.discordapp.com/emojis/", "");
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(`${__dirname}/data/${filename}`)).on('close', callback);
    });
};
const {ghtoken} = require('./config.json');

const getCDNLink = (id, animated) => `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "webp"}`;


function webpToPng() {
    fs.readdirSync(`${__dirname}/data/`, {withFileTypes: true}).filter(o => o.name.endsWith('.webp')).map(async (emName) => {
        sharp(`${__dirname}/data/${emName.name}`)
        .png() // Convert to PNG
        .toBuffer() // Convert to Buffer for tf.node.decodeImage
        .then((buffer) => {
            fs.rm(`${__dirname}/data/${emName.name}`, () => {});
            fs.writeFile(`${__dirname}/data/${emName.name.replace(".webp", ".png")}`, buffer, () => console.log(`TRANSFORMED ${emName.name}`))
        })
        .catch((error) => console.error('Error processing image:', error))
    });
}

/*
(async () => {
    const treeUrl = "https://api.github.com/repos/ION-Emotes/data/contents/data";
    const headers = {
        headers: { 'Authorization': `token ${ghtoken}` }
    };

    const r = await axios.get(treeUrl, headers);

    const emotesAll = (await Promise.all(r.data.map(f => axios.get(f.url, headers))))
                                                .map(o => JSON.parse(base64.decode(o.data.content)))
                                                .map(o => Object.entries(o).map(([key, val]) => {
                                                    val['key'] = key;
                                                    return val;
                                                }));

    fs.writeFileSync('emotesAll.json', JSON.stringify(emotesAll));
})();
*/

// If you want to host models on your own or use different model from the ones available, see the section "Host your own model".
// (async () => {
//     const model = await nsfwjs.load();

//     // Classify the image
//     const pathname = `${__dirname}/data/${'405460901718917121.webp'}`;
//     // const pathname = `${__dirname}/data/${'1224193455186645032.gif'}`;
//     const buffer = (pathname.endsWith(".gif")) ? fs.readFileSync(pathname) : await sharp(pathname)
//         .png() // Convert to PNG
//         .toBuffer() // Convert to Buffer for tf.node.decodeImage
//         .catch((error) => console.error('Error processing image:', error));

//     // Decode the image to a tensor
//     let imgTensor = tf.node.decodeImage(buffer, 3); // 3 channels for RGB
//     if (imgTensor.shape.length === 4) {
//         imgTensor = imgTensor.slice([0, 0, 0, 0], [1, imgTensor.shape[1], imgTensor.shape[2], imgTensor.shape[3]]).squeeze([0]);
//     }

//     const resizedImgTensor = tf.image.resizeBilinear(imgTensor, [224, 224]);

//     // If your model expects a batch dimension
//     const batchedImgTensor = resizedImgTensor.expandDims(0);

//     const predictions = await model.classify(batchedImgTensor);
//     console.log("Predictions: ", predictions);

//     imgTensor.dispose();
// })()

const {checkNSFW, groupByFirstLetterOfKey} = require('../bot/helpers.js');
const {rem} = require('../bot/ghpload.js');

async function getAndCheckAllNSFW() {
    /*
    const keysFull = JSON.parse(fs.readFileSync(__dirname + '/NSFW.json'));
    const keys = Array.from(new Set(keysFull.map(o => o[0])));
    const emoteURLS = (await Promise.all(keys.flatMap(async (k) => {
        const res = await fetch(`https://raw.githubusercontent.com/ION-Emotes/data/main/data/${k}.json`);
        const emotes = await res.json();

        return Object.keys(emotes).filter(em => keysFull.includes(em)).flatMap(k => getCDNLink(emotes[k].id, emotes[k].animated));
    }))).flat(2);

    emoteURLS.map(emote => download(emote, () => console.log(`wrote ${emote}`)));

    const r = await Promise.all(fs.readdirSync(`${__dirname}/data/`).map(async (emName) => {
        const nsfwres = await checkNSFW(`https://cdn.discordapp.com/emojis/${emName}`);
        nsfwres['emojiname'] = emName;
        return nsfwres;
    }));

    fs.writeFileSync(`${__dirname}/data/nsfw.json`, JSON.stringify(r.filter(o => !o.passed)));
    

    // const nsfw = JSON.parse(fs.readFileSync(`${__dirname}/data/nsfw.json`));
    // nsfw.map(o => download(`https://cdn.discordapp.com/emojis/${o.emojiname}`, () => console.log(o.emojiname)));
    webpToPng();

    const nsfw = fs.readdirSync(`${__dirname}/data/`);
    const emotesAll = JSON.parse(fs.readFileSync(`${__dirname}/emotesAll.json`));

    const emotes = nsfw.map(eName => emotesAll.find(o => o.id === eName.split('.')[0]));
    fs.writeFileSync(`${__dirname}/data/nsfw.json`, JSON.stringify(emotes));
    */

    // ADD TEMP CODE TO REMOVE THE SERVERID REQ
    try {
        // formatting
        const toRem = JSON.parse(fs.readFileSync(`${__dirname}/data/nsfw.json`));
        // const toRem = JSON.parse(fs.readFileSync(`${__dirname}/data/toRem-nonsfw.json`));
        toRem.map(o => download(getCDNLink(o.id, o.animated), () => console.log(o.key)));

        const formatted = Object.fromEntries(toRem.map(o => [o.key, o]));
        const grouped = Object.entries(groupByFirstLetterOfKey(formatted));

        for (const [key, val] of grouped) {
            try {
                const path = `data/${key.toLowerCase()}.json`;
                const baseURL = 'https://api.github.com/repos/ION-Emotes/data';
                const url = `${baseURL}/contents/${path}`;
                // Get the current file content
                const response = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${ghtoken}` }
                });

                // Decode the base64 content to a string
                const content = base64.decode(response.data.content);

                let json = JSON.parse(content);
                for (const keyMine in val) {
                    for (const key in json) {
                        if (json[key].id === val[keyMine].id) {
                            delete json[key];
                            console.log("deleted", val[keyMine].key)
                        }
                    }
                }

                const newContent = base64.encode(JSON.stringify(json));
                const updateData = {
                    message: `Initial NSFW removal from ${path}`,
                    content: newContent,
                    sha: response.data.sha // SHA of the file you're replacing, to ensure you're updating the right version
                };
        
                // Commit the update
                const updateResponse = await axios.put(url, updateData, {
                    headers: { 'Authorization': `Bearer ${ghtoken}` }
                });
            }
            catch (err) { console.error(err); }
        }
    }
    catch (err) {
        console.error(err);
    }
}

getAndCheckAllNSFW().then(webpToPng);


// checkNSFW("https://cdn.discordapp.com/emojis/405460901718917121.webp");
// checkNSFW("https://cdn.discordapp.com/emojis/1181859576845439016.webp");