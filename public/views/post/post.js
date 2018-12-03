/**
Copyright (C) 2013 Moko365 Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * SETUP
 **/
var app = app || {};


/**
 * MODELS
 **/
app.Post = Backbone.Model.extend({
    url: function() {
        return '/1/post'
    },
    defaults: {
        errors: [],
        errfor: {},
        subject: '',
        content: '',
        html: ''
    },
    converter: {},          // markdown parser
    editor: {},             // medium editor
    parse: function() {
        converter = new Showdown.converter();
        var html = converter.makeHtml(this.get('content'));     // parse to HTML

        this.set('html', html);

        return true;
    },
    editable: function() {
        editor = new MediumEditor('.editable', {
            anchorInputPlaceholder: '輸入網址',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
            diffLeft: 0,
            diffTop: -5,
            firstHeader: 'h1',
            secondHeader: 'h2',
            delay: 100,
            targetBlank: true
        });
    },
    serialize: function() {
        var html = editor.serialize().post.value;   // id='post'

        this.set('html', html);
        this.set('content', html2markdown(html));
    }
});

/**
 * VIEWS
 **/
app.PostsView = Backbone.View.extend({
    el: '.wiki-content',
    content: $('[data-tag="markdown"]').html(),
    events: {
        'click .btn-post-save': 'save',
        'click .btn-post-edit': 'edit'
    },
    initialize: function() {
        this.model = new app.Post();
        this.template = _.template($('#tmpl-post').html());

        // initialize Model (not from server)
        var subject = this.$el.find('[data-tag="subject"]').data('post-subject');
        var id = this.$el.find('[data-tag="id"]').data('post-id');

        this.model.set('subject', subject);
        this.model.set('content', this.content);
        this.model.set('id', id);                  // we're NEW

        this.render();
    },
    render: function() {
        this.model.parse();
        var date = this.$el.find('.wiki-date');
        date.html(moment(date.text()).fromNow());

        this.$el.find('#post').html(this.template( this.model.toJSON() ));
    },
    edit: function() {
        this.editable();
        this.$el.find('.btn-post-save').removeClass('hide');
    },
    save: function() {
        //this.$el.find('.btn-post-save').removeClass('btn-warning').addClass('disabled').text('Saving ...');

        this.model.serialize();         // manage changes
        this.model.save();

        $.notify('已儲存成功', 'success');
    },
    editable: function() {
        this.model.editable();
    },
    /*
     * If we want to use client side content pull, this would works.
     */
    /*
    clientParse: function() {
        $('.wiki-content[data-tag="post"]').each(function () {
            var me = $(this)
                , subject = me.data('post-subject');

              $.ajax({
                url: '/1/post/subject/' + subject,
                type: 'GET',
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if (data.success !== true) return;

                    // parse markdown
                    if (data.post.content.length > 0 ) {
                        var converter = new Showdown.converter();
                        var html = converter.makeHtml(
                            '# ' + decodeURIComponent(data.post.subject)
                            + '\n\n'
                            + data.post.content
                        );
                        $('.wiki-content').html(html);
                    }
                },
                complete: function (data, textStatus, jqXHR) {
                }
              });
        });
    }
    */
});

app.MainView = Backbone.View.extend({
    initialize: function() {
        app.mainView = this;

        app.PostsView = new app.PostsView();
    }
});
/**
 * BOOTUP
 **/


$(document).ready(function() {
    app.mainView = new app.MainView();

    $('.btn-facebook').hover(function() {
    }, function() {});
});

