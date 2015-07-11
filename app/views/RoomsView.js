define(['app'], function(app) {
    var _ = app._;
    return app.Backbone.View.extend({
        name: 'Rooms View',
        template: app.templates.rooms,
        initialize: function(rooms) {
            var self = this;
            self.collection = rooms;
            console.log(">> ", self.name, "Initialzing");

        },
        update: function(rooms) {
            var self = this;
            self.collection = rooms;
        },
        render: function() {
            var self = this;
            console.log(">> ", self.name, "Rendering");
            var subv, sub = "";
         
            $('#content').html(self.$el.html());

            return self;
        }
    });
})