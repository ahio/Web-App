Router.configure({
	layoutTemplate: 'layout',
	waitOn: function() {Meteor.subscribe('queries');}
});

Router.route('/', function() {
	this.render('mapView');
});

var requireLogin = function() {
   if(!Meteor.user()) {
	   if(Meteor.loggingIn()) {
		   this.render('loader');
	   } else {
		   this.render('deny');
	   }
   } else {
       this.next();
   }
};

Router.onBeforeAction(requireLogin);