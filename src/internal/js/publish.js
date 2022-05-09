var $ = require('jquery')
var bcrypt = require("bcrypt");

async function publish () {
    $(".is-invalid").removeClass("is-invalid")

    var isValid = true
    $('input').each(function() {
        if ( $(this).val() === '' ) {
            if (this.id !== 'deb-pkg-name') {
                $(this).addClass('is-invalid')
                isValid = false
                return false
            } else if ($('#category').val() != 'deb') {
                isValid = true
            } else {
                $(this).addClass('is-invalid')
                isValid = false
                return false
            }
        }
    });

    if (isValid && $('#category').val() == null) {
        $('#category').addClass('is-invalid')
        isValid = false
    }

    if (isValid) {
        let pwd = await require('bcrypt').hash(require('jquery')('#password').val(), await require('bcrypt').genSalt())

        $.post(`${STORE_SERVER}/api/publish`, {
            'name': $('#name').val(),
            'website': $('#website').val(),
            'logo': $('#logo').val(),
            'summary': $('#summary').val(),
            'pointer': $('#pointer').val(),
            'deb_pkg_name': $('#deb-pkg-name').val(),
            'category': $('#category').val(),
            'accent': $('#accent').val(),
            'pwd': pwd
        }, function (data) {
            window.location = `app-view.html#${data['id']}`
        }).fail(function () {
            alert('There was an error while publishing the app.')
        })
    }
}

$('#category').on('input', () => {
    if ($('#category').val() === 'deb')
        $('#deb-pkg-name-group').css('display', 'block')
    else
        $('#deb-pkg-name-group').css('display', 'none')
})