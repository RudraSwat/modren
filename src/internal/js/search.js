const $ = require("jquery");

function apps_search () {
    $.getJSON(`${STORE_SERVER}/api/search?name=${encodeURI($('#search-text').val())}`, function (data) {
        window.apps = data.results

        // Clear apps
        $('.app-card').each(function(i) {
            this.style.display = 'none';
        })

        // Apps
        try { let app_title_i = 0
        $('[id^="app-card"][id$="-title"]').each(function () {
            $('#' + this.id).text(data.results[app_title_i].name)
            $(('#' + this.id).replace('-title', '-card')).css('display', 'flex')
            app_title_i++
        }) } catch {}

        try { let app_img_i = 0
        $('[id^="app-card"][id$="-img"]').each(function () {
            $('#' + this.id).attr('src', data.results[app_img_i].logo)
            app_img_i++
        }) } catch {}

        try { let app_summary_i = 0
        $('[id^="app-card"][id$="-summary"]').each(function () {
            $('#' + this.id).text(truncateText(data.results[app_summary_i].summary, 30))
            app_summary_i++
        }) } catch {}

        try { let app_category_i = 0
            $('[id^="app-card"][id$="-category"]').each(function () {
                $('#' + this.id).css('font-weight', 'bold')
                $('#' + this.id).text(data.results[app_category_i].category)
                app_category_i++
        }) } catch {}
    })
}

function check_out (i) {
    window.location = 'app-view.html#' + window.apps[i-1]['id']
}

function search () {
    apps_search()
}

show_app_cards()