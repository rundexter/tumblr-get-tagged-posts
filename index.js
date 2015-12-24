var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.tumblr.com/v2/'
});

var pickInputs = {
        'base-hostname': 'base_hostname',
        'api_key': 'api_key',
        'tag': 'tag',
        'type': 'type',
        'limit': 'limit',
        'offset': 'offset'
    },
    pickOutputs = {
        '-': {
            keyName: 'response',
            fields: {
                'blog_name': 'blog_name',
                'id': 'id',
                'post_url': 'post_url',
                'type': 'type',
                'timestamp': 'timestamp',
                'date': 'date',
                'reblog_key': 'reblog_key',
                'tags': 'tags'
            }
        }
    };

module.exports = {
    /**
     * Return auth params.
     *
     * @param dexter
     * @returns {*}
     */
    authOptions: function (dexter) {
        var oauth = {
            consumer_key: dexter.environment('tumblr_consumer_key'),
            consumer_secret: dexter.environment('tumblr_consumer_secret'),
            token: dexter.environment('tumblr_token'),
            token_secret: dexter.environment('tumblr_token_secret')
        };

        return (
            oauth.consumer_key &&
            oauth.consumer_secret &&
            oauth.token &&
            oauth.token_secret
        )? oauth : false;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickStringInputs(step, pickInputs),
            oauth = this.authOptions(dexter),
            uriLink = 'tagged';

        var dataQuery = {
            url: uriLink,
            qs: _.omit(inputs, 'base-hostname'),
            json: true
        };

        if (oauth)
            dataQuery.oauth = oauth;

        if (!oauth || !inputs.api_key)
            return this.fail('A [tumblr_consumer_key,tumblr_consumer_secret,tumblr_token,tumblr_token_secret] or [api_key] environment need for this module.');

        if (!inputs.base_hostname || !inputs.tag)
            return this.fail('A [base_hostname, api_key, tag] need for this module.');

        //send API request
        request.get(dataQuery, function (error, response, body) {
            if (error)
                this.fail(error);

            else if (_.parseInt(response.statusCode) !== 200)
                this.fail(body);

            else
                this.complete(util.pickResult(body, pickOutputs));
        }.bind(this));
    }
};
