// Example run command: `node app.js 9000 6380 true`; listen on port 9000, connect to redis on 6380, debug printing on.

var express     = require('express')
var http        = require('http')
var path = require('path')
var formidable = require('express-formidable')
var fs = require('fs')
var mv = require('mv')
var bodyParser = require('body-parser')


if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);

    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}

// Data handling
var save = function save(d) {
    redis.hmset(d.postId, d)
    //if( debug )
    console.log('saved to redis: ' + d.postId +', at: '+ (new Date()).toString())
    var dir = 'public/data/'+d.current_user;

    // save file session
    if(d.upload_session){
        var fn = Object.keys(d.files);
        //console.log(fn);
        for(var f in fn){
            var c = dir+'/'+fn[f];
            fs.writeFile(c, d.files[fn[f]]);
            fs.appendFile(dir+'/indexing.txt',fn[f]+'\n');
        }
        var n = 'output/' + d.postId + '.json'
        fs.writeFile(n, JSON.stringify(d), 'utf8','\t')
    }
    // sign in session
    if(d.sign_in_session){
        fs.appendFile(dir+'/log.txt', 'Logged in at '+(new Date())+'\n');
    }

    // sign up session
    if(d.sign_up_session){
        fs.writeFile('public/auth/user.csv', d.u_title);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        // create log
        fs.writeFile(dir+'/log.txt', 'Activated at '+(new Date())+'\n');
        // file indexing
        fs.writeFile(dir+'/indexing.txt', 'output.csv'+'\n');
        // create sample file
        fs.createReadStream('public/data/output.csv').pipe(fs.createWriteStream(dir+'/output.csv'));
        fs.writeFile(dir+'/output.conf','');
    }
}





// Server setup
var app = express()
app.use(express.bodyParser())
app.use(express.static(__dirname + '/public'))
app.set('port', (process.env.PORT || 5000));


// Handle POSTs from frontend
app.post('/', function handlePost(req, res) {
    // Get experiment data from request body
    var d = req.body
    // If a postId doesn't exist, add one (it's random, based on date)
    if (!d.postId) d.postId = (+new Date()).toString(36)
    // Add a timestamp
    d.timestamp = (new Date()).getTime()
    // Save the data to our database
    save(d)
    // Send a 'success' response to the frontend
    res.send(200)
})




//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(formidable({
    uploadDir: '/public/'
}));


var url = require('url');

app.get('/',function(req,res){
    console.log("code for uploading");
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    console.log(query)
    res.sendfile(path.join(__dirname+'/public/modules/consent.html'));
});

// app.get('/disclosure',function(req,res){
//     res.sendfile(path.join(__dirname+'/public/modules'+'/disclosure_test.html'));
// });

//
// app.get('/', function(req,res) {
//     console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")
//     var url_parts = url.parse(req.url, true);
//     var query = url_parts.query;
//     console.log(query)
// })

// app.post('/',function(req,res) {
//     //console.log("moving code");
//     var files = req.files;
//     var oldpath = files.filetoupload.path;
//     //var newpath = "./public/" + files.filetoupload.name;
//     // var newpath = "./public/data/" + "output.csv";
//     var newpath = "./public/data/" + req.body.type;
//     console.log(req)
//     mv(oldpath, newpath, function (err) {
//         if (err) {
//             throw err;
//         };
//     });
//     console.log('File uploaded');
//     //res.write('<p>File uploaded</p> </br>');
//     // res.write('<button onclick="location.href = '/';" id="myButton" class="float-left submit-button" >Home</button>');
//     res.end();
// });

// Create the server and tell which port to listen to
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
