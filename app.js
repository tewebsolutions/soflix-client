define(['jquery', 'text'], function($){
    

var app = {}, loader = $.Deferred();

app.src = {};
app.src.models = {};
app.src.collections = {};
app.src.views = {};
app.src.routers = {};
app.src.functions = {};

app.models = {};
app.collections = {};
app.functions = {};
app.views = {};
app.templates = {};
app.routers = {};    
app.$ = jQuery;
app.socket = null;


function log(s){console.log(s)
}
app.src.functions.Chat = function Chat (user, room){
    var self = this;
    self.lastuser = null;
    self.user = user;
    self.room = room;
    self.messages = new Array();
};
app.src.functions.Chat.prototype.sendMessage = function(message){
    var self = this;
    
    console.log("Chat sendMessage ",message);
    var data = {user: self.user, room: self.room, message:message};
    app.socket.emit("chat:message", data);
}
app.src.functions.Chat.prototype.receiveMessage = function(message, cb){
    var self = this;
    if (typeof self.messages == "undefined")
        self.messages = new Array();
        
        function formatTime(time){
            var mins = (time / 60);
            var secs = time % 60;
            
            // Hours, minutes and seconds
            var hrs = time.getHours();
            var mins = time.getMinutes();
            var secs = time.getSeconds();
            var ret = "";
            
            if (hrs > 0)
                ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
            
            ret += "" + mins + ":" + (secs < 10 ? "0" : "");
            ret += "" + secs;
            
            return ret;
        } 

    var d = new Date();
    var msgObj = _.clone(message);
    msgObj.profile = true;
    
    msgObj.timestamp = formatTime(d);
    if (self.lastuser  && (message.from.id == self.lastuser.id))
    {
        msgObj.profile = false;
        
    }
    else
    {
    }
    self.lastuser = msgObj.from;
    
    
    
    self.messages.push(msgObj);
    console.log("Chat receiveMessage ",message);
    if (typeof cb == "function")
        cb(self);
}



app.src.functions.Chat.prototype.getMessages = function(){
    var self = this;
    return self.messages;
};


app.src.functions.Video = function(container_id, room, user){
    var self = this;
    self.sync = true;
    self.room = room;
    self.user = user;
    self.container_id = container_id;
    
    self.player = app.jw(container_id);
    self.jwp = jwplayer();
        
    console.log("Initializing video player");
    
    self.statusemit = setInterval(function() {
        var d = {room: self.room.toJSON(), source: self.user.toJSON(), status:self.getStatus() };
       
        app.socket.emit('player:status', d);
    }, 2000);
    
}

app.src.functions.Video.prototype.log = function(t){
    console.log(t);
}

app.src.functions.Video.prototype.getStatus = function(){
    var self = this;
    var status = {};
    
    status.idx = jwplayer().getPlaylistIndex();
    status.pos = jwplayer().getPosition();
    status.status = jwplayer().getState()
    
    return status;
}

app.src.functions.Video.prototype.configure = function(playlist) {
    var self = this;
    var config = {
        width: "100%",
        aspectratio: "4:3",
        controls: true,
        listbar: {position: 'none'}
    };
    
        
    if (self.room.checkOwner(self.user))
    {
        config.listbar = {
                position: 'bottom',
                layout: 'basic',
                size: 100
            }
    }
    config.playlist = playlist || self.playlist || [];
 
    self.player.setup(config);
    //self.player.onReady(app.views.MainRoom.updateCurrent);
    
    console.log("Configured video player");
}
app.src.functions.Video.prototype.handleEvents = function(event)
{
    var self = this;
    var text = "";
    var user = event.source.displayName;
    
    var index = null;
    
    if (event.idx && event.idx.index)
        {
            index = event.idx.index;
        }
    
    
    function lib_secstominsec(secs)
        {
            if (typeof secs == "undefined")
                return "";
        
            var minutes = Math.floor(secs.toFixed(0) / 60);
            var seconds = secs - minutes * 60;
            return minutes + ':' + seconds
        
        }
        
    if (self.jwp && (index != self.jwp.playlistItem()))
    {
        self.jwp.playlistItem(index);
        app.views.MainRoom.updateCurrent(index);
    }

    switch (event.name)
        {
            case "pause":
                if (jwplayer().getState() == "PLAYING")
                {
                    jwplayer().pause(true)
                }
                text = user + " paused the video";
                break;
                
            case "play":
                jwplayer().play(true);
                text = user + " played the video";
                break;
                
            case "resume":
                jwplayer().play(true);
                
                text = user + " resumed the video";// + lib_secstominsec(event.seektime);
    
                break;
            case "stop":
                text = user + " stopped the video";
                jwplayer().stop();
                break;
                
            case "start":
                text = user + " started the video";
                jwplayer().playlistItem(index);
                app.views.MainRoom.updateCurrent(index);
                break;
            
            case "volume":
                text = user + " changed the volume  to " + event.volume;
                //self.jwp.setVolume(event.volume)
                break;
            
            case "mute":
                text = user + " muted the video";
                jwplayer().setMute(true);
                break;
            
            case "unmute":
                text = user + " unmuted the video";
                jwplayer().setMute(false);
                break;
                
            case "fullscreen":
                text = user + " opened fullscreen";
                break;
                
            case "fullscreenexit":
                text = user + " left fullscreen";
                break;
                
            case "begin":
                text = user + " started video";
                break;
                
            case "finish":
                text = user + " ended video";
                break;
                
            case "seek":
                text = user + " seeked in the video to " + lib_secstominsec(event.seektime);
                jwplayer().seek(event.seektime);
                jwplayer().play(true);
                break;
            default:
                text = "";
        }
        app.Messenger().post(text);
}
app.src.functions.Video.prototype.initEvents = function(room, user)
{
    var self = this;

    
    var idx = jwplayer().getPlaylistIndex();
    
    jwplayer().onReady = (function(evt) {
        //alert("ready");
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'load',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        return true;
    });
    
    jwplayer().onVolume =(function(newVol) {
        //alert("vol");
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'volume',
            'source': self.user,'room': self.room,
            'volume': newVol.volume,
            'timestamp': new Date()
        });
        self.log("Volume Changed to " + newVol.volume);
        return true;
    });
    jwplayer().onMute = (function(evt) {
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'mute',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        self.log("Mute");
        return true;
    });
    jwplayer().onUnmute = (function(evt) {
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'unmute',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        self.log("Unmute");
        return true;
    });
    jwplayer().onFullScreen =(function(evt) {
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'fullscreen',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        self.log("Full Screen Mode");
        return true;
    });

    jwplayer().onPlay (function(evt) {
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'begin',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        app.views.MainRoom.updateCurrent(idx);
        return true;
    });
    jwplayer().onComplete(function(evt) {
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'finish',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        return true;
    });
    jwplayer().onPause (function(evt) {
 
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'pause',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        return true;
    });
    jwplayer().onPlay(function(evt) {
        //alert("play");
        var time = self.jwp.getPosition();
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'resume',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            "seektime": time,
            'timestamp': new Date()
        });
        app.views.MainRoom.updateCurrent(idx);
        return true;
    });
    jwplayer().onBuffer(function(evt) {
        //alert("play");
        var time = self.jwp.getPosition();
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'buffer',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            "seektime": time,
            'timestamp': new Date()
        });
        return true;
    });
    jwplayer().onPlaylistItem(function(idx, pl) {
        var res = app.socket.emit('player:event', {
            'idx': idx,
            'name': 'start',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'timestamp': new Date()
        });
        app.views.MainRoom.updateCurrent(idx);
        
        return true;
    });
    jwplayer().onSeek(function(time) {
        //alert("seek");
        var res =  app.socket.emit('player:event', {
            'idx': idx,
            'name': 'seek',
            'source': self.user.toJSON(),'room': self.room.toJSON(),
            'seektime': time.offset,
            'timestamp': new Date()
        });
        
        return true;
    })
}

app.src.functions.Video.prototype.updatePlaylist = function (playlist)
{
    var self = this;
    if (playlist)
        {
            self.playlist = playlist;
        }
        
    self.jwp.load(self.playlist);
}




app.loadLibs = function(app)
{ 
    var loader = $.Deferred();
    require(['jquery'], function(jQuery){
        //window.Modernizr = Modernizr;
        app.jQuery = jQuery;
        
        require(['underscore','backbone','mustache', 'gumby', 'messenger', 'jwplayer', 'autogrow'], function(Underscore, Backbone,  Mustache, Gumby, Messenger, jw, AutoGrow)
            {
               
                app._ = Underscore;
                app.Backbone = Backbone;
                app.Mu = Mustache;
                
                app.Gu = Gumby;
        
                app.Messenger = Messenger;
                
                app.jw = jw;
                console.log("Loaded Libraries");
                

                loader.resolve();
            });
    });
    return loader.promise();
}

app.loadModels = function(app)
{
    var loader = $.Deferred();
    app.src.models.Video = app.Backbone.Model.extend(
        {
            'name': 'Video',
            'urlRoot': '/api/video',
            'defaults': {
                'title': "Default Title",
                'length': "Default Length",
                'url': "Default URL"
            },
        }
        );
        
    app.src.models.User =app.Backbone.Model.extend(
        {
            'name': 'User',
            'urlRoot': '/api/user',
            'ot_token': '',
            'defaults': { id: '0',
                  displayName: '',
                  photos: [],
                  name: { familyName: '', givenName: '' } }
        }
    );
    
    app.src.models.UserListItem =app.Backbone.Model.extend(
        {
            'name': 'User List Item',
            initialize: function(d){
                
                console.log("Init model ", d);
            },
            'defaults': { id: '',
                   displayName: '',
                   _id: null,
                   __v: 0,
                   photos: [],
                   name: { familyName: '', givenName: ''  }
            }
        }
    );
    
    app.src.models.Room =app.Backbone.Model.extend(
        {
            'name': 'Room',
            'urlRoot': '/api/room',
            defaults: {
                uid: '',
                name: '',
                short_url: '',
                is_private: true,
                owner_id: '',
                ot_session: '',
                playlist: []
            },
            checkOwner : function(user)
            {
                var self = this;
                var user = user.toJSON();
                var owner_id = self.get('owner_id');
                
                console.log("checkOwner ",owner_id, user.id);
                return (owner_id == user.id)
            },
            fetchPlaylist : function()
            {
                var self = this;
                var url = self.urlRoot+'/'+self.get('id')+'/playlist'
                $.getJSON(url, function(data)
                {
                    self.set('playlist', data);
                })
            },
            
            startWebcamSession : function(cb)
            {
                var self = this;
                var url = self.urlRoot+'/'+self.get('id')+'/newRoom'
                $.getJSON(url, function(data)
                {
                    self.set('ot_session', data.session_id);
                    
                    console.log("Added ot session to room");
                    
                    if (typeof cb === "function")
                        cb();
                })
            },
            
            addWebcamClient : function(cb)
            {
                var self = this, user, url = self.urlRoot+'/'+self.get('id')+'/newClient'
                $.getJSON(url, function(data)
                {
                    user = app.collections.userList.get(data.user_id);
                    user.set('ot_token', data.token);
                    
                    console.log("Token data", data);
                    
                    console.log("Added ot token to user");
                    
                    if (typeof cb === "function")
                        cb(user);
                })
            }
        }
    );
    
    app.src.models.Room.prototype.init = function() {
        
        //Init OT
        
        
        app.functions.Chat = new app.src.functions.Chat(app.models.User, app.models.Main);
                        app.functions.Chat = new app.src.functions.Chat(app.models.User, app.models.Main);
                        
                        // Emit ready event with room name.
                        app.socket.emit('ready', app.models.Main.attributes)
                        
                        app.collections.userList = new app.src.collections.userList();
                     
                        
                        
                        // Listen for the announce event.
                        app.socket.on('announce', function(data) {
                            app.Messenger().post("Your request has succeded!");
                            console.log("received ",data);
                        })
                        
                        app.socket.on('user:join', function(data){
                            var name = data.user.displayName;
                            app.Messenger().post(name+" just joined!");
                            console.log("New user ", JSON.stringify(data));
                        })
                        
                        app.socket.on('user:leave', function(data){
                            var name = data.user.displayName;
                            app.Messenger().post(name+" just left!");
                            console.log("User left ", JSON.stringify(data));
                        })
                        
                        app.socket.on('chat:message', function(data){
                            app.functions.Chat.receiveMessage(data, function(d){
                                app.views.MainRoom.updateMessages(d);
                            });
                            console.log(app.views.Main);
                            
                        });
                       
                        

                        app.socket.on('session', function(data){
                            //console.log("Session update",data);
                            app.collections.userList.set(data.userlist);
                            
                            //app.views.MainRoom.updateUserList(app.collections.userList);
                            //console.log("Updated user list ",app.collections.userList.toJSON());
                        })
                        
                        
                        
        setTimeout(function() {
                            app.socket.emit("player:status",app.functions.Video.getStatus());
            }, 1000);
                        
        console.log("Main model ", JSON.stringify(self.attributes));
        app.views.Main.render();
        app.views.MainRoom = new app.src.views.MainRoom({userList: app.collections.userList});
        app.views.MainRoom.setCollection(app.collections.userList);
        
        app.views.MainRoom.render();    
        
        app.functions.Video = new app.src.functions.Video('player',app.models.Main, app.models.User);
        app.functions.Video.updatePlaylist(app.models.Main.get('playlist'));
                        
        
        app.functions.Video.configure();
        app.functions.Video.initEvents();
        
        app.socket.on('playerevent', function(data){
            console.log("playerevent", JSON.stringify(data));
            app.functions.Video.handleEvents(data);
        });
        
        
    }
    
    app.models.User = new app.src.models.User({id: status.user});
    
  
    
    //setTimeout(function(){
                console.log("Loaded Models");
                loader.resolve();
            
                
            //}, 2);
    
    return loader.promise();
}

//Collections
app.loadCollections = function(app)
        {
            var loader = $.Deferred();
            
            app.src.collections.Rooms = app.Backbone.Collection.extend(
                {
                    'name': 'Rooms',
                    'idAttribute': '_id',
                    'url': '/api/rooms',
                    'model': app.src.models.Room
                }    
            );
            
            app.src.collections.userList = app.Backbone.Collection.extend({
                name: 'User List Collection',
                model: app.src.models.UserListItem,
                initialize: function() {
                    var self = this;
                    console.log(">> ", self.name, "Initialzing");
                },
                sync: function(method, model, options){
                    console.log(self.name+" syncing method:", method, " model: ", model, " options", options);
                }
            });
            
            app.collections.Rooms = new app.src.collections.Rooms();

            app.src.collections.Videos = app.Backbone.Collection.extend(
                {
                    'name': 'Videos',
                    'idAttribute': '_id',
                    'url': '/api/videos',
                    'model': app.src.models.Video
                }    
            );
            
            app.collections.Videos = new app.src.collections.Videos();
            
            //setTimeout(function(){
            console.log("Loaded Collections");
            loader.resolve();
            
                
            //}, 2);
            
            return loader.promise();
        }

//Templates
app.loadTemplates = function(app)
        {
            var loader = $.Deferred();
            require(['text!templateHome', 'text!templateRooms', 'text!templateRoom', 'text!templateProfile', 'text!templateVideo', 'text!templateVideos', 'text!templateMain', 'text!templateUserList'], function(_home, _rooms, _room, _profile, _video, _videos, _main, _userlist){
                 app.templates.home = _home;
                 app.templates.rooms = _rooms;
                 app.templates.room = _room;
                 app.templates.profile = _profile;
                 app.templates.video = _video;
                 app.templates.videos = _videos;
                 app.templates.main = _main;
                 app.templates.userlist = _userlist;
                 
                 console.log("Loaded Templates");
                 loader.resolve();
            });
            
            return loader.promise();
        }                

app.state = {loggedIn:false};
//Views
app.loadViews = function(app)
        {
            var loader = $.Deferred();
            
            app.src.views.Main = app.Backbone.View.extend(
                {
                    name: 'Main View',
                    template: app.templates.home,
                    initialize: function(){
                        var self = this;
                        console.log (">> ",self.name, "Initialzing");
                    $(document).on("click", "a:not([data-bypass])", function(evt) {
                          var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
                          var root = location.protocol + "//" + location.host + app.root;
                        
                          if (href.prop && href.prop.slice(0, root.length) === root) {
                            evt.preventDefault();
                            app.Backbone.history.navigate(href.attr, true);
                          }
                        });
                    },
                    user: app.models.User,
                    render: function(){
                        var self = this;
                        
                        var p = {};
                        var pageObj = app.routers.main.current();
                        var page = pageObj.fragment;
                        if (typeof page!==undefined && page)
                        {
                            p[page.toString()] = true;
                        }
                        console.log (">> ",self.name, "Rendering", app.state, p);
                        $('#app').html(app.Mu.render(self.template, {page: p, state: app.state, user: self.user.attributes}));
                        
                        return self;
                    }
                }
            );
            
            require(['app/views/RoomsView', 'app/views/MainRoomView'], function(_roomsView, _mainRoomView)
            {
                app.src.views.Rooms = _roomsView;
                app.src.views.MainRoom  = _mainRoomView.mainRoom;
                app.src.views.UserList  = _mainRoomView.userList;
                
                app.views.Rooms = new app.src.views.Rooms(); 
                
                
                loader.resolve();
            })
            
            
            
            app.src.views.Room = app.Backbone.View.extend(
                {
                    name: 'Room View',
                    template: app.templates.room,
                    initialize: function(room){
                        var self = this;
                        self.model = room;
                        console.log (">> >> ",self.name, "Initialzing", self.model);
                    
                    },
                    render: function(){
                        var self = this;
                        console.log(">> ", self.name, "Rendering", self.model);
                        
                        var html = (app.Mu.render(self.template, self.model));
                        $('#content').html(html);
                        return self;
                    }
                }
            );
            
          
            app.src.views.Profile =  app.Backbone.View.extend({
                        name: 'Profile View',
                        template: app.templates.profile,
                        initialize: function(user){
                          var self=this;
                            self.model = user || app.models.User;
                        },
                        render: function() {
                            var self = this;
                            console.log(">> ", self.name, "Rendering", self.model);
                            
                            $('#content').html(app.Mu.render(self.template, self.model.attributes));
                
                            return self;
                        }
                    })
            app.src.views.Videos =  app.Backbone.View.extend({
                        name: 'Videos View',
                        template: app.templates.videos,
                        initialize: function(user){
                          var self=this;
                            self.model = app.models.User;
                        },
                        events: {
                            'submit #upload_video_form': function(evt){
                                console.log("Submit");
                                var datajson = {};
                                datajson.file_name = $("#file_name").val();
                                datajson.file_url = $("#file_url").val();
                                datajson.video_title = $("#video_title").val();
                                $.post('/api/upload', datajson, function(data, err){
                                    
                                    console.log(data, err);            
                                            
                                })
                                        
                                evt.preventDefault();
                                
                            }
                            
                        },
                        render: function() {
                            var self = this;
                            console.log(">> ", self.name, "Rendering", self.model);
                            
                            var options = {
                                
                                    // Required. Called when a user selects an item in the Chooser.
                                    success: function(files) {
                                        console.log("Dropbox Files ", files);
                                         $("#file_name").val(files[0].name);
                                         $("#file_url").val(files[0].link+'?dl=1');
                                         $('#video_submit').removeAttr("disabled");
                                         
                                        
                                        
                                        console.log("Here's the file link:" + files[0].link);
                                    },
                                
                                    // Optional. Called when the user closes the dialog without selecting a file
                                    // and does not include any parameters.
                                    cancel: function() {
                                
                                    },
                                
                                    // Optional. "preview" (default) is a preview link to the document for sharing,
                                    // "direct" is an expiring link to download the contents of the file. For more
                                    // information about link types, see Link types below.
                                    linkType: "direct", // or "direct"
                                
                                    // Optional. A value of false (default) limits selection to a single file, while
                                    // true enables multiple file selection.
                                    multiselect: false, // or true
                                
                                    // Optional. This is a list of file extensions. If specified, the user will
                                    // only be able to select files with these extensions. You may also specify
                                    // file types, such as "video" or "images" in the list. For more information,
                                    // see File types below. By default, all extensions are allowed.
                                    //extensions: ['.mp4', '.avi', '.mpg'],
                                };
                            var button = Dropbox.createChooseButton(options);
                           
                            
                            
                            self.$el.html(app.Mu.render(self.template, self.model.attributes));
                            self.$('#upload').html(button);
                            self.$el.appendTo("#content");
                            console.log(self.$el.html());
                            return self;
                        }
                    })
            app.views.ChatRoom =app.Backbone.View.extend(
                {
                    'name': 'Chat Room',
                    //template: _.template($('#template-playlist').html())
                }
            );
            
            app.views.VideoPlayer =app.Backbone.View.extend(
                {
                    'name': 'Video Player',
                    collection: app.collections.Playlist,
                    //template: _.template($('#template-userlist').html())
                }
            );
            
            app.views.ChatList = app.Backbone.View.extend(
                {
                    'name': 'Chat User List',
                    collection: app.collections.Userlist,
                    //template: _.template($('#template-chatlist').html())
                }
            );
            
            app.views.Main = new app.src.views.Main();
            app.views.Videos = new app.src.views.Videos();
            //setTimeout(function(){
                console.log("Loaded Views");
               //loader.resolve();
            
                
            //}, 2);
            return loader.promise();
        }        

//Routers
app.loadRouters = function(app)
        {
            var loader = $.Deferred();
            app.src.routers.Main =app.Backbone.Router.extend(
                {
                    routes: {
                        //'rooms/:id':'getRoom',
                        'rooms':'rooms',
                        'main':'main',
                        'videos':'videos',
                        'account/:status':'authorize',
                        '*actions':'default'
                    },
                    current : function() {
                            var Router = this,
                                fragment = Backbone.history.fragment,
                                routes = _.pairs(Router.routes),
                                route = null, params = null, matched;
                        
                            matched = _.find(routes, function(handler) {
                                route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
                                return route.test(fragment);
                            });
                        
                            if (matched) {
                                // NEW: Extracts the params using the internal
                                // function _extractParameters 
                                params = Router._extractParameters(route, fragment);
                                route = matched[1];
                            }
                        
                            return {
                                route : route,
                                fragment : fragment,
                                params : params
                            };
                        }
                }
                      
            );
            
            app.routers.main = new app.src.routers.Main();
            app.routers.main.on('route:rooms', function(id){
                    if (app.state.loggedIn)
                    {
                        app.collections.Rooms.fetch({
                                'success': function(rooms)
                                {
                                    app.views.Rooms.update(rooms);
                                    app.views.Main.render()
                                    app.views.Rooms.render();
                                    console.log("Fetched rooms");
                                }
                        });
                    }
            });
            app.routers.main.on('route:main', function(){
                    if (app.state.loggedIn)
                    {
                        
                        app.models.Main = new app.src.models.Room({
                            id: 1
                        });
                        app.models.Main.fetchPlaylist();
                        
                        console.log(app.models.Main.startWebcamSession);
                        app.models.Main.startWebcamSession();
                                  
                        app.models.Main.fetch({
        success: function (room) {
            var self = room;
            self.init();
            
        }
    });
                        
                        
                    }
            });
            app.routers.main.on('route:videos', function(id){
         
                    console.log("route videos");
                    if (app.state.loggedIn)
                    {
                        app.collections.Videos.fetch({
                            'success': function(videos)
                                {
                                    
                                    console.log("Fetched videos ",videos.length);
                                }
                        });
                        
                                    app.views.Main.render();
                                    app.views.Videos.render();
                                    console.log("Fetched videos");
                               
                    }
                    else
                    {
                        app.routers.main.navigate("", true);
                    }
            });
            app.routers.main.on('route:authorize', function(data){
                    switch (data) 
                    {
                        case "profile":
                            
                            app.$.get('/api/auth/status', function(status){
                                if (status.success)
                                {
                                app.models.User.fetch({
                                    'success': function(user)
                                    {
                                        
                                        app.views.Profile = new app.src.views.Profile(app.models.User);
                                        console.log("Successful auth");
                                        app.state.loggedIn = true;
                                        app.views.Main.render();
                                        app.views.Profile.render();
                                    }
                                });
                                
                                }
                                else
                                {
                                    app.views.Main.render();
                                }
                            });
                        break;
                        case "error":
                            app.state.loggedIn = false;
                            app.views.Main.render();
                         
                        break;
                        case "logout":
                            app.state.loggedIn = false;
                            
                            app.models.User.clear().set(app.models.User.defaults);
                            app.views.Main.render();
                    }
            })
            app.routers.main.on('route:getRoom', function(id)
                    {
                        console.log("Get room", id);
                    });
                    
            app.routers.main.on('route:default', function()
                    {
                        
                        app.views.Main.render()
                        console.log("Default");
                    });
                    
            //setTimeout(function(){
                
                console.log("Loaded Routers");
                loader.resolve();
            //}, 2);
            
            return loader.promise();
        }
app.initialize = function(cb){
    app.root = '/';
   // loader.then(function(){
        app.loadLibs(app).done(function(){
            app.loadModels(app).done(function(){
                app.loadCollections(app).done(function(){
                    app.loadTemplates(app).done(function(){
                        app.loadViews(app).done(function(){
                            //app.state.loggedIn = true;
                            app.loadRouters(app).done(function(){
                                app.start().done(function(){
                                    if (typeof cb == "function")
                                    {
                                        
                                        $(document).on("click", "a:not([data-bypass])", function(evt) {
                                              var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
                                              var root = location.protocol + "//" + location.host + app.root;
                                            
                                              if (href.prop && href.prop.slice(0, root.length) === root) {
                                                evt.preventDefault();
                                                app.Backbone.history.navigate(href.attr, true);
                                              }
                                            });
                                        cb();
                                    }
                                });
                                
                        });
                    });
                });
            });
        });
        });
  //  });
    
    
}

app.start = function(){
    var loader = $.Deferred();
    app.$.get('/api/auth/status', function(status){
                                if (status.success)
                                {
                                    app.models.User.fetch({
                                        'success': function(user)
                                        {
                                            app.socket = io.connect('', { resource: 'api/socket' });
                                           
                                            app.views.Profile = new app.src.views.Profile(app.models.User);
                                            console.log("Successful auth");
                                            app.state.loggedIn = true;
                                            app.Backbone.history.start({pushState: true});
                                            loader.resolve();
                                            console.log("Initialized");
                                        }
                                    });
                                    
                                }
                                else
                                {
                                    app.views.Main.render();
                                    app.Backbone.history.start();
                                    loader.resolve();
                                    console.log("Initialized");
                                }
                            });
    
    
    return loader.promise();
}
return app;

});
