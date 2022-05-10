const $ = require("jquery");

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    require('electron').shell.openExternal(this.href);
});

function get_featured_apps () {
    $.getJSON(`${STORE_SERVER}/api/home`, function (data) {
        window.featured_apps = data.featured_apps

        // Clear apps
        $('.featured-card').each(function(i) {
            this.style.display = 'none';
        })

        data.featured_apps.forEach((app_id, i) => {
            let card_i = i + 1

            $.getJSON(`${STORE_SERVER}/api/appview?id=${app_id}`, function (data) {
                app_name = data.app.name
                app_data = data

                // Show app.
                $('#featured-card' + card_i + '-card').css('display', 'flex')

                // Set app title.
                $('#featured-card' + card_i + '-title').text(data.app.name)

                // Load app icon.
                $('#featured-card' + card_i + '-img').attr('src', data.app.logo)

                // Load app category
                $('#featured-card' + card_i + '-category').text(data.app.category)

                // Load app summary
                $('#featured-card' + card_i + '-summary').text(truncateText(data.app.summary, 36))
            })
        });
    })
}

function get_top_apps () {
    $.getJSON(`${STORE_SERVER}/api/home`, function (data) {
        window.apps = data.latest_apps

        // Clear apps
        $('.app-card').each(function(i) {
            this.style.display = 'none';
        })

        // Apps
        try { let app_title_i = 0
        $('[id^="app-card"][id$="-title"]').each(function () {
            $('#' + this.id).text(data.latest_apps[app_title_i].name)
            $(('#' + this.id).replace('-title', '-card')).css('display', 'flex')
            app_title_i++
        }) } catch {}

        try { let app_img_i = 0
        $('[id^="app-card"][id$="-img"]').each(function () {
            $('#' + this.id).attr('src', data.latest_apps[app_img_i].logo)
            app_img_i++
        }) } catch {}

        try { let app_summary_i = 0
        $('[id^="app-card"][id$="-summary"]').each(function () {
            $('#' + this.id).text(truncateText(data.latest_apps[app_summary_i].summary, 36))
            app_summary_i++
        }) } catch {}

        try { let app_category_i = 0
        $('[id^="app-card"][id$="-category"]').each(function () {
            $('#' + this.id).text(data.latest_apps[app_category_i].category)
            app_category_i++
        }) } catch {}
    })
}

show_featured_cards(2, 3)
show_app_cards(4, 3)

get_featured_apps()
get_top_apps()