function gotoChannel(channel) {
    document.querySelector("#video").innerHTML = "";
    new Twitch.Embed("video", {
        width: "100%",
        height: "100%",
        channel: channel,
        layout: "video"
    });
}

function mlgStream() {
    document.querySelector("#video").innerHTML = '<iframe frameborder="0" scrolling="no" id="mlg_player" src="https://player2.majorleaguegaming.com/api/v2/player/embed/live/?ch=overwatch-league" height="100%" width="100%" allow="autoplay; fullscreen" allowfullscreen></iframe>';
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
//main, map, mlg, 6x t1 POV, 6x t2 POV, 6x t1 comp, 6x t2 comp

for (let i=0; i<27; i++) {
    elements.push(null);
    channels.push(null);
}

elements[0] = document.querySelector("#main-button");
elements[1] = document.querySelector("#map-button");
elements[2] = document.querySelector("#mlg-button");

for (let i=0; i<6; i++) {
    elements[3+i] = document.querySelector("#team-1-pov button:nth-of-type(" + (i + 1) + ")");
}
for (let i=0; i<6; i++) {
    elements[9+i] = document.querySelector("#team-2-pov button:nth-of-type(" + (i + 1) + ")");
}

let selectedStream = 0;

for (let i=0; i<15; i++) {
    if (i !== 2) {
        elements[i].addEventListener("click", () => {
            let composite = i >= 3 && $('input[type=radio]:checked').val() === "composite";
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
    }
    else {
        elements[i].addEventListener("click", () => {
            $(elements[selectedStream]).removeClass('active');
            mlgStream();
            $(elements[i]).addClass('active');
            selectedStream = i;
        });
    }

    if (i < 3) {
        elements[i].addEventListener("click", () => {
            $('input[type=radio]').prop('disabled', true);
            $('label.btn').addClass('disabled', true);
        });
    }
    else {
        elements[i].addEventListener("click", () => {
            $('input[type=radio]').prop('disabled', false);
            $('label.btn').removeClass('disabled', true);
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
                channels[3 + playerNumber - 1] = c;
                $(elements[3 + playerNumber - 1]).tooltip({title: playerName});
                $(elements[3 + playerNumber - 1]).html(`<img src='${roleImage}' width="40">`);

                $("#team-1").html(`<img src='${teamImage}'>`);
            } else {
                channels[9 + playerNumber - 1] = c;
                $(elements[9 + playerNumber - 1]).tooltip({title: playerName});
                $(elements[9 + playerNumber - 1]).html(`<img src='${roleImage}' width="40">`);

                $("#team-2").html(`<img src='${teamImage}'>`);
            }
        } else if (streamType === "Composite") {
            const title = c.contentAttributes.find(a => a.key === "title").value;
            const [team, player, type] = title.split(" - ");
            const playerName = c.contentAttributes.find(a => a.key === "player").value;
            let playerNumber = parseInt(player.split(" ")[1]);
            const roleImage = c.contentAttributes.find(a => a.key === "role").imageURL;
            if (team === "Team A") {
                channels[15 + playerNumber - 1] = c;
            } else {
                channels[21 + playerNumber - 1] = c;
            }
        } else {
            console.error("Unhandled stream type: " + streamType);
        }
    })
});
