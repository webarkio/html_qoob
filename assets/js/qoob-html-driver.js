/**
 * Class for work with ajax methods
 *  
 * @version 0.0.1
 * @class  QoobHtmlDriver
 */
//module.exports.QoobHtmlDriver = QoobHtmlDriver;
function QoobHtmlDriver(options) {
    var options = options || {};
    this.page = options.page || 'index';
    this.libsJsonUrl = options.libsJsonUrl || "data/libs.json";
    this.pageDataUrl = options.pageDataUrl || "data/pages/" + this.page + ".json";
    this.pageTemplatesDataUrl = options.pageTemplatesDataUrl || "data/templates.json";
    this.frontendPageUrl = options.frontendPageUrl || "layout.html";
    this.saveUrl = options.saveUrl || "save";
    this.savePageTemplateUrl = options.savePageTemplateUrl || "save-template";
    this.savelibsJsonUrl = options.savelibsJsonUrl || "save-labraries";
    this.mainMenuUrl = options.mainMenuUrl || "data/main_menu.json";
    this.libs = options.libs || null;
}

/**
 * Get url iframe
 * 
 * @returns {String}
 */
QoobHtmlDriver.prototype.getIframePageUrl = function(pageId) {
    return this.frontendPageUrl;
};

/**
 * Go to the admin view of the edited page
 * 
 * @returns {String}
 */
QoobHtmlDriver.prototype.exit = function(pageId) {
    window.location.href = '/qoob';
};

/**
 * Save page data
 * 
 * @param {integer} pageId
 * @param {Array} data DOMElements and JSON
 * @param {savePageDataCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.savePageData = function(data, cb) {
    //console.log(JSON.stringify(data));
    data.page = this.page;
    jQuery.ajax({
        url: this.saveUrl,
        type: 'POST',
        data: JSON.stringify(data),
        processData: false,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(response) {
            cb(null, response.success);
        }
    });
};


/**
 * Get page data
 * 
 * @param {integer} pageId
 * @param {loadPageDataCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.loadPageData = function(cb) {
    var self = this;
    jQuery.ajax({
        dataType: "json",
        url: this.pageDataUrl,
        error: function(jqXHR, textStatus) {
            cb(textStatus);
        },
        success: function(data) {
            cb(null, data);
        }
    });
};

/**
 * Get qoob data
 * 
 * @param {loadQoobDataCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.loadLibrariesData = function(cb) {
    if (this.libs) {
        cb(null, this.libs);
    } else {
        jQuery.ajax({
            dataType: "json",
            url: this.libsJsonUrl,
            error: function(jqXHR, textStatus) {

                cb(textStatus);
            },
            success: function(data) {
                var totalLibs = data.length;
                var loadedLibs = 0;
                var libs = [];
                for (var i = 0; i < data.length; i++) {
                    jQuery.ajax({
                        dataType: "json",
                        url: data[i],
                        error: function(jqXHR, textStatus) {
                            loadedLibs = loadedLibs + 1;
                        },
                        success: function(lib) {
                            loadedLibs = loadedLibs + 1;
                            lib.url = this.url.replace('lib.json', '');
                            libs.push(lib);
                            if (loadedLibs == totalLibs) {
                                cb(null, libs);
                            }
                        }
                    });


                }
                //cb(null, data);
            }
        });
    }
};

/**
 * Save page template
 * 
 * @param {savePageTemplateCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.savePageTemplate = function(data, cb) {
    jQuery.ajax({
        url: this.savePageTemplateUrl,
        type: 'POST',
        data: JSON.stringify(data),
        processData: false,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(response) {
            cb(null, response.success);
        }
    });
};

/**
 * Load page templates
 * 
 * @param {loadPageTemplatesCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.loadPageTemplates = function(cb) {
    jQuery.ajax({
        dataType: "json",
        url: this.pageTemplatesDataUrl,
        error: function(jqXHR, textStatus) {
            cb(textStatus);
        },
        success: function(data) {
            cb(null, data);
        }
    });
};

/**
 * Load main menu
 * @param {Array} staticMenu
 * @returns {Array}
 */
QoobHtmlDriver.prototype.mainMenu = function(staticMenu) {
    var self = this;
    var customData = [{
        "id": "save-template",
        "label": "Save as template",
        "action": "",
        "icon": ""
    }, {
        "id": "show-frontend",
        "label": "Show on frontend",
        "action": function() {
            window.open(
                self.page + ".html",
                '_blank'
            );
        },
        "icon": ""
    }];

    return staticMenu.concat(customData);
};

/**
 * Custom field image action
 * @param {Array} actions
 * @returns {Array}
 */
QoobHtmlDriver.prototype.fieldImageActions = function(actions) {
    var self = this;
    var customActions = [{
        "id": "upload",
        "label": "Upload",
        "action": function(imageField) {
            if (!imageField.$el.find('.input-file').length) {
                imageField.$el.find('.image-control').append('<input type="file" class="input-file" name="image">');
            }

            imageField.$el.find('input[type=file]').click();

            imageField.$el.find('input[type=file]').change(function() {
                var file = imageField.$el.find('input[type=file]').val();

                if (file.match(/.(jpg|jpeg|png|gif)$/i)) {
                    var formData = new FormData();
                    formData.append('image', imageField.$el.find('input[type=file]')[0].files[0], imageField.$el.find('input[type=file]')[0].files[0].name);
                    self.upload(formData, function(error, url) {
                        if ('' !== url) {
                            imageField.changeImage(url);
                            imageField.$el.find('input[type=file]').val('');
                            if (imageField.$el.find('.edit-image').hasClass('empty')) {
                                imageField.$el.find('.edit-image').removeClass('empty');
                            }
                        }
                    });
                } else {
                    console.error('file format is not appropriate');
                }
            });
        },
        "icon": ""
    }, {
        "id": "reset",
        "label": "Reset to default",
        "action": function(imageField) {
            imageField.changeImage(imageField.options.defaults);
            if (imageField.$el.find('.edit-image').hasClass('empty')) {
                imageField.$el.find('.edit-image').removeClass('empty');
            }
        },
        "icon": ""
    }];

    var glueActions = actions.concat(customActions);

    return glueActions;
};

/**
 * Custom field video action
 * @param {Array} actions
 * @returns {Array}
 */
QoobHtmlDriver.prototype.fieldVideoActions = function(actions) {
    var self = this;
    var customActions = [{
        "id": "upload",
        "label": "Upload",
        "action": function(videoField) {
            videoField.$el.find('.video-control').find('.input-file').remove();
            videoField.$el.find('.video-control').append('<input type="file" class="input-file" name="video">');

            videoField.$el.find('input.input-file').trigger('click');

            videoField.$el.find('input.input-file').change(function() {
                var s = this;
                var file = jQuery(this).val();

                if (file.match(/.(mp4)$/i)) {
                    var formData = new FormData();
                    formData.append('video', jQuery(this)[0].files[0], jQuery(this)[0].files[0].name);
                    self.upload(formData, function(error, url) {
                        if ('' !== url) {
                            var src = { 'url': url, preview: '' };
                            videoField.changeVideo(src);
                            jQuery(s).val('');
                            if ( ! videoField.$el.find('.edit-video').hasClass('empty') ) {
                                videoField.$el.find('.edit-video').addClass('empty');
                            }
                        }
                    });
                } else {
                    console.error('file format is not appropriate');
                }
            });

        },
        "icon": ""
    }, {
        "id": "reset",
        "label": "Reset to default",
        "action": function(videoField) {
            videoField.changeVideo(videoField.options.defaults);
            if (videoField.$el.find('.edit-video').hasClass('empty')) {
                videoField.$el.find('.edit-video').removeClass('empty');
            }
        },
        "icon": ""
    }];

    var glueActions = actions.concat(customActions);

    return glueActions;
};

/**
 * Upload image
 * @param {Array} data
 * @param {uploadCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.upload = function(data, cb) {
    jQuery.ajax({
        url: '/upload',
        type: 'POST',
        data: data,
        processData: false,
        contentType: false,
        error: function(jqXHR, textStatus) {
            cb(textStatus)
            console.error(textStatus);
        },
        success: function(data) {
            var json = JSON.parse(data);
            cb(null, json.url);
        }
    });
}
