(function ($) {
    $(function () {

        $('pre code.language-markup').each(function () {
            $(this).text($(this).html());
        });

        $('.manual > div').hide('fast');

        var helpButton = $('.read-man');
        helpButton.each(function () {
            $(this).on('mouseenter', function () {
                $('body').addClass('hovered');
                var id = $(this).attr('id');
                var heightMask = 0;
                if(id.indexOf('header') != -1) {
                    if(id.indexOf('header-13') != -1) {
                        heightMask += $('.' + id + '-sub').outerHeight();
                    } else if(id.indexOf('header-7') != -1) {
                        heightMask += $('.' + id + '-sub').outerHeight();
                    } else {
                        heightMask += $('header.' + id + ':not(.hidden)').outerHeight();
                        heightMask += $('.' + id + '-sub').outerHeight();
                    }
                } else if(id.indexOf('footer') != -1) {
                    $('footer.' + id).each(function() {
                        heightMask += $(this).outerHeight();
                    })
                    if(id.indexOf('footer-9') != -1) {
                        heightMask += $('section.' + id + '-map').outerHeight();
                    }
                } else {
                    $('section.' + id).each(function() {
                        heightMask += $(this).outerHeight();
                    })
                }

                if (heightMask > $(window).height()) {
                    $('.' + id + '-mask').addClass('big');
                } else if (heightMask <= 80) {
                    $('.' + id + '-mask').addClass('small');
                    heightMask += 30;
                }
                $('.' + id + '-mask').height(heightMask);
                $('.' + id + '-mask').addClass('active');
            });

            $(this).on('mouseleave', function () {
                var id = $(this).attr('id');
                $('body').removeClass('hovered');
                $('.' + id + '-mask').height(0);
                $('.' + id + '-mask').removeClass('active');
            });

            $(this).click(function () {
                var id = $(this).attr('id');
                $('.manual .' + id).show();
                $('html').addClass('read-manual');
                $('html').click(function (e) {
                    var clickedElem = $(e.target);
                    var parentCE = $(e.target).parents();
                    if (!clickedElem.hasClass('read-man') && !clickedElem.hasClass('manual') && !parentCE.hasClass('manual')) {
                        console.log(clickedElem, parentCE);
                        $('.back-button:visible').click();
                    }
                });

            });

        });

        var backButton = $('.back-button');
        backButton.click(function () {
            $('html').removeClass('read-manual');
            $('.manual > div').fadeOut(1000);
        });

        $('.question').click(function () {
            $(this).toggleClass('opened');
        });

    });
})(jQuery);
