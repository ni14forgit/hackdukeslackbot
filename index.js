const Slackbot = require("slackbots");
const request = require("request");
const fetch = require("node-fetch");
const Spotify = require("node-spotify-api");
const fs = require("file-system");

slack_bot_token = process.env.SLACK_TOKEN;
console.log(slack_bot_token);

//NEED to fix, with some secret environment
const bot = new Slackbot({
  token: slack_bot_token,
  name: "kitty"
});

console.log("is ther error Slackbot?");

spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
spotify_client_stringid = "1262006373";
spotify_hackduke_playlist = "1Qj5m1UhNdY25CsUTNZBiH?si=3P5Vuhj9QRCMHN10rjwPSw";
spotify_playlist_real = "1Qj5m1UhNdY25CsUTNZBiH";
spotify_refresh_token = process.env.REFRESH_TOKEN;
CLIENT_TOKEN = process.env.WIT_TOKEN;

const spotify = new Spotify({
  id: spotify_client_id,
  secret: spotify_client_secret
});

console.log("is the error spotify?");

/* bot.on("start", () => {
  const params = {
    icon_emoji: ":smiley:"
  };

  bot.postMessageToChannel("general", "HAHA", params);
}); */

bot.on("message", msg => {
  //console.log(msg);
  switch (msg.type) {
    case "message":
      if (msg.channel[0] === "D" && msg.bot_id === undefined) {
        const q = encodeURIComponent(msg.text);
        const uri = "https://api.wit.ai/message?q=" + q;
        const auth = "Bearer " + CLIENT_TOKEN;
        fetch(uri, { headers: { Authorization: auth } })
          .then(res => res.json())
          .then(function(res1) {
            //console.log(res.entities.intent);
            //console.log(res.entities);
            //console.log(res);

            //bot.postMessageToUser(msg["client_msg_id"], "meow!");

            //sendMessage("test whatever");
            //findUser("UL097HRR6");

            decider(res1.entities, msg.user);
          });

        //spotifyPOSThackduke(msg.text);
      }
      break;
  }
});

function spotifycallback() {
  spotify
    .request(
      "https://api.spotify.com/v1/users/" +
        spotify_client_stringid +
        "/playlists"
    )
    .then(function(data) {
      console.log(data);
    })
    .catch(function(err) {
      console.error("Error occurred: " + err);
    });
}

function spotifyGEThackduke() {
  spotify
    .request(
      "https://api.spotify.com/v1/playlists/1Qj5m1UhNdY25CsUTNZBiH?si=3P5Vuhj9QRCMHN10rjwPSw"
    )
    .then(function(data) {
      console.log(data);
    })
    .catch(function(err) {
      console.error("Error occurred: " + err);
    });
}

function spotifyPOSThackduke(song_title, artist_title) {
  spotify
    .request(createTrackURL(song_title, artist_title))
    .then(function(data) {
      //var botmessage = "Here are the top results: \n";
      /* for (i = 0; i < 5; i++) {
        var song = "Song - " + data["tracks"]["items"][i]["name"] + " by ";
        var artist = "";
        for (var word of data["tracks"]["items"][i]["artists"]) {
          artist += word.name;
          artist += ", ";
        }
        artist = artist.substring(0, artist.length - 2);
        artist += "\n";
        botmessage += song;
        botmessage += artist;
      } */
      //console.log(botmessage);
      //console.log(data["tracks"]["items"][0].uri);
      if (data["tracks"]["items"][0] === undefined) {
        sendMessage(
          "Unfortunately, we couldn't find your song on Spotify",
          "Make sure you spelt everything right! <https://open.spotify.com/playlist/1Qj5m1UhNdY25CsUTNZBiH|Check out what songs other hackers contributed!>",
          "#800080",
          "DKNSG1WHY"
        );
      } else {
        var pretext = "Added " + song_title + " by " + artist_title + "!";
        var text =
          "<https://open.spotify.com/playlist/1Qj5m1UhNdY25CsUTNZBiH|Check out what songs other hackers contributed!>";
        sendMessage(pretext, text, "#800080", "DKNSG1WHY");
        realPost(data["tracks"]["items"][0].uri);
      }

      //console.log(data["tracks"]["items"][0]);
    })
    .catch(function(err) {
      console.error("Error occurred: " + err);
    });
}

function createTrackURL(track_title, artist_title) {
  var qstring = "track:";
  var artiststring = "artist:";
  qstring = qstring + encodeURIComponent(track_title);
  qstring += "%20";
  artiststring = artiststring + encodeURIComponent(artist_title);
  qstring = qstring + artiststring;

  const options =
    "https://api.spotify.com/v1/search?" +
    "q=" +
    qstring +
    "&type=track,artist&market=US";

  console.log(options);

  return options;
}

function realPost(trackid) {
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        )
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: spotify_refresh_token
    },
    json: true
  };

  request.post(authOptions, function(hierror, hiresponse, hibody) {
    if (!hierror && hiresponse.statusCode === 200) {
      var spotify_access_token = hibody.access_token;
      console.log(spotify_access_token);

      mylist = [];
      mylist.push(trackid);
      console.log(mylist);

      newauthOptions = {
        url:
          "https://api.spotify.com/v1/playlists/1Qj5m1UhNdY25CsUTNZBiH/tracks",
        headers: {
          Authorization: "Bearer " + spotify_access_token,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: mylist })
      };

      request.post(newauthOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          console.log("Goof");
        } else {
          console.log(response.statusCode);
          console.log(error);
        }
      });
    } else {
      bot.postMessageToChannel("general", "HAHA", params);
    }
    //console.log("this is auth error" + hiresponse.statusCode);
    //console.log(hierror);
  });
}

function decider(jsondata, userid) {
  if (!jsondata) {
    return;
  }
  console.log("this is user id: " + userid);

  var song_title;
  var artist_title;
  var pretext;
  var text;
  var color = "#800080";

  if (jsondata.intent === undefined) {
    pretext = "So sorry...";
    text =
      "I couldn't understand your request, please reach out to an organizer.";
    sendMessage(pretext, text, color, "DKNSG1WHY");
    return;
  }

  switch (jsondata.intent[0].value) {
    case "spotify":
      if ("song_title" in jsondata && "artist_title" in jsondata) {
        song_title = jsondata["song_title"][0].value;
        artist_title = jsondata["artist_title"][0].value;

        spotifyPOSThackduke(song_title, artist_title);
      } else {
        pretext = "Something went wrong!";
        text =
          "Make sure you typed the names of the song and artist correctly! <https://open.spotify.com/playlist/1Qj5m1UhNdY25CsUTNZBiH|Check out what songs other hackers contributed!>";
        sendMessage(pretext, text, color);
      }
      break;
    case "sponsors":
      pretext = "These are our supporting sponsors!";
      text =
        "*Houzz:* Mimi Han, Marc Marrujo, Christopher Santos" +
        "\n *Capital One: * Daniel Shull, Katie Mayfield" +
        "\n *Appian: * Filler Name, Filler Name" +
        "\n *JPMorgan Chase: * Filler Name, Filler Name" +
        "\n *Duke Department: * Thank you Duke!" +
        "\n *Spikeball, Insomnia Cookies, Peppered Popcorn*";
      sendMessage(pretext, text, color, "DKNSG1WHY");
      console.log("sponsor");
      break;
    case "code_of_conduct":
      pretext = "Be a good person!";
      text =
        "<https://static.mlh.io/docs/mlh-code-of-conduct.pdf|Code of Conduct>";
      sendMessage(pretext, text, color, "DKNSG1WHY");
      console.log("code of conduct");
      break;
    case "help":
      pretext = "What's wrong :(";
      text = "Please reach out to an organizer for any assistance!";
      sendMessage(pretext, text, color, "DKNSG1WHY");
      break;
    case "submit":
      pretext = "I'm so happy y'all completed your hackathon project!";
      text =
        "You can submit your amazing hackathon projects to https://hackduke.org/";
      sendMessage(pretext, text, color, "DKNSG1WHY");
      console.log("submit");
      break;
    case "schedule":
      sendFile("HackDuke-FAQs.pdf", "Here's our schedule!");
      break;
    case "finding_team":
      pretext = "We can help you find a team!";
      text =
        "Go to our *team_finding* slack channel and you'll meet other amazing hackers!";
      sendMessage(pretext, text, color, "DKNSG1WHY");
      break;
    case "learning":
      bot.getUsers().then(function(answer) {
        for (i = 0; i < answer.members.length; i++) {
          if (answer.members[i].id === userid) {
            var language_title = jsondata["languageName"][0].value;
            pretext = "A hacker is looking for help!";
            text =
              "Hi sponsors! " +
              answer.members[i].real_name +
              " would like some help with " +
              language_title +
              ". If any of you are interested, feel free to reach out to him/her to help with his/her hack!";
            sendMessage(pretext, text, "#800080", "GLG1M60NS");
            sendMessage(
              "",
              "I just messaged the sponsors! Hopefully someone will reach out on Slack to help you out!",
              "#800080",
              "DKNSG1WHY"
            );
            return;
          }
        }
      });
      break;
    case "map":
      sendFile(
        "map_of_duke.jpg",
        "Here's what our campus looks like, but feel free to reach out to an organizer for directions!"
      );
      break;
    case "snacks":
      pretext = "Hackers need to eat too!";
      text = createSnackTimeString();
      sendMessage(pretext, text, color, "DKNSG1WHY");
      break;
    case "bathroom":
      pretext = "";
      text =
        "Women's bathrooms are located at 1004, 2030, and 3981 in CIEMAS \n Men's bathrooms are located at 1004, 2030, and 3981 in CIEMAS";
      sendMessage(pretext, text, color, "DKNSG1WHY");
    //POTENTIALLY SEND A FILE INDICATING WHERE THE BATHROOMS ARE!
    default:
      pretext = "So sorry...";
      text =
        "I couldn't understand your request, please reach out to an organizer.";
      sendMessage(pretext, text, color, "DKNSG1WHY");
  }
}

function sendMessage(mypretext, mytext, mycolor, channelID) {
  var headers = {
    Authorization: "Bearer " + slack_bot_token,
    "Content-Type": "application/json"
  };

  attachments = [];

  makePretty = {
    pretext: mypretext,
    text: mytext,
    color: mycolor
  };
  attachments.push(makePretty);
  var body = {
    channel: channelID, // Slack user or channel, where you want to send the message
    attachments: attachments
  };

  var newAuthOptions = {
    url: "https://slack.com/api/chat.postMessage",
    headers: headers,
    body: JSON.stringify(body)
  };

  request.post(newAuthOptions, (err, response, body) => {
    if (err) {
      reject(err);
    }
    //console.log("response: ", JSON.stringify(response));
    //console.log("body: ", body);
  });
}

function sendFile(filename, title) {
  var newAuthOptions = {
    url: "https://slack.com/api/files.upload",
    formData: {
      token: slack_bot_token,
      title: title,
      filename: filename,
      filetype: "auto",
      channels: "DKNSG1WHY",
      file: fs.createReadStream(filename)
    }
  };

  request.post(newAuthOptions, (err, response, body) => {
    if (err) {
      reject(err);
    }
    //console.log("response: ", JSON.stringify(response));
    //console.log("body: ", body);
  });
}

function createSnackTimeString() {
  var breakfast = new Date("2019/11/02 09:00:00");
  var lunch = new Date("2019/11/02 13:00:00");
  var dinner = new Date("2019/11/02 19:00:00");
  var ramenChallenge = new Date("2019/11/03 00:00:00");
  var breakfast2 = new Date("2019/11/03 09:00:00");
  var nowdate = new Date();
  var timeList = [breakfast, lunch, dinner, ramenChallenge, breakfast2];
  var foodList = [
    "oatmeal, cereal, protein bars, and orange juice",
    "Chipotle",
    "Indian food",
    "RAMEN",
    "oatmeal, cereal, protein bars, and orange juice"
  ];
  var foodType = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "The ramen challenge",
    "Breakfast"
  ];
  var foodTime = [
    "*9:00 am*",
    "*1:00 pm*",
    "*7:00 pm*",
    "*12:00 am*",
    "*9:00 am*"
  ];
  var foodstring = "";

  for (i = 0; i < timeList.length; i++) {
    var millisec = timeList[i] - nowdate;
    console.log(millisec);
    var addString = "";
    if (millisec >= 0) {
      addString =
        foodType[i] +
        " will be at " +
        foodTime[i] +
        " providing " +
        foodList[i] +
        "!" +
        "\n";
      foodstring += addString;
    } else {
      var dateMilli = convertMS(Math.abs(millisec));
      if (dateMilli.hour <= 2) {
        var myhours = dateMilli.hour;
        if (dateMilli.minute > 30) {
          myhours += 1;
        }
        if (myhours <= 2) {
          addString =
            foodType[i] +
            " was be served around *" +
            myhours +
            " hours ago*, maybe you can still catch some" +
            "!" +
            "\n";
          foodstring += addString;
        }
      }
    }
  }

  if (!foodstring) {
    foodstring =
      "No upcoming meals planned, but check out the main atrium for leftovers - OR reach out to an organizer!";
  }

  /* console.log("breakfast:" + breakfast);
  console.log("nowdate:" + nowdate);
  console.log(nowdate - breakfast);
  var hi = new Date(nowdate - breakfast);
  console.log(hi.getHours());
  console.log(hi.getMinutes());
  console.log(new Date()); */

  return foodstring;
}

function convertMS(milliseconds) {
  var day, hour, minute, seconds;
  seconds = Math.floor(milliseconds / 1000);
  minute = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hour = Math.floor(minute / 60);
  minute = minute % 60;
  day = Math.floor(hour / 24);
  hour = hour % 24;
  return {
    day: day,
    hour: hour,
    minute: minute,
    seconds: seconds
  };
}

function findUser(userID) {
  var headers = {
    Authorization: "Bearer " + slack_bot_token,
    "Content-Type": "application/json"
  };
  var newAuthOptions = {
    url: "https://slack.com/api/users.identity",
    token: slack_bot_token
  };

  request(newAuthOptions, (err, response, body) => {
    if (err) {
      reject(err);
    }

    console.log(body);
    //console.log("response: ", JSON.stringify(response));
    //console.log("body: ", body);
  });
}
