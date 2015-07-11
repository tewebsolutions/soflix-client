# SoFlix Client

## Overview

[Website](http://tewebsolutions.github.io/soflix-client/ "Website").

A Backbone.JS Client for viewing synchronized videos

##Features

 * Upload Movies to Amazon S3 and Stream
 * Create Private Rooms and Invite Friends
 * Synchronized Video Streaming
 * Integrates with Facebook for Authentication
 * Integrates with Dropbox/AWS S3 for Video Uploads 


##Current Status

 * Supports Login, Room Creation, Video Streaming
 * Tested with hard-coded Playlist, AWS upload/transcoding not implemented
 
###TODO

####Client
 * Modularize JS Code into Separate Files (app.js)
 * Create View for Custom Rooms, Profile
 * Implement WebRTC WebCam Sessions
 * Implement Video Upload Feature (Currently hardcoded AWS bucket)


####Server
 * Optimize Beacon Logic
 * Implement AWS S3 Upload Feature

## Prerequisites

   * SoFlix Server - https://github.com/tewebsolutions/soflix-server
   * Bower for Dependency Management
   
## Setting up the app
   * Checkout `git clone https://github.com/tewebsolutions/soflix-client && cd soflix-client`
   * Run `bower install` to download dependencies.
   * Download and setup SoFlix Server
   * Set `CLIENT_PATH` in soflix-server to current directory


## References 
   * SoFlix Server - https://github.com/tewebsolutions/soflix-server