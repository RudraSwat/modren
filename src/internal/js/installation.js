var http = require('http');
var fs   = require('fs');

async function handle_snap(name, action) {
    if (action == 'install') {
        const installation = spawn("pkexec", ["snap", "install", name])

        installation.on('close', code => {
            if (code == 0)
                set_app_installed(true)
            else {
                const installation_classic = spawn("pkexec", ["snap", "install", name, "--classic"])

                installation_classic.on('close', code => {
                    if (code == 0)
                        set_app_installed(true)
                    else
                        set_app_installed('failed_install')
                })
            }
        })
    } else if (action == 'remove') {
        const removal = spawn("pkexec", ["snap", "remove", name])

        removal.on('close', code => {
            if (code == 0)
                set_app_installed(false)
            else
                set_app_installed('failed_removal')
        })
    } else if (action == 'installed') {
        const installed = spawn("snap", ["info", name])

        let found_value = undefined;

        installed.stdout.on('data', (data) => {
            if (found_value == true)
                return

            if (data.includes('installed:')) {
                found_value = true
            } else {
                found_value = false
            }
        });

        installed.on('close', (code) => {
            setTimeout(function() {
                if (found_value == true) {
                    set_app_installed(true)
                    return
                } else if (found_value == false) {
                    set_app_installed(false)
                    return
                }
            }, 500)
        });
    }
}

async function handle_apt(name, action) {
    if (action == 'install') {
        const installation = spawn("pkexec", ["apt-get", "install", "-y", name])

        installation.on('close', code => {
            if (code == 0)
                set_app_installed(true)
            else
                set_app_installed('failed_install')
        })
    } else if (action == 'remove') {
        const removal = spawn("pkexec", ["apt-get", "purge", "-y", name])

        removal.on('close', code => {
            if (code == 0)
                set_app_installed(false)
            else
                set_app_installed('failed_removal')
        })
    } else if (action == 'installed') {
        const installed = spawn("dpkg", ["-s", name])

        let found_value = undefined;

        installed.on('close', code => {
            if (code == 0)
                found_value = true
            else
                found_value = false
        })

        installed.on('close', (code) => {
            setTimeout(function() {
                if (found_value == true) {
                    set_app_installed(true)
                    return
                } else if (found_value == false) {
                    set_app_installed(false)
                    return
                }
            }, 500)
        });
    }
}

async function handle_flathub(name, action) {
    if (action == 'install') {
        spawn("pkexec", ["flatpak", "remote-add", "--if-not-exists", "flathub-modren", "https://flathub.org/repo/flathub.flatpakrepo"])

        const installation = spawn("pkexec", ["flatpak", "install", "-y", "--noninteractive", "flathub-modren", name])

        installation.on('close', code => {
            if (code == 0)
                set_app_installed(true)
            else
                set_app_installed('failed_install')
        })
    } else if (action == 'remove') {
        const removal = spawn("pkexec", ["flatpak", "uninstall", "-y", "--noninteractive", "flathub-modren", name])

        removal.on('close', code => {
            if (code == 0)
                set_app_installed(false)
            else
                set_app_installed('failed_removal')
        })
    } else if (action == 'installed') {
        const installed = spawn("flatpak", ["info", name])

        let found_value = undefined;

        installed.stdout.on('data', (data) => {
            if (found_value == true)
                return

            if (data.includes('Installed:')) {
                found_value = true
            } else {
                found_value = false
            }
        });

        installed.on('close', (code) => {
            setTimeout(function() {
                if (found_value == true) {
                    set_app_installed(true)
                    return
                } else if (found_value == false || found_value == undefined) {
                    set_app_installed(false)
                    return
                }
            }, 500)
        });
    }
}

async function handle_deb(deb_url, action) {
    var adapterFor = (function() {
        var url = require('url'),
            adapters = {
                'http:': require('http'),
                'https:': require('https'),
            };
      
        return function(inputUrl) {
            return adapters[url.parse(inputUrl).protocol]
        }
    }());

    if (action == 'install') {
        const mktemp_dir = spawn("mktemp", ["-d"])

        var temp_dir = undefined;

        mktemp_dir.stdout.on('data', data => {
            temp_dir = data.toString()
        })

        mktemp_dir.on('close', error => {
            var file = fs.createWriteStream(temp_dir.trim() + "/file.deb");
            var request = adapterFor(deb_url).get(deb_url, function (response) {
                response.pipe(file);

                response.on('end', () => {
                    setTimeout(function() {
                        installation = spawn("pkexec", ["apt-get", "install", "-y", temp_dir.trim() + "/file.deb"])

                        installation.on('close', code => {
                            if (code == 0)
                                set_app_installed(true)
                            else
                                set_app_installed('failed_install')
                        })
                    }, 500)
                })
            })
        })
    } else if (action == 'remove') {
        const removal = spawn("pkexec", ["apt-get", "purge", "-y", app_data.app.deb_pkg_name])

        removal.on('close', code => {
            if (code == 0)
                set_app_installed(false)
            else
                set_app_installed('failed_removal')
        })
    } else if (action == 'installed') {
        const installed = spawn("dpkg", ["-s", app_data.app.deb_pkg_name])

        let found_value = undefined;

        installed.on('close', code => {
            if (code == 0)
                found_value = true
            else
                found_value = false
        })

        installed.on('close', (code) => {
            setTimeout(function() {
                if (found_value == true) {
                    set_app_installed(true)
                    return
                } else if (found_value == false) {
                    set_app_installed(false)
                    return
                }
            }, 500)
        });
    }
}

function install() {
    switch (app_data.app.category) {
        case 'snap':
            handle_snap(app_data.app.pointer, 'install')
            break
        case 'apt':
            handle_apt(app_data.app.pointer, 'install')
            break
        case 'flathub':
            handle_flathub(app_data.app.pointer, 'install')
            break
        case 'deb':
            handle_deb(app_data.app.pointer, 'install')
            break
    }

    set_app_installed('installing')
}

function remove() {
    switch (app_data.app.category) {
        case 'snap':
            handle_snap(app_data.app.pointer, 'remove')
            break
        case 'apt':
            handle_apt(app_data.app.pointer, 'remove')
            break
        case 'flathub':
            handle_flathub(app_data.app.pointer, 'remove')
            break
        case 'deb':
            handle_deb(app_data.app.pointer, 'remove')
            break
    }

    set_app_installed('removing')
}

function check_app_status() {
    switch (app_data.app.category) {
        case 'snap':
            handle_snap(app_data.app.pointer, 'installed')
            break
        case 'apt':
            handle_apt(app_data.app.pointer, 'installed')
            break
        case 'flathub':
            handle_flathub(app_data.app.pointer, 'installed')
            break
        case 'deb':
            handle_deb(app_data.app.pointer, 'installed')
            break
    }
}

function check_app_backend () {
    switch (app_data.app.category) {
        case 'snap':
            const snap_check = spawn("which", ["snap"])

            snap_check.on('close', code => {
                if (code != 0)
                    $('#app-warning').css('display', 'block')
            })
            break
        case 'apt':
            const apt_check = spawn("which", ["apt"])

            apt_check.on('close', code => {
                if (code != 0)
                    $('#app-warning').css('display', 'block')
            })
            break
        case 'flathub':
            const flatpak_check = spawn("which", ["flatpak"])

            flatpak_check.on('close', code => {
                if (code == 0)
                    $('#flatpak-warning').css('display', 'block')
                else
                    $('#app-warning').css('display', 'block')
            })
            break
        case 'deb':
            const deb_check = spawn("which", ["apt"])

            deb_check.on('close', code => {
                if (code != 0)
                    $('#app-warning').css('display', 'block')
            })
            break
        default:
            $('#app-warning').css('display', 'block')
    }
}