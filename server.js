var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer  =   require('multer');
var path = require('path');

const cookieParser = require('cookie-parser');
const connectFlash = require("connect-flash");
const ejs = require('ejs');

var app = express();
app.use(connectFlash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  'secret': '343ji43j4n3jn4jk3n',
  'proxy': true,
  'resave': true,
  'saveUninitialized': true
}));
// app.set('view engine', 'ejs');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'vikas',
	password : 'root',
	database : 'school'
});

app.get('/', function(request, response) {
    // request.flash('errormsg', 'Something went wrong while deleting post!');
    // response.render(path.join(__dirname + '/index.ejs'),{ message: request.flash('errormsg') });
    response.render(path.join(__dirname + '/index.ejs'),{ message: '' });

});
app.get('/login', function(request, response) {
    response.render(path.join(__dirname + '/index.ejs'));
});

app.get('/admin', function(request, response) {
    if (request.session.loggedin == true && request.session.username !='') {
        response.render(path.join(__dirname + '/admin/index.ejs'));
    }else{
        request.flash('success', 'Session Expired..');
        response.render(path.join(__dirname + '/index.ejs'),{ message: request.flash('success') });
    }
});

app.get('/table', function(request, response) {
    if (request.session.loggedin == true && request.session.username !='') {
        //response.render(path.join(__dirname + '/admin/table.ejs'));
        connection.query('SELECT * FROM inspection_job', function(err, result) {
            if(err){
                throw err;
            } else {
                obj = {print: result};
                response.render(path.join(__dirname + '/admin/table.ejs'), obj);                
            }
        });
    }else{
        request.flash('success', 'Session Expired..');
        response.render(path.join(__dirname + '/index.ejs'),{ message: request.flash('success') });
    }
});

app.get('/form', function(request, response) {
    if (request.session.loggedin == true && request.session.username !='') {
        var message = '';
        response.render(path.join(__dirname + '/admin/form.ejs'),{ message: message });
         
    }else{
        request.flash('success', 'Session Expired..');
        response.render(path.join(__dirname + '/index.ejs'),{ message: request.flash('success') });
    }
});


  

var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, file.originalname);  
  }  
});  
const upload = multer({ storage : storage});  
  
// app.post('/uploadfiles',function(req,res){  
//     upload(req,res,function(err) {  
//         if(err) {  
//             return res.end("Error uploading file.");  
//         }  
//         res.end("File is uploaded successfully!");  
//     });  
// });

app.post('/uploadfiles',upload.single('myfile'), async (req, res) => {
    responseData = [];
    requestId    = [];
      if(!req.file) {  
            req.flash('success', 'File Not uploaded..!');  
      }  
      try {
        var details = {
          admin_username  :  req.body['admin_username'],
          admin_password  :  req.body['admin_password'],
          t_staff_type    :  req.body['t_staff_type'],
          profile_pic     :  req.file.originalname,
      }
      var query = connection.query('INSERT INTO meadmin SET ?', details, function(err, result) {
        console.log('inserted data');  
      });
      req.flash('success', 'File uploaded Successfully..!');
      } catch (error) {
          console.log("Error - " + error);
          req.flash('success', 'File Not uploaded..!');
      }   
    res.render(path.join(__dirname + '/admin/form.ejs'),{ message: req.flash('success') });   
});


app.get('/logout', function (req, res) {
  // req.session.destroy();
  req.session.username = null;
  req.session.loggedin = false;
  req.flash('success', 'Logout Successfully..!');
  res.render(path.join(__dirname + '/index.ejs'),{ message: req.flash('success') });
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
  	var password = request.body.password;
	  if (username && password) {
		  connection.query('SELECT * FROM meadmin WHERE admin_username = ? AND admin_password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				// response.send('Incorrect Username and/or Password!');
        response.redirect('/login');
			}			
			response.end();
		});
	} else {
		// response.send('Please enter Username and Password!');
    response.redirect('/login');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		connection.query("SELECT * FROM meadmin", function(err, results) {
            results = JSON.stringify(results);
            response.redirect('/admin/');
        	response.end();
		});
	}else{
		response.send('Please login to view this page!');
	}
});

 


// Add inspection job
// app.post('/inspectionjob', async (req, res) => {
//     responseData = [];
//     requestId    = [];
//     console.log("Run...");
//     try {
//     	    var InspectionJob = {
//                 vrm:                req.body['vrm'],
//                 start_date:         req.body['start_date'],
//                 end_date:           req.body['end_date'],
//                 axle_id:            req.body['axle_id'],
//                 user_id:            req.body['user_id'],
//                 tech_id:            req.body['tech_id'],
//                 report:             req.body['report'],
//                 inspection_status:  req.body['inspection_status'],
//                 user_name:          req.body['user_name'],
//                 tech_name:          req.body['tech_name']
//             }
//             var query = connection.query('INSERT INTO inspection_job SET ?', InspectionJob, function(err, result) {
// 			});
// 			 console.log(query.sql);


//         // }
//         responseData.push({
//             'msg'       : 'Inspection job has been created successfully!',
//             'status'    : 'Success',
//             'data'      : requestId 
//         });
//     } catch (error) {
//         console.log("Error - " + error);
//         responseData.push({
//             'msg'       : 'Inspection job not created. Try again!',
//             'status'    : 'Fail',
//             'data'      : '' 
//         });
//     }    
//     res.status(200).send(responseData);    
// });

app.listen(8080);