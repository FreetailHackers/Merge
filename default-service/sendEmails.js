const User = require("./models/User");
const Chat = require("./models/Chat");
const Team = require("./models/Team");

export default async function sendEmails(ses) {
  const allUsers = await User.find();
  let promises = [];

  for (let user of allUsers) {
    const chats = await Chat.find({ users: user._id });
    const team = await Team.findOne({ users: user._id });
    const unreadChats = chats.filter((chat) => !chat.readBy.includes(user._id));
    if (
      (unreadChats.length > 0 || team.mergeRequests?.length > 0) &&
      user.email &&
      user.name
    ) {
      const subject = "Merge: You have unread messages - Freetail Hackers";
      const message = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 16px;
                color: #333;
              }
              h1 {
                color: #F90;
              }
              p {
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            Hey ${user.name},
            <p>
              Greetings from the Merge team at Freetail Hackers! We hope you're doing well. We noticed that you have unread messages in the following chats:
            </p>
            <ol>
              ${unreadChats
                .map((chat) => `<li>${chat.name || "Untitled Chat"}</li>`)
                .join("")}
            </ol>
            Please <a href="https://merge.freetailhackers.com">log in</a> to your account to read them.
            <br>
            ${
              team.mergeRequests?.length > 0
                ? "<p>You also have " +
                  String(team.mergeRequests.length) +
                  " incoming merge requests.</p>"
                : ""
            }
            <br>
            <p>
              If you have any questions, you may email us at <a href="mailto:tech@freetailhackers.com">tech@freetailhackers.com</a>.
            </p>
            <br>
            Thanks,
            <br>
            The Merge Team at Freetail Hackers
          </body>
        </html>
      `;

      const params = {
        Destination: {
          ToAddresses: [user.email],
        },
        Message: {
          Body: {
            Html: {
              Data: message,
            },
          },
          Subject: {
            Data: subject,
          },
        },
        Source: "tech@freetailhackers.com",
      };

      promises.push(
        new Promise(() => {
          ses.sendEmail(params, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Email sent:", data);
            }
          });
        })
      );
    }
  }

  await Promise.all(promises);
}
