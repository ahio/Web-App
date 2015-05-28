Template.queryItem.helpers({
    own: function () {
        return this.userId == Meteor.userId();
    }
});