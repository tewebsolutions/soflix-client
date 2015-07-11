# SoFlix Client

## Overview

[Website](http://tewebsolutions.github.io/soflix-client/ "Website").

A Backbone.JS Client for viewing synchronized videos

   * Create Video Rooms and Play Shared Videos
   * Authenticate with Facebook
   * Convert videos into different bitrate formats using AWS Elastic Transcoder
   * Chat with Friends, Set up/revoke permissions


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
 * Fix OpenTok Issues
 * Implement Video Upload Feature (Currently hardcoded AWS bucket)

 
####Server
 * Optimize Beacon Feature (Possibly Server Side Events)
 * Implement AWS S3 Upload Feature
  
##Requirements
 * Apache/Nginx for Front-end
 * Node.JS/MongoDB Instance for Back-end
 * Facebook APP ID, OpenTok API Key, AWS Credentials
 * Component Requirements in package.json
 
   

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