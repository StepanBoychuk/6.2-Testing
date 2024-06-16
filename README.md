This is my REST API for User managment.
To run this API local in docker use

> docker-compose build

And

>docker-compose up

It have several endpoints:

>GET api/users

will return list of all users.This endpoint has two query parameters such as **page**(by default is set to 0) and **amount**(by default is set to 3)

>GET api/users/:id

will return profile of user with this id.

>POST /api/users/signup

will signup user with data from request body. Request body should have

**nickname** (required), **firstName**, **lastName** and **password**(required) fields.

>POST /api/users/signin

will set authorisation header with JWT token. Require **username** and **password** in request body

>PUT /api/users/:id

will change fields of registered user. Require JWT token in authorisation header. Change the passing fields from request body.

>DEL /api/users/:id

will soft delete user with this id. Require JWT token in authorisation header.

>POST /api/user/vote

will vote for user with :id. Require JWT token in authorisation header and "targetUser" & "voteType" fields in request body. "targetUser" must be a mongodb ObjectId type and  "voteType" can be only "1" or "-1"

>POST /api/users/avatar

will return presigned URL from s3 bucket to upload avatar image. After succsessfully uploading an image, its URL will be saved to database