const $ = require("jquery");
const { ipcRenderer } = require("electron");
const { exec, spawn } = require("child_process");

var app_name = undefined
var app_data = undefined

function get_app_info () {
    $.getJSON(`${STORE_SERVER}/api/appview?id=${window.location.hash.slice(1)}`, function (data) {
        app_name = data.app.name
        app_data = data

        // Set app title.
        $('#app-title').css('color', data.app.accent)
        $('#app-title').text(app_name)

        // Load app icon.
        $('#app-icon').attr('src', data.app.logo)

        // Load app category
        $('#app-category').text(data.app.category)

        // Load app summary
        $('#app-summary').text(data.app.summary)

        // Load app pointer
        if (data.app.category == 'deb') {
            $('#app-pointer').css('display', 'block')
            $('#app-pointer').text(data.app.deb_pkg_name)
            $('#app-deb-url').css('display', 'block')
            $('#app-deb-url').text(data.app.pointer)
        } else {
            $('#app-pointer').css('display', 'block')
            $('#app-pointer').text(data.app.pointer)
        }

        // Set colors
        $('#app-title').css('color', data.app.accent)
        $('#install_button').css('background-color', data.app.accent)
        $('#install_button').css('border-color', data.app.accent)

        exec(`grep -q '^${app_name.replaceAll(' ', '-')}$' /etc/web-apps/list`, (error, stdout, stderr) => {
            if (!error) {
                if (stderr.trim() == '') {
                    $('#install_button').text('Remove this app')
                    $('#install_button').attr('onclick', 'remove()')
                }
            }
        })

        check_app_backend()
        check_app_status()
    })
}

function app_delete () {
    exec(`zenity --entry --hide-text --title="Authentication required" --width=200 --text="Enter the management password for this app." --timeout=180`, (error, stdout, stderr) => {
        if (stdout.trim() == '') {
            $('#app-delete').text('No password entered')
            $('#app-delete').attr('onclick', '')
            setTimeout(function() {
                $('#app-delete').text('App deletion')
            }, 2000)
        } else {
            $.post(`${STORE_SERVER}/api/delete_app`, { id: window.location.hash.slice(1), pwd: stdout.replace(/(\r\n|\n|\r)/gm, '') }, (data) => {
                if (data.success == 'yes') {
                    $('#app-delete').text('Success!')
                    setTimeout(function() {
                        window.location = 'web-index.html'
                        $('#app-delete').attr('onclick', '')
                    }, 2000)
                } else {
                    $('#app-delete').text('Failed (wrong password?)')
                    setTimeout(function() {
                        $('#app-delete').text('App deletion')
                    }, 2000)
                }
            })
        }
    })
}

function set_app_installed (app_status) {
    if (app_status == true) {
        $('#install_button').text('Remove this app')
        $('#install_button').attr('onclick', 'remove()')
        $('#install_button').removeAttr('disabled')
        $('#install_button').css('display', 'block')
        $('#app-spinner').css('display', 'none')
    } else if (app_status == false) {
        $('#install_button').text('Install this app')
        $('#install_button').attr('onclick', `install()`)
        $('#install_button').removeAttr('disabled')
        $('#install_button').css('display', 'block')
        $('#app-spinner').css('display', 'none')
    }

    if (app_status == 'failed_install') {
        $('#app-spinner').css('display', 'none')
        $('#install_button').text('Failed install')
        setTimeout(function(){
            $('#install_button').text('Install this app')
            $('#install_button').attr('onclick', `install()`)
            $('#install_button').removeAttr('disabled')
        }, 2000)
    } else if (app_status == 'failed_removal') {
        $('#app-spinner').css('display', 'none')
        $('#install_button').text('Failed removal')
        setTimeout(function(){
            $('#install_button').text('Remove this app')
            $('#install_button').attr('onclick', `remove()`)
            $('#install_button').removeAttr('disabled')
        }, 2000)
    } else if (app_status == 'installing') {
        $('#install_button').text('Installing...')
        $('#install_button').attr('disabled', 'disabled');
        $('#install_button').attr('onclick', '')
        $('#app-spinner').css('display', 'block')
    } else if (app_status == 'removing') {
        $('#install_button').text('Removing...')
        $('#install_button').attr('disabled', 'disabled');
        $('#install_button').attr('onclick', '')
        $('#app-spinner').css('display', 'block')
    }
}

get_app_info()