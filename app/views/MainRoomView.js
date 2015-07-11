define(['app'], function(app) {
    
    var views = {};
    
    var helper_profilepic = function() {
    return function(text, render) {
      return '<img class="user-list-item-thumb" class="circular" src="http://graph.facebook.com/'+render(text)+'/picture?type=square&width=25&height=25"/>';
    }
  }
 var helper_statusclass = function() {
    return function(text, render) {
        var classname='icon-stop';
        switch(render(text))
        {
            case "PLAYING":
                classname='icon-play';
                break;
            case "IDLE":
                classname='icon-stop';
                break;
            case "PAUSED":
                classname='icon-pause';
                break;    
        }
        return classname;
    }
  }

    views.userList = app.Backbone.View.extend ({
        name: 'User List View',
        template: app.templates.userlist,
        initialize: function(params) {
            var self = this;
            
            console.log(">> ", self.name, self.collection, "Initialzing");

            
        },
        update: function(data){
            var self = this;
            console.log(">> ", self.name, " Updating", data);
            self.collection = data;
            self.render();
        },
        render: function() {
            var self = this;
            console.log(">> ", self.name, "Rendering");
            var html = app.Mu.render(self.template, {users: self.collection.toJSON(), statusclass: helper_statusclass});
          
            self.$el.html(html);
   
            return self;
        }
    });
    
    views.mainRoom = app.Backbone.View.extend({
        el: '#content',
        name: 'Main Room View',
        
        template: app.templates.main,
        templateMessage: '{{#messages}}<div class="row message-item"><div class="{{#profile}}ten columns {{/profile}}message-body">{{message}}</div>{{#profile}}<div class="two columns message-from">{{#profile_pic}}{{from.id}}{{/profile_pic}}</div>{{/profile}}<div class="message-timestamp">{{timestamp}}</div></div>{{/messages}}',
        initialize: function(params) {
            var self = this;
            self.el = '#content';
            console.log(">> ", self.name, "Initialzing");
            
            self.collection = params.userList;
            self.ot = null;
            self.userList = new app.src.views.UserList();
            self.userList.collection = params.userList;
            
            
        },
        events:{
            'keyup #msg_input': 'sendMessage',
            'click #enableVideo': 'enableVideo',
            'click #toggleWebcam': 'toggleWebcam',
            'click #muteAll': 'muteAll',
        },
        enableVideo: function(){
            var self = this;
            self.ot = new app.src.functions.OpenTok('ot_container', app.models.Main, app.models.User);
            console.log(self.ot);
        },
        toggleWebcam: function(){
            var self = this;
            if (!self.ot)
            {
                return false;
            }
            self.ot.showWebcam();
        },
        muteAll: function(){
            var self = this;
            if (!self.ot)
            {
                return false;
            }
            self.ot = app.src.functions.OpenTok('ot_container', app.models.Main, app.models.User);
            
        },
        updateCurrent: function(idx){
            var self = this;
            console.log("Playlist idx ",idx);
            var vid = jwplayer().getPlaylistItem(idx);
            var title = vid.title;
                        
            self.$el.find('.video-title').html(title);
              
        },
        updateMessages: function(d){
            var self = this;
            var r = d || app.functions.Chat.getMessages();
            
            
            var data = {messages:r.messages, profile_pic: helper_profilepic};
            console.log(">> ", self.name, " Sub view updateMessages Rendering ", data );
           
            self.$el.find('#msg_list').html(app.Mu.render(self.templateMessage, data));
            var msg_list = self.$el.find('#msg_list');
            var height = msg_list.scrollTop() + msg_list.height() +  $('#msg_list').filter('.row message-item:last').scrollTop();
             
            msg_list.animate({'scrollTop' : height}, 1000);
        },
        updateUserList: function(e){
            var self = this, data = {};
            self.userList.render();
            
            self.$el.find('#friends').html(self.userList.$el.html());
   
        },
        setCollection: function(_collection){
            var self = this;
            console.log("Setting view collection");
            if (typeof self.userList !== "undefined")
            {
                self.userList.collection = _collection;
                self.userList.collection.on('remove', function(){self.updateUserList.call(self)});   
                self.userList.collection.on('change',function(){self.updateUserList.call(self)});   
                self.userList.collection.on('add',function(){self.updateUserList.call(self)});   
            }
        },
        sendMessage: function(e){
            if ( e.which === 13 ) { 
                var msg = $('#msg_input').val();
                if (msg.length > 0)
                {
                    console.log(app.functions.Chat);
                    app.functions.Chat.sendMessage(msg);
                    $('#msg_input').val('');
                }
                
                
            }
        },
        render: function() {
            var self = this;
            console.log(">> ", self.name, " Rendering");
            var html = app.Mu.render(self.template);
            self.userList.render();
            self.$el.html(html);
            
            self.$el.find('#friends').html(self.userList.$el.html());
            var inp = self.$el.find('#msg_input');//.autogrow();
            
            console.log(inp);
            
            return self;
        }
    });
    
    return views;
})