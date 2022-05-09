const $ = require("jquery");

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
            $('#' + this.id).text(truncateText(data.latest_apps[app_summary_i].summary, 30))
            app_summary_i++
        }) } catch {}

        try { let app_category_i = 0
            $('[id^="app-card"][id$="-category"]').each(function () {
                $('#' + this.id).css('font-weight', 'bold')
                $('#' + this.id).text(data.latest_apps[app_category_i].category)
                app_category_i++
        }) } catch {}
    })
}

show_app_cards()
get_top_apps()