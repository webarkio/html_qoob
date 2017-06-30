jQuery(document).ready(function() {
    // Init masonry blog list
    jQuery('.blog-list').masonry({
        itemSelector: '.col-lg-4',
        percentPosition: true,
        resize: true
    });

    window.onscroll = function() {
        if (window.pageYOffset > 107) {
            jQuery('.site-header.fixed').addClass('move');
        } else {
            jQuery('.site-header.fixed').removeClass('move');
        }
    };

    jQuery(window).resize(function() {
        jQuery('.blog-list').masonry('reloadItems');
    });


    if (typeof Hammer !== "undefined") {
        // Init hammer
        var hammer = new Hammer.Manager(document.documentElement, {
            touchAction: 'auto',
            inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
            recognizers: [
                [Hammer.Swipe, {
                    direction: Hammer.DIRECTION_HORIZONTAL
                }]
            ]
        });

        hammer.on("swiperight swipeleft", function(e) {
            if (e.type === 'swiperight') {
                parent.postMessage("SwipeRightPageMessage", "*");
            } else if (e.type === 'swipeleft') {
                parent.postMessage("SwipeLeftPageMessage", "*");
            }
        });
    }
});

// Loader fading out
jQuery(window).load(function() {
    jQuery(".loader").fadeOut();
    jQuery(".loader-wrap").delay(400).fadeOut("slow");
});
