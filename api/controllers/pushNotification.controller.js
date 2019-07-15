const { firebase } = require('../../firebase-config/firebase');

exports.send_push_notification = (req, res, next) => {
    const tokens = req.tokens || [];
    const title = req.title || '';
    const body = req.message || {};
    const data = req.data || {};

    const registrationTokens = tokens || [];
    
    const message = {
        notification: { title: title, body: body },
        data: data,
        tokens: tokens,
    }

    firebase.messaging().sendMulticast(message)
        .then((response) => {
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(registrationTokens[idx]);
                    }
                });
            }

            return res.status(201).json({
                success: true,
                response: response,
                failedTokens: failedTokens
            })
        })
        .catch(function (error) {
            return res.status(201).json({
                success: false,
                response: error,
            })
        });
}