# README #
This README would normally document whatever steps are necessary to get this application up and running.
### What is this repository for? ###
*Node application
*Landing website for Receiptbot Application

### Steps to follow run in local ###

* git clone
* Execute npm install in the project directory to get all dependency modules.
* Execute 'node server.js' in cmd after going into the project directory . if you want to change the port number then open the index.js and edit the port number from 3000 to needed value. 
* Now hit localhost:3000/ to get the home page.
> Note
 *index.js is only the routing configration file added so for. 2. all the static contents like images,css,js are getting served from public folder. you can find code for this in index.js.


### Steps to follow run in server ### 
* Open the amazon instance for cloudadic website and navigate to folder /home/www.receiptbot.com/receipt-bot
* Execute the git pull link to get the latest code base. 
* Run npm install to check all the modules were updated or not. 
* Execute '''sudo forever stopall''' to stop all the node process running. if one or more node server running then stop specific server alone after checking the process which are all running. we are using a npm module called forever-service to run the server even after closing the terminal. 
* Default port number 86 added for this site as port number 86 is configured for receipt bot in DNS so this needs to be added. and created forever-service "receiptbot" to start service when ever cloudadic restarted. 
* To handle the service manually 
Start - "sudo service receiptbot  start" 
Stop - "sudo service receiptbot  stop" 
Status - "sudo service receiptbot status" 
Restart - "sudo service receiptbot  restart" 
* Now open www.receiptbot.com/ http://ec2-34-199-46-132.compute-1.amazonaws.com:86/ to check the updates.