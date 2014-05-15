var express = require('express'); 
var app = express();
var fs = require('fs');

app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
//app.use(express.static(__dirname + '/'));

app.get('/demo_json', function(req, res){
     
     var python = require('child_process').spawn(
       'python',
       // second argument is array of parameters, e.g.:
       [__dirname + "/generate_json.py"] //this parameter is the script file you want to run
     );
     var output = "";
     
     //when python dump info to standard output(e.g.:print ...), it would call this callback
     python.stdout.on('data', function(data){ 
        output += data;
     });
     
     //when python finished running the script
     python.on('close', function(code){ 
    
       //I think here we can read from the json file that we saved in python script

     });
         
   
})
.listen(5000, function(){
  console.log('Listening on 5000');
});
