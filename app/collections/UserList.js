define(['app'], function(app) {
    
    var collections = {};
    
    collections.userList = app.Backbone.Collection.extend({
        name: 'User List Collection',
        initialize: function() {
            var self = this;
            self.on('change', function(e){
                console.log("Event ",e);
            })
            console.log(">> ", self.name, "Initialzing");
        }
    });
    
    
    
    return collections;
})