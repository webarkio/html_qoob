// Load dependency libraries
var http = require('http'),
    fs = require('fs'),
    formidable = require('formidable'),
    path = require('path'),
    url = require('url'),
    Loader = require('./qoob/loader'),
    fs = require('fs');



// Create the http server
var server = http.createServer(onRequest)

// start the server
server.listen(process.env.port || 8000)

console.log('Local Http Qoob Server Running at http://localhost:' + (process.env.PORT || 8000))

var pathToPageData = 'data/pages/';
var pathToEmptyPageData = 'data/pages/empty.json';
var pathToLayout = 'data/html/layout.html';
var pathToQoobHtml = 'data/html/qoob.html';
var pathToQoobDashboard = 'data/html/dashboard.html';

function onRequest(req, res) {
    
    var currentUrl = url.parse(req.url, true);

	if (currentUrl.pathname === "/qoob/"){
		res.writeHead(302, {
		  'Location': '/qoob'
		});
		res.end();
		return;
	}

    if (currentUrl.pathname === "/qoob") {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        var content ='<table>';
        fs.readdir(pathToPageData, function(err, files) {
            for (var i = 0; i < files.length; i++) {
                if(files[i]!=='empty.json'){
                    page = files[i].replace('.json', '');
                    content=content+'<tr><td>'+page+'.html</td><td><a href="'+page+'.html">View</a></td><td><a href="'+page+'.html?edit">Edit</a></td><td>'+(page!='index'?'<a href="'+page+'.html?delete" class="delete">Delete</a>':'')+'</td></tr>';
                }
            }
            content=content+'</table>';
            fs.readFile(pathToQoobDashboard, 'utf8', function (err, data) {
                res.write(data.replace("<!-- qoob pages list -->", content));
                res.end();
            });        

        });
        return;
    }

    if (currentUrl.pathname === "/layout.html") {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        fs.readFile(pathToLayout, 'utf8', function (err, data) {
            data = data.replace("<!-- qoob starter -->", '<script type="text/javascript" src="assets/js/qoob-html-driver.js"></script><script type="text/javascript" src="qoob/qoob-frontend-starter.js"></script><script type="text/javascript">var starter = new QoobStarter({"driver": new QoobHtmlDriver()});</script>');
            res.write(data);
            res.end();
        });        
        return;
    }
    
    if (typeof currentUrl.query.edit !== 'undefined') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        fs.readFile(pathToQoobHtml, 'utf8', function (err, data) {
            res.write(data);
            res.end();
        });        
        return;
    }

    if (typeof currentUrl.query.delete !== 'undefined') {
        var page = currentUrl.pathname.replace('.html','').replace('/','');
        fs.unlink(pathToPageData+page+".json");
        fs.unlink(page+".html");
        res.writeHead(302, {
          'Location': '/qoob'
        });
        res.end();
        return;
    }

    if (req.method == "POST") {
        //Save page data
        if (req.url === "/save") {

            var body = '';

            req.on('data', function(data) {
                body += data;
            });

            req.on('end', function() {
                var data = JSON.parse(body);
                //SAVE page data
                fs.writeFile(pathToPageData+data.page+".json", JSON.stringify(data.data), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/json');
                    res.write('{"success": "true"}');
                    res.end();
                });
                //SAVE html data
                fs.readFile(pathToLayout, 'utf8', function(err, fileData) {
                    if (err) throw err;
                    fileData = fileData.replace("<div id=\"qoob-blocks\"></div>", "<div id=\"qoob-blocks\">" + data.html + "</div>");

                    var scripts = '';
                    var css = '';
                    var loader = new Loader();

                    for (var i = 0; i < data.libs.length; i++) {
                        var libUrl = data.libs[i].url.replace(/\/+$/g, '') + "/";
                        for (var j = 0; j < data.libs[i].res.length; j++) {
                            if (data.libs[i].res[j].src.indexOf("http://") !== 0 && data.libs[i].res[j].src.indexOf("https://") !== 0) {
                                data.libs[i].res[j].src = libUrl + data.libs[i].res[j].src.replace(/^\/+/g, ''); //Trim slashes in the begining
                            }                            
                            loader.add(data.libs[i].res[j]);
                        }
                    }

                    loader.loadJS = function(src, success, error){
                        scripts = scripts + '\n\r<script type="text/javascript" src="'+src+'"></script>';
                        success();
                    };
                    loader.loadCSS = function(src, success, error){
                        css=css+'\n\r<link rel="stylesheet" href="'+src+'">';
                        success();
                    };
                    loader.on('complete', function(){
                        fileData = fileData.replace("</head>", css+scripts + "\n\r</head>");

                        fs.writeFile(data.page+".html", fileData, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                        });

                    });
                    loader.start();

                    //fileData = fileData.replace("var qoobLibs = null;", "var qoobLibs = " + JSON.stringify(data.libs)+";");
                });
            });
        }

        //Save template
        if (req.url === "/save-template") {
            var body = '';
            req.on('data', function(data) {
                body += data;
            });

            req.on('end', function() {
                var data = JSON.parse(body);

                fs.writeFile("data/templates.json", JSON.stringify(data), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/json');
                    res.write('{"success": true}');
                    res.end();
                });
            });
        }

        //Upload image
        if (req.url === "/upload") {
            // parse a file upload
            var form = new formidable.IncomingForm();

            // store all uploads in the /uploads directory
            form.uploadDir = path.join(__dirname, '/uploads');

            // every time a file has been uploaded successfully,
            // rename it to it's orignal name
            form.on('file', function(field, file) {
                fs.rename(file.path, path.join(form.uploadDir, file.name));
            });

            // log any errors that occur
            form.on('error', function(err) {
                console.log('An error has occured: \n' + err);
            });

            // once all the files have been uploaded, send a response to the client
            form.on('end', function() {
                /* The file name of the uploaded file */
                var fileName = this.openedFiles[0].name;

                var pathImg = form.uploadDir.replace(__dirname, '');

                var response = {
                    url: pathImg.replace(/\\/g, "/") + "/" + fileName
                };

                res.end(JSON.stringify(response));
            });

            // parse the incoming request containing the form data
            form.parse(req);
        }

        return;
    }


    // find the file name from the url
    var fileName = req.url.slice(1) !== '' ? req.url.slice(1) : 'index.html';

    //parse url for ?
    fileName = (fileName.split("?").length > 1 ? fileName.split("?")[0] : fileName);

    // create a full path to that file
    var filePath = path.join(__dirname, fileName)

    // check if this file exists
    fs.exists(filePath, function(exists) {

        // if it does, then stream it to the browser
        if (exists) {
            var parts = fileName.split(".");

            if (parts.length > 1) {
                if (parts[parts.length - 1] === "css") {
                    res.setHeader('Content-Type', 'text/css')
                } else if (parts[parts.length - 1] === "js") {
                    res.setHeader('Content-Type', 'text/js')
                }

            }

            fs.createReadStream(filePath).pipe(res)
        } else {
            if (currentUrl.pathname.lastIndexOf('/'+pathToPageData, 0) === 0){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html');
                    fs.readFile(pathToEmptyPageData, 'utf8', function (err, data) {
                        res.write(data);
                        res.end();
                    });        
                    return;    
            }

            // if not, then we set our status code to 404, and send an error page
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/html')
            res.write('<style>body{ font-family: "Helvetica Neue"; text-align: center; font-size: 3em; font-weight: 300; }</style> \
                <h1>404</h1> \
                <p><b>' + req.url + '</b> not found</p>')
            res.end()
        }

        // get the current date
        var now = new Date();
        if (res.statusCode != 200) {
            console.log(now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds(),
                    '-', req.method,
                    '-', req.url,
                    '-', res.statusCode)
        }
    })
}
