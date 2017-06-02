jQuery(document).ready(function() {
    // Init masonry blog list
    jQuery('.blog-list').masonry({
        // columnWidth: '.col-lg-4',
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

    // Init hammer
    var hammer = new Hammer.Manager(document.documentElement);
    var swipe = new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammer.add(swipe);
    hammer.on("swiperight swipeleft", function(e) {
        if (e.type === 'swiperight') {
            parent.postMessage("SwipeRightPageMessage", "*");
        } else if (e.type === 'swipeleft') {
            parent.postMessage("SwipeLeftPageMessage", "*");
        }
    });
});


// Loader fading out
jQuery(window).load(function() {
    jQuery(".loader").fadeOut();
    jQuery(".loader-wrap").delay(400).fadeOut("slow");
});
