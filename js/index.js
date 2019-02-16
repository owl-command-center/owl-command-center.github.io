function gotoChannel(channel) {
    document.querySelector("#twitch-embed").innerHTML = "";
    new Twitch.Embed("twitch-embed", {
        width: "768",
        height: "468",
        channel: channel,
        layout: "video"
    });
}

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


let elements = [];
let channels = [];
for (let i=0; i<26; i++) {
    elements.push(null);
    channels.push(null);
}

elements[0] = document.querySelector("#main-button");
elements[1] = document.querySelector("#map-button");
for (let i=0; i<6; i++) {
    elements[2+i] = document.querySelector("#team-1-pov button:nth-of-type(" + (i + 1) + ")");
}
for (let i=0; i<6; i++) {
    elements[8+i] = document.querySelector("#team-2-pov button:nth-of-type(" + (i + 1) + ")");
}

/*
for (let i=0; i<6; i++) {
    elements[14+i] = document.querySelector("#team-1-composite button:nth-of-type(" + (i + 1) + ")");
}
for (let i=0; i<6; i++) {
    elements[20+i] = document.querySelector("#team-2-composite button:nth-of-type(" + (i + 1) + ")");
}
*/


let selectedStream = 0;

for (let i=0; i<14; i++) {
    elements[i].addEventListener("click", () => {
        let composite = i>=2 && $('input[type=radio]:checked').val() === "composite";
        let newStream = i;
        if (composite) {
            newStream += 12;
        }

        $(elements[selectedStream]).removeClass('active');
        const channelId = channels[newStream].owner.login;
        gotoChannel(channelId);
        $(elements[i]).addClass('active');
        selectedStream = i;
    });

    if (i < 2) {
        elements[i].addEventListener("click", () => {
            $('input[type=radio]').prop('disabled', true);
        });
    }
    else {
        elements[i].addEventListener("click", () => {
            $('input[type=radio]').prop('disabled', false);
        })
    }
}

$('input[type=radio]').change(e => {
    if (e.currentTarget.value === "composite") {
        let newStream = selectedStream + 12;
        console.log(newStream);
        gotoChannel(channels[newStream].owner.login);
    }
    else if (e.currentTarget.value === "pov") {
        let newStream = selectedStream;
        console.log(newStream);
        gotoChannel(channels[newStream].owner.login);
    }
});

gotoChannel('overwatchleague');
$(elements[0]).addClass('active');

fetch(graphQLEndpoint, {
    method: 'POST',
    body: JSON.stringify(graphQLQuery),
    headers: {
        'Client-Id': clientId,
    }
}).then(r => r.json()).then(r => {
    console.log(r);
    let chanlets = r[0].data.user.channel.chanlets;
    console.log("num streams: " + chanlets.length);

    chanlets.forEach(c => {
        const streamType = c.contentAttributes.find(a => a.key === "streamType").value;

        if (streamType === "Main Stream") {
            channels[0] = c;
        } else if (streamType === "Map") {
            channels[1] = c;
        } else if (streamType === "POV") {
            const title = c.contentAttributes.find(a => a.key === "title").value;
            const [team, player, type] = title.split(" - ");
            const playerName = c.contentAttributes.find(a => a.key === "player").value;
            const roleImage = c.contentAttributes.find(a => a.key === "role").imageURL;
            const teamImage = c.contentAttributes.find(a => a.key === "team").imageURL;
            let playerNumber = parseInt(player.split(" ")[1]);
            if (team === "Team A") {
                channels[2 + playerNumber - 1] = c;
                $(elements[2 + playerNumber - 1]).tooltip({title: playerName});
                $(elements[2 + playerNumber - 1]).html(`<img src='${roleImage}' width="40">`);

                $("#team-1").html(`<img src='${teamImage}'>`);
            } else {
                channels[8 + playerNumber - 1] = c;
                $(elements[8 + playerNumber - 1]).tooltip({title: playerName});
                $(elements[8 + playerNumber - 1]).html(`<img src='${roleImage}' width="40">`);

                $("#team-2").html(`<img src='${teamImage}'>`);
            }
        } else if (streamType === "Composite") {
            const title = c.contentAttributes.find(a => a.key === "title").value;
            const [team, player, type] = title.split(" - ");
            const playerName = c.contentAttributes.find(a => a.key === "player").value;
            let playerNumber = parseInt(player.split(" ")[1]);
            const roleImage = c.contentAttributes.find(a => a.key === "role").imageURL;
            if (team === "Team A") {
                channels[14 + playerNumber - 1] = c;
                //$(elements[14 + playerNumber - 1]).tooltip({title: playerName + " / Composite"});
                //$(elements[14 + playerNumber - 1]).html(`<img src='${roleImage}' width="40">`);
            } else {
                channels[20 + playerNumber - 1] = c;
                //$(elements[20 + playerNumber - 1]).tooltip({title: playerName + " / Composite"});
                //$(elements[20 + playerNumber - 1]).html(`<img src='${roleImage}' width="40">`);
            }
        } else {
            console.error("Unhandled stream type: " + streamType);
        }
    })
});
