var canvasSave = {
    START           : 'START',
    COMPLETE        : 'COMPLETE',
    CHECKSAVE       : 'CHECKSAVE',
    strMime         : "image/jpeg",
    strDownloadMime : "image/octet-stream",
    _app            : null,
    _curData        : null,
    _baseURL        : '',
    _saveCount      : 0,
    init: function(a_app) {
        this._app = a_app;
        
        this._app._canvas.addEvent(GC_EVENTS.REFRESHREQUIRE, this.doRefreshRequire.bind(this));
        
        this.setMethod(this.checkMethod());
        
        this._baseURL = Utils.baseURL(document.location.href);
    },
    
    doRefreshRequire: function() {
        this._curData = null;
    },
    
    checkMethod: function() {
    //Href, htmlWindow, imageWindow, toServer, toServerOpen
        var brow = Browser.name;
        var os  = Browser.Platform.name;
        if ((os == 'android') || (os == 'ios')) {
            switch (brow) {
                case 'chrome': return 'Href2';
                case 'firefox': return 'Href2'; 
                case 'opera': return 'imageWindow';  
                case 'safari': return 'imageWindow';
            }
        } else {
            switch (brow) {
                case 'chrome': return 'Href2';
                case 'firefox': return 'Href2'; 
                case 'opera': return 'imageWindow';  
                case 'safari': return 'imageWindow';
            }
        }
        return 'toServer';
    },
    
    setMethod: function(a_method) {
        var clickImpl = (function (onClick) {
            this._app._saveButton.addEvent('click', onClick.bind(this));  
        }).bind(this);
        
        var params = 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=800,height=600';
        var helpBlock = "<div style=\"font-family: Arial, Tahoma; width:800px;\">" + LOCALE.SAVEHELP + "</div>";
        
        switch (a_method) {
            case 'Href':    this._app._saveButton.set({
                                type: "image/jpeg",
                                download: "oformi-foto.ru.jpg"
                            });
                            this._app._saveButton.addEvent('mouseover', this.prepareButton.bind(this));
                            break;
            case 'Href2':   clickImpl(function() {          
                                var a = new Element('a', {
                                    href: this.getDataAsJPG(true),
                                    target: '_blank',
                                    type: this.strDownloadMime,
                                    download: _app.getFileName() 
                                });
                                
                                var dispSave = (function() {
                                    a.dispatchEvent(this._app.createClick());
                                    this._saveCount++;
                                }).bind(this); 
                                
                                _app.fireEvent(this.CHECKSAVE, (function() {
                                    if (this._saveCount >= MAXSAVEADV) {
                                        this._app.afterAdv(dispSave);
                                    } else dispSave();
                                }).bind(this));
                                return false;
                            });
                            break;                            
            case 'htmlWindow': clickImpl(function() {
                                    var win = window.open(this.getDataAsJPG(), 'imageFile', params);
                                    return false;      
                                });
                                break;
            case 'imageWindow': clickImpl(function() {
                                    var win = window.open();
                                    var a_data = this.getDataAsJPG(); 
                                    win.document.body.innerHTML = helpBlock + '<a href="' + a_data.replace(this.strMime, this.strDownloadMime) + '" download="fotoprivet.com.jpg"><img type="' + 
                                                                this.strMime + '" src="' + a_data + '"></img></a>';
                                    return false;    
                                });                                
                                break;
            case 'toServer': clickImpl(function() {
                                this._app.fireEvent(this.START);
                                var win = window.open();
                                win.document.body.innerHTML= helpBlock + '<img type="' + this.strMime + '" src="" id="image"></img>';
                                this.mth_toServer((function(fileName) {
                                    win.document.getElementById('image').src = fileName;
                                    this._app.fireEvent(this.COMPLETE);
                                }).bind(this));
                                return false;    
                            });                                
                            break;
            case 'toServerOpen': clickImpl(function() {
                                this._app.fireEvent(this.START);
                                this.mth_toServer((function(fileName) {
                                    this._app.fireEvent(this.COMPLETE);
                                    var a = new Element('a', {
                                        href: fileName,
                                        target: '_blank' 
                                    });
                                    a.dispatchEvent(this._app.createClick());
                                }).bind(this));
                                return false;    
                            });                                
                            break;                            
            default: clickImpl(function() {
                        this.save(a_method);
                    })
        }
    },
    
    
    prepareButton: function() {
        this._app._saveButton.href = this.getDataAsJPG(true);
    },
    
    save: function(a_method) {
        this._app.fireEvent(this.START);
        this[a_method]((function() {
            this._app.fireEvent(this.COMPLETE);
        }).bind(this));        
    },

    getDataAsJPG: function(replaceMime, resize) {
        if (!this._curData) {                     
            var canvas = this._app.getCanvasResult(resize);
            try {
                var strData = canvas.toDataURL(this.strMime);
                this._curData = replaceMime?strData.replace(this.strMime, this.strDownloadMime):strData;
            } catch (err) {
                console.log(err.name + ' ' + err.message);
                this._curData = '<DATA ERROR>';
            }
            canvas.destroy();
        }
		return this._curData;
    },
    
    mth_toServer: function(doComplete, replaceMime) {
        var fileName = Math.ceil(Math.random() * 1000000); 
        this._app.saveToServer(this._baseURL + '/images/transport.php', fileName, (function() {
            doComplete(this._baseURL + '/images/tmp/' + fileName + '.jpg');      
        }).bind(this), null, 'tmp', replaceMime);
    }
};