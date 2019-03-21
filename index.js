const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), updateSpreadsheet);
});

function createSpreadsheet(auth) {

    const resource = {
        properties: {
            title: 'My Sample Sheet',
        },
    };
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.create({
        resource,
        fields: 'spreadsheetId',
    }, (err, spreadsheet) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Spreadsheet ID`, spreadsheet.data.spreadsheetId);
        }
    });
}


function updateSpreadsheet(auth) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: '',
        range: 'Sheet1!A2:B',
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [["Void", "Canvas", "Website"], ["Paul", "Shan", "Human"]]
        }
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log("Appended");
        }
    });
}

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return getNewToken(oAuth2Client, callback);
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                return console.error('Error while trying to retrieve access token', err);
            }
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}