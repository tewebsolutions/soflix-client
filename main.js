require.config(
        {
                paths: {
                    jquery: 'assets/components/jquery/jquery',
                    jquerycookie: 'assets/components/jquery-cookie/jquery.cookie',
                    backbone: 'assets/components/backbone/backbone',
                    underscore: 'assets/components/underscore/underscore',
                    furatto: 'assets/components/furatto/documentation/assets/js/furatto',
                    mustache: 'assets/components/mustache/mustache',
                    modernizr: 'assets/components/modernizr/modernizr',
                    gumby: 'assets/components/gumby/js/libs/gumby',
                    jwplayer: 'assets/components/jwplayer-mirror/jwplayer',
                    nprogress: 'assets/components/nprogress/nprogress',
                    messenger: 'assets/components/messenger/build/js/messenger',
                    autogrow: 'assets/components/jquery-autogrow/lib/jquery-autogrow',
                    text: 'assets/components/requirejs-text/text',
                    templateHome: 'app/templates/home.html',
                    templateRooms: 'app/templates/rooms.html',
                    templateRoom: 'app/templates/room.html',
                    templateMain: 'app/templates/main.html',
                    templateProfile: 'app/templates/profile.html',
                    templateVideo: 'app/templates/video.html',
                    templateVideos: 'app/templates/videos.html',
                    templateUserList: 'app/templates/userlist.html'
                },
                shim: {
                    jwplayer: {
                        exports: 'jwplayer'
                    },
                    backbone: {
                        deps: ['underscore', 'jquery'],
                        exports: 'Backbone'
                    },
                    gumby: {
                        deps: ['jquery'] //Shim to ensure jquery is loaded first
                    },
                    underscore: {
                        exports: '_'
                    },
                    nprogress: {
                        deps: ['jquery'],
                        exports: 'NProgress'
                    },
                    messenger: {
                        exports: 'Messenger'
                    },
                    autogrow: {
                        deps: ['jquery'],
                        exports: 'jQuery'
                    }
                }
        }
    );
    require(['nprogress'], function(NProgress){
        console.log("NProgress Started", NProgress);
        NProgress.start();

        
        require(['app'], function(App){
            App.initialize(function(){
                console.log("NProgress Ended");
                NProgress.done();

            });
            
        });
    
    });
    
    