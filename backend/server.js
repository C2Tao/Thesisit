var express = require('express'); 
var fs = require('fs');

//paths
var jsonFileForFrontEnd = __dirname + '/json_all.txt';
var frontEndPath = __dirname + '/../public';
var port = 5000;

var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(frontEndPath));

app.get('/query/:querystring', function(req, res){ //api for client to query
     
     console.log('start to run python');

     var python = require('child_process').spawn(
       'python',
       // second argument is array of parameters, e.g.:
       [__dirname + "/generate_json.py", req.params.querystring] //this parameter is the script file you want to run
     );


     // var output = "";
     // //when python dump info to standard output(e.g.:print ...), it would call this callback
     // python.stdout.on('data', function(data){ 
     //    output += data;
     // });
 
     python.on('close', function(){  //when python finished running the script
       
        fs.readFile(jsonFileForFrontEnd, 'utf8', function (err, data) {
          if (err) {
            console.log('Error: ' + err);
            res.status(500); //operation failed;
            return;
          }
         
          data = JSON.parse(data);

          console.log("done");

          res.json(data);
          
        });    

     });
         
   
})
.listen(port, function(){
    console.log('Listening on ' + String(port));
});
