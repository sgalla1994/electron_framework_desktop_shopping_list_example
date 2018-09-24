//required modules
const electron = require("electron");
const url = require("url");
const path = require("path");

//grabbing modules from electron directly
const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENVIRONMENT
process.env.NODE_ENV = 'development';

//variable for our main app window
let mainWindow;

//variable for add window where we will add items to our list
let addWindow;

//listen for app to be ready 
app.on('ready', function() {
    //create new window
    mainWindow = new BrowserWindow({});
    //load html file into window - file://dirname/mainWindow.html - this is passing this route into url
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    //quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});

//handle create add window
function createAddWindow(){
    //create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    //load html file into window - file://dirname/addWindow.html - this is passing this route into url
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    //garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

//catch item:add from addWindow.html
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});



//create menu template
const mainMenuTemplate = [
    {
        label:'Options',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                //add hotkey to quit program
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if mac add empty object to meanu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//add dev tools item if not in production
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}