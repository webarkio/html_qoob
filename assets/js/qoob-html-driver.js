/**
 * Class for work with ajax methods
 *  
 * @version 0.0.1
 * @class  QoobHtmlDriver
 */
//module.exports.QoobHtmlDriver = QoobHtmlDriver;
function QoobHtmlDriver(options) {
    options = options || {};
    this.page = options.page || 'index';
    this.pages = options.pages || null;
    this.subDomain = options.subDomain || null;
    this.libsJsonUrl = options.libsJsonUrl || "data/libs.json";
    this.pageDataUrl = options.pageDataUrl || "data/pages/" + this.page + ".json";
    this.pageTemplatesDataUrl = options.pageTemplatesDataUrl || "data/templates.json";
    this.frontendPageUrl = options.frontendPageUrl || "layout.html";
    this.saveUrl = options.saveUrl || "save";
    this.savePageTemplateUrl = options.savePageTemplateUrl || "save-template";
    this.savelibsJsonUrl = options.savelibsJsonUrl || "save-labraries";
    this.mainMenuUrl = options.mainMenuUrl || "data/main_menu.json";
    this.libs = options.libs || null;
    this.translationsUrl = options.translationsUrl || null;
}

/**
 * Get url iframe
 * 
 * @returns {String}
 */
QoobHtmlDriver.prototype.getIframePageUrl = function() {
    return this.frontendPageUrl;
};

/**
 * Go to the admin view of the edited page
 * 
 * @returns {String}
 */
QoobHtmlDriver.prototype.exit = function() {
    window.location.href = window.location.origin + '/qoob';
};

/**
 * Save page data
 * 
 * @param {integer} pageId
 * @param {Array} data DOMElements and JSON
 * @param {savePageDataCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.savePageData = function(data, cb) {
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
                        error: function() {
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
 * Load translations
 * 
 * @param {loadTranslationsCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.loadTranslations = function(cb) {
    jQuery.ajax({
        dataType: "json",
        url: this.translationsUrl,
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
 * @param {Array} menu
 * @returns {Array}
 */
QoobHtmlDriver.prototype.mainMenu = function(menu) {
    var self = this;

    menu.push({
        "id": "save-template",
        "label": {"save_as_template": "Save as template"},
        "action": "",
        "icon": ""
    }, {
        "id": "show-frontend",
        "label": {"showOnFrontend": "Show on frontend"},
        "action": function() {
            window.open(
                self.page + ".html",
                '_blank'
            );
        },
        "icon": ""
    });

    return menu;
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
        "label": {"upload": "Upload"},
        "action": function(imageField) {
            imageField.$el.find('.input-file').remove();
            imageField.$el.append('<input type="file" class="input-file" name="image">');

            imageField.$el.find('.input-file').trigger('click');

            imageField.$el.find('.input-file').change(function() {
                var file = imageField.$el.find('input[type=file]').val(),
                    container = imageField.$el.find('.field-image-container');

                // 2 MB limit
                if (jQuery(this).prop('files')[0].size > 2097152) {
                    container.addClass('upload-error');
                } else {
                    if (file.match(/.(jpg|jpeg|png|gif)$/i)) {
                        var formData = new FormData();
                        formData.append('image', jQuery(this)[0].files[0], jQuery(this)[0].files[0].name);
                        self.upload(formData, function(error, url) {
                            if ('' !== url) {
                                imageField.changeImage(url);
                                imageField.$el.find('input[type=file]').val('');
                                if (container.hasClass('empty') || container.hasClass('upload-error')) {
                                    container.removeClass('empty upload-error');
                                }
                            }
                        });
                    } else {
                        console.error('file format is not appropriate');
                    }
                }
            });
        },
        "icon": ""
    }, {
        "id": "reset",
        "label": {"resetToDefault": "Reset to default"},
        "action": function(imageField) {
            imageField.changeImage(imageField.options.defaults);

            var container = imageField.$el.find('.field-image-container');

            if ('' === imageField.options.defaults) {
                if (!container.hasClass('empty')) {
                    container.addClass('empty');
                }
            } else {
                container.removeClass('empty upload-error');
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
        "label": {"upload": "Upload"},
        "action": function(videoField) {
            videoField.$el.find('.input-file').remove();
            videoField.$el.append('<input type="file" class="input-file" name="video">');

            videoField.$el.find('.input-file').trigger('click');

            videoField.$el.find('.input-file').change(function() {
                var parent = jQuery(this),
                    container = videoField.$el.find('.field-video-container'),
                    file = jQuery(this).val();

                if (container.hasClass('empty') || container.hasClass('upload-error')) {
                    container.removeClass('empty upload-error upload-error__size upload-error__format');
                }

                // 30 MB limit
                if (jQuery(this).prop('files')[0].size > 31457280) {
                    container.addClass('upload-error upload-error__size');
                } else {
                    if (file.match(/.(mp4|ogv|webm)$/i)) {
                        var formData = new FormData();
                        formData.append('video', jQuery(this)[0].files[0], jQuery(this)[0].files[0].name);
                        self.upload(formData, function(error, url) {
                            if ('' !== url) {
                                var src = { 'url': url, preview: '' };
                                videoField.changeVideo(src);
                                parent.val('');

                                if (!container.hasClass('empty-preview')) {
                                    container.addClass('empty-preview');
                                }
                            }
                        });
                    } else {
                        container.addClass('upload-error upload-error__format');
                    }
                }
            });
        },
        "icon": ""
    }, {
        "id": "reset",
        "label": {"resetToDefault": "Reset to default"},
        "action": function(videoField) {
            var container = videoField.$el.find('.field-video-container');

            videoField.changeVideo(videoField.options.defaults);
            if (container.hasClass('empty') ||
                container.hasClass('empty-preview') ||
                container.hasClass('upload-error')) {
                container.removeClass('empty empty-preview upload-error');
            }
        },
        "icon": ""
    }];

    var glueActions = actions.concat(customActions);

    return glueActions;
};

/**
 * Upload image
 * @param {Array} dataFile
 * @param {uploadCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.uploadImage = function(dataFile, cb) {
    var formData = new FormData();
    formData.append('image', dataFile[0], dataFile[0].name);

    this.upload(formData, function(error, url) {
        cb(error, url);
    });
};

/**
 * Upload video
 * @param {Array} dataFile
 * @param {uploadCallback} cb - A callback to run.
 */
QoobHtmlDriver.prototype.uploadVideo = function(dataFile, cb) {
    var formData = new FormData();
    formData.append('video', dataFile[0], dataFile[0].name);

    this.upload(formData, function(error, url) {
        cb(error, url);
    });
};

/**
 * Upload file
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
};