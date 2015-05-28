Template.queriesList.helpers({
    queries: function() {
        return Queries.find();
    }
});

Template.queriesList.events({
    'click .glyphicon': function (e) {
        e.preventDefault();

        var currentQuery = this._id;
        Queries.remove(currentQuery);
    }
});