function gotoChannel(channel) {
    document.querySelector("#twitch-embed").innerHTML = "";
    new Twitch.Embed("twitch-embed", {
        width: "640",
        height: "390",
        channel: channel,
        layout: "video"
    });
}

//gotoChannel("overwatchleague");


const clientId = 'd6g6o112aam5s8q2di888us9o3kuyh';
const graphQLEndpoint = 'https://gql.twitch.tv/gql';
const graphQLQuery = [
    {
        "operationName": "MultiviewGetChanletDetails",
        "variables": {"channelLogin": "overwatchleague"},
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": "23e36d2b3a68dcb2f634dd5d7682e3a918a5598f63ad3a6415a6df602e3f7447"
            }
        }
    }
];


let chanlets = [];
const team1pov = [null, null, null, null, null, null];
const team1comp = [null, null, null, null, null, null];
const team2pov = [null, null, null, null, null, null];
const team2comp = [null, null, null, null, null, null];
let mainView = null;
let mapView = null;

document.querySelector("#main-button").addEventListener("click", () => {
    const channelId = mainView.owner.login;
    gotoChannel(channelId);
});
document.querySelector("#map-button").addEventListener("click", () => {
    const channelId = mapView.owner.login;
    gotoChannel(channelId);
});

for (let i = 1; i <= 6; i++) {
    document.querySelector("#team-1-pov button:nth-of-type(" + i + ")").addEventListener("click", () => {
        const channelId = team1pov[i - 1].owner.login;
        gotoChannel(channelId);
    });
}
for (let i = 1; i <= 6; i++) {
    document.querySelector("#team-1-composite button:nth-of-type(" + i + ")").addEventListener("click", () => {
        const channelId = team1comp[i - 1].owner.login;
        gotoChannel(channelId);
    });
}
for (let i = 1; i <= 6; i++) {
    document.querySelector("#team-2-pov button:nth-of-type(" + i + ")").addEventListener("click", () => {
        const channelId = team2pov[i - 1].owner.login;
        gotoChannel(channelId);
    });
}
for (let i = 1; i <= 6; i++) {
    document.querySelector("#team-2-composite button:nth-of-type(" + i + ")").addEventListener("click", () => {
        const channelId = team2comp[i - 1].owner.login;
        gotoChannel(channelId);
    });
}


fetch(graphQLEndpoint, {
    method: 'POST',
    body: JSON.stringify(graphQLQuery),
    headers: {
        'Client-Id': clientId,
    }
}).then(r => r.json()).then(r => {
    console.log(r);
    chanlets = r[0].data.user.channel.chanlets;
    console.log("num streams: " + chanlets.length);

    chanlets.forEach(c => {
        const streamType = c.contentAttributes.find(a => a.key === "streamType").value;

        if (streamType === "Main Stream") {
            mainView = c;
        } else if (streamType === "Map") {
            mapView = c;
        } else if (streamType === "POV") {
            const title = c.contentAttributes.find(a => a.key === "title").value;
            const [team, player, type] = title.split(" - ");
            let playerNumber = parseInt(player.split(" ")[1]);
            if (team === "Team A") {
                team1pov[playerNumber - 1] = c;
            } else {
                team2pov[playerNumber - 1] = c;
            }
        } else if (streamType === "Composite") {
            const title = c.contentAttributes.find(a => a.key === "title").value;
            const [team, player, type] = title.split(" - ");
            let playerNumber = parseInt(player.split(" ")[1]);
            if (team === "Team A") {
                team1comp[playerNumber - 1] = c;
            } else {
                team2comp[playerNumber - 1] = c;
            }
        } else {
            console.error("Unhandled stream type: " + streamType);
        }
    })
});
