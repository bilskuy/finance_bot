const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

module.exports = async (req, res) => {

  try {

    const message =
      req.body.message?.text;

    const chatId =
      req.body.message?.chat?.id;

    if (!message) {
      return res.status(200).send("OK");
    }

    const arr =
      message.split("|");

    if (arr.length !== 4) {

      await sendTelegram(
        chatId,
        "Format:\nPengeluaran|Billy|Makan|25000"
      );

      return res.status(200).send();
    }

    const sheets =
      google.sheets({
        version: "v4",
        auth,
      });

    await sheets.spreadsheets.values.append({

      spreadsheetId:
        process.env.SPREADSHEET_ID,

      range:
        "Transaksi!A:E",

      valueInputOption:
        "USER_ENTERED",

      requestBody: {

        values: [[

          arr[0],
          arr[1],
          arr[2],
          arr[3],

          new Date()
            .toLocaleString("id-ID")

        ]]

      }

    });

    await sendTelegram(
      chatId,
      "✅ Data berhasil disimpan"
    );

    return res.status(200).send();

  } catch(err) {

    console.error(err);

    return res.status(500).send(err);

  }

};

async function sendTelegram(
  chatId,
  text
){

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

        chat_id: chatId,
        text

      })

    }
  );

}