Queries = new Mongo.Collection('queries');

Queries.allow({
	insert: function(userId, doc) {
		return doc && doc.userId === userId;
	},
	remove: function(userId, doc) {
		return doc && doc.userId === userId;
	}
});