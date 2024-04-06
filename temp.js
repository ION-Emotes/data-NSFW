const fs = require('fs');
const fpath = "temp.json";

async function getUserEmotes(token) {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {Authorization: token}
    });

    const data = await response.json();
    const guildsEmojis = [];
    
    for (const {id} of data) {
        try {
            const r = await fetch(`https://discord.com/api/guilds/${id}/emojis`, {headers: {Authorization: token}});
            const guildEmojis = await r.json();
            guildsEmojis.push(...guildEmojis.map(eRaw => ({name: eRaw.name, id: eRaw.id, guildId: id, animated: eRaw.animated})));
        }
        catch {console.error};
    }

    fs.writeFileSync(fpath, JSON.stringify(guildsEmojis));
}


function checkForCollisions() {
    const data = JSON.parse(fs.readFileSync(fpath));
    const o = {};
    const collisions = [];

    for (const obj of data) {
        let {name} = obj;
        let i = 0;

        if (name in o) {
            while (`name_${i}` in o) {i++;}
            name += `_${i}`;
        }

        const nOld = obj.name;
        delete obj.name;
        obj.oldName = nOld;
        o[name] = obj;
    }

    fs.writeFile("collisions.json", JSON.stringify(collisions.sort((a, b) => a.name.localeCompare(b.name))), (err) => {
        if (err) console.error(err);
        else console.log("DONE WITH COLLISION WRITING");
    });
    
    fs.writeFile("noncollisions.json", JSON.stringify(o), (err) => {
        if (err) console.error(err);
        else console.log("DONE WITH NON-COLLISION WRITING");
    });
}

// getUserEmotes('MzU4NDAyOTMwMTkxMTA2MDQ5.GA4UiL.Bg_-9zYIt-ETj4UXoJHbkJuUf6lipv2Pz-cZ18');
checkForCollisions();