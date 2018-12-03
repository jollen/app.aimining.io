(function($) {
    // Custom JavaScript for the Side Menu and Smooth Scrolling -->

    // $("#menu-close").click(function(e) {
    //     e.preventDefault();
    //     $("#sidebar-wrapper").toggleClass("active");
    // });

    // $("#menu-toggle").click(function(e) {
    //     e.preventDefault();
    //     $("#sidebar-wrapper").toggleClass("active");
    // });

    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    $("#sidebar-wrapper").toggleClass("active");
                    return false;
                }
            }
        });
    });

})(jQuery);