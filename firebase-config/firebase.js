var admin = require("firebase-admin");

var serviceAccount = require("./procket-live-firebase-adminsdk-pnt62-f434340ebf.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://procket-live.firebaseio.com"
});

exports.firebase = admin;