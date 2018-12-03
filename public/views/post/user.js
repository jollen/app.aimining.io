/**
 * SETUP
 **/
  var app = app || {};

/**
 * MODELS
 **/

/***********************************************************************************/
// To be fixed.
  app.Post = Backbone.Model.extend({
    url: '/1/post',
    defaults: {
      errors: [],
      errfor: {},
      posts: []
    }
  });

  app.UserPostView = Backbone.View.extend({
    el: '#posts',
    template: _.template( $('#tmpl-post-item').html() ),
    events: {
    },
    initialize: function() {
        this.model = new app.Post();
        this.listenTo(this.model, 'sync', this.render);
        this.listenTo(this.model, 'change', this.render);

        this.listUserPosts();
        this.render();
    },
    render: function() {
        this.$el.html(this.template( this.model.attributes ));

        $('.btn-publish-post').each(function() {
            var me = $(this);

            var publish = function() {
                var publishMsg = ' Publish (將文章公開)'
                    , unpublishMsg = ' Unpublish (將文章下線)'
                    , subject = me.data('post-subject')
                    , status = me.data('toggle')
                    , href = '/1/post/' + subject;

                me.text(" Saving...");

                if (status === 'publish') {
                    $.ajax({
                        type: "PUT",
                        url: href + '/publish',
                        success: function( response ) {
                          if (!response.success) return;

                          me.text(unpublishMsg);
                          me.data('toggle', 'unpublish')

                          $.notify("文章已公開在網站上。", { position:"bottom right", className: 'success' });
                        }
                    });
                } else {
                    $.ajax({
                        type: "PUT",
                        url: href + '/unpublish',
                        success: function( response ) {
                          if (!response.success) return;

                          me.text(publishMsg);
                          me.data('toggle', 'publish')

                          $.notify("文章將暫時下線，重新 Publish 即可公開在網站上。", {
                            position: 'bottom right',
                            className: 'error'
                          });
                        }
                    });
                }
            }

            me.on('click', function() {
                publish();
            });
        });
    },
    listUserPosts: function() {
        var self = this;
        $.ajax({
            type: "GET",
            url: '/1/post',
            data: '',
            success: function( response ) {
              if (!response.success) return;

              //response.posts.map(function(single) {
              //  single.subject = decodeURIComponent(single.subject);
              //  return single;
              //});

              self.model.set('posts', response.posts);
            }
        });
    }
  });
/***********************************************************************************/

/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.userPostView = new app.UserPostView();
  });
