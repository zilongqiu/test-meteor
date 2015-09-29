if (Meteor.isClient) {

    Template.body.events({
        "submit .new-mail": function (event) {
            // Prevent default browser form submit
            event.preventDefault();

            // Get value from form element
            var from = '';
            if(Meteor.userId()) {
                from = Meteor.user().emails[0].address;
            } else {
                from = event.target.from.value;
            }
            var to = event.target.to.value;
            var subject = event.target.subject.value;
            var message = event.target.message.value;

            // Send the message
            Meteor.call('sendEmail',
                to,
                from,
                subject,
                message);

            // Clear form
            if(!Meteor.userId()) {
                event.target.from.value = "";
            }
            event.target.to.value = "";
            event.target.subject.value = "";
            event.target.message.value = "";
        }
    });


}

if (Meteor.isServer) {
    Meteor.startup(function () {
        var username = "postmaster@sandboxaa5727e9d8f944b4984ba5e06b11e22c.mailgun.org";
        var password = "cef031229cb27ca188bbd6cbb8829634";
        var server = "smtp.mailgun.org";
        var port = "587";

        process.env.MAIL_URL = 'smtp://' + encodeURIComponent(username) + ':' + encodeURIComponent(password) + '@' + encodeURIComponent(server) + ':' + port;
    });

    Meteor.methods({
        // Add an mail sender method
        sendEmail: function (to, from, subject, text) {
            check([to, from, subject, text], [String]);

            // Let other method calls from the same client start running,
            // without waiting for the email sending to complete.
            this.unblock();

            Email.send({
                to: to,
                from: from,
                subject: subject,
                text: text
            });
        }
    });

    // Send an email on user creation
    Accounts.onCreateUser(function(options, user) {
        if(!options || !user) {
            console.log('error creating user');
            return;
        } else {
            if(options.profile) {
                user.profile = options.profile;
            }
            Meteor.call('sendEmail',
                user.emails[0].address,
                'test@test.fr',
                'welcome',
                'Lorem ipsum...');
        }
        return user;
    });
}

