var express = require('express');
var router = express.Router();
var Comment = require('../models/comments');
var jwt = require('jsonwebtoken');
var User = require('../models/users');
var moment = require('moment-timezone');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('aboutus', { title: 'Loop' });
});

router.get('/feed', function(req, res, next) {
        try{
                var jwtString = req.cookies.Authorization.split(" ");
                var profile = verifyJwt(jwtString[1]);
                if(profile){
                        res.render('feed', {title : 'Loop'});
                }
        }
        catch(err){
                res.render('error', {message : "You are not logged in."});
        }
});

router.get('/play', function(req, res, next) {
        res.render('play');
});

router.get('/aboutus', function(req, res, next) {
        res.render('aboutus');
});

router.get('/local', function(req, res, next) {
        res.render('local');
});

router.get('/loops', function(req, res, next) {
        res.render('loops');
});

router.get('/profile', function(req, res, next) {
	try{
                var jwtString = req.cookies.Authorization.split(" ");
                var profile = verifyJwt(jwtString[1]);
                if(profile){
                        res.render('profile', {});
                }
        }
        catch(err){
                res.render('error', {message : "You are not logged in."});
        }
});

router.get('/loops/sports', function(req, res, next) {
  res.render('sports', {});
});

router.get('/loops/college', function(req, res, next) {
  res.render('college', {});
});

router.get('/loops/tv', function(req, res, next) {
  res.render('tv', {});
});

/**
 * Adds comments to our database
 */
router.post('/addComment', function(req, res, next) {
    // Extract the request body which contains the comments
    comment = new Comment(req.body);
    comment.date_created = moment().tz("Europe/Dublin").format();
    comment.save(function (err, savedComment) {
        if (err)
            throw err;

        res.json({
            "id": savedComment._id
        });
    });
});

/**
 * Returns all comments from our database
 */

router.get('/getComments', function(req, res, next) {
    var mysort = {date_created : 1};
    Comment.find({}, function (err, comments) {
        if (err)
            res.send(err);
	comments.sort(mysort);
        res.json(comments);
    });
});

router.get('/getMyPosts', function(req, res, next) {
    var jwtString = req.cookies.Authorization.split(" ");
    var profile = jwtString[0];
    var mysort = {date_created : 1};
    Comment.find({user_name:profile}, function (err, comments) {
        if (err)
            res.send(err);
        comments.sort(mysort);
        res.json(comments);
    });
});

router.get('/getComments/:loop', function(req, res, next) {

    var loop = req.params.loop;
    var mysort = {date_created : 1};
    Comment.find({loop:loop}, function (err, comments) {
        if (err)
            res.send(err);
        comments.sort(mysort);
        res.json(comments);
    });
});

router.get('/generic', function(req, res, next) {
  res.render('generic', {});
});

router.get('/chooseLoop/:loop', function(req, res, next) {

    var loop = req.params.loop;
    var posts = "";
    var mysort = {date_created : 1};
	try{
                var jwtString = req.cookies.Authorization.split(" ");
                var profile = verifyJwt(jwtString[1]);
                if(profile){
                        Comment.find({loop:loop}, function (err, comments) {
        		if (err)
        		{
        		   res.send(err);
        		}
        		comments.sort(mysort);
        		res.render('generic',{"comment" : comments});
        		});
                }
        }
        catch(err){
                res.render('error', {message : "Access Denied. You are not logged in."});
        }
});

router.get('/chooseCollege/:college', function(req, res, next) {

    var college = req.params.college;
    var posts = "";
    var mysort = {date_created : 1};
        try{
                var jwtString = req.cookies.Authorization.split(" ");
                var profile = verifyJwt(jwtString[1]);
                if(profile){
                        Comment.find({college:college}, function (err, comments) {
                        if (err)
                        {
                           res.send(err);
                        }
		        comments.sort(mysort);
			res.render('generic',{"comment" : comments});
                        });
                }
        }
        catch(err){
                res.render('error', {message : "Access Denied. You are not logged in."});
        }
});

router.get('/getUser/:user_name', function(req, res, next) {
    var name = req.params.user_name;
    User.find({user_name:name}, function (err, users) {
        if (err)
            res.send(err);
        res.json(users);
    });
});

/**
  Updates a comment already in the database
 */
router.put('/updateComment/:id', function(req, res, next){

    var id = req.params.id;
    Comment.update({_id:id}, req.body, function (err) {
        if (err)
            res.send(err);

        res.json({status : "Successfully updated the document"});
    });
});

router.put('/editUserBio', function(req, res, next){
    var jwtString = req.cookies.Authorization.split(" ");
    var profile = verifyJwt(jwtString[1]);
    var username = jwtString[0];
    if(profile)
    {
         User.update({user_name:username}, req.body, function (err) {
        if (err)
            res.send(err);

        res.json({status : "Successfully updated Bio"});
    });
    }
});

router.post('/addUserPic', function(req, res, next){
    var jwtString = req.cookies.Authorization.split(" ");
    var profile = verifyJwt(jwtString[1]);
    var username = jwtString[0];
    if(profile)
    {
         User.update({user_name:username}, req.body, function (err) {
        if (err)
            res.send(err);

        res.json({status : "Successfully added pic"});
    });
    }
});

/**
 * Deletes a comment from the database
 */
router.delete('/removeComment/:id', function(req, res, next){

    var id = req.params.id;
    var jwtString = req.cookies.Authorization.split(" ");
    var username = jwtString[0];
    Comment.remove({_id:id, user_name:username}, function (err) {
        if (err)
            res.send(err);

        res.json({status : "Successfully removed the document"});
    });
});
module.exports = router;

router.put('/vote/:id', function(req, res, next){
	var id = req.params.id;
	var jwtString = req.cookies.Authorization.split(" ");
	try{
                var profile = verifyJwt(jwtString[1]);
                if(profile){
                                var user_name = jwtString[0];
        			Comment.find({_id:id}, function(err, comment){
                	if(err)
                	{
                        	res.send(err);
                	}
               			 if(comment[0].voted.indexOf(user_name) >= 0)
               			 {
                		        res.send({status : "already voted"});
                		}
               			 else
               			 {
                			        comment[0].up_votes = comment[0].up_votes + req.body.vote;
                			        comment[0].voted += " " + user_name;
                			        Comment.update({_id:id}, {voted : comment[0].voted, up_votes : comment[0].up_votes}, function(err){if(err){res.send(err)}})
                			        res.send({status:"Up - Voted"});
                			}
			})
                }
        }
        catch(err){
                res.render('error', {message : "You are not logged in."});
        }
});

function verifyJwt(jwtString)
{
        var value = jwt.verify(jwtString, "CSIsTheWorst");
        return value;
}
