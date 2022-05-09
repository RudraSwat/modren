function truncateText(text, maxLength) {
    let truncated = text

    if (truncated.length > maxLength) {
        truncated = truncated.substr(0, maxLength) + '...';
    }

    return truncated;
}

function show_app_cards () {
    $('#container').append(`
        <div class="row">
            <h1>Latest apps added</h1>
        </div>
        <div class="row mt-4"></div>
    `)

    // 'i' and 'ii' are counters and this is not minified JS.
    let i = 1;
    let app = 1;
    
    while (i <= 4) {
        let ii = 1;

        $('#container').append(`<div class='row mt-4' id="app_row` + i + `">`)

        while (ii <= 3) {
            $('#app_row' + i).append(`
                <div class="col">
                    <div id="app-card` + app + `-card" class="app-card card mb-3" style="width: 100%; border-radius: 10px; display: none;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img id="app-card` + app + `-img" style="padding: 1.2rem;" class="img-fluid rounded-start" alt="app logo">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body card` + app + `-body">
                                    <h5 class="card-title card` + app + `-title" id="app-card` + app + `-title">Loading..</h5>
                                    <p class="card-text card` + app + `-text" id="app-card` + app + `-summary">Loading...</p>
                                    <p class="card-text card` + app + `-category" id="app-card` + app + `-category">Loading...</p>
                                    <button onclick="check_out('` + app + `')" class="btn btn-primary install">Checkout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `)

            app++
            ii++
        }

        $('#container').append(`</div>`)

        i++
    }

    $('#container').append('<div class="row mt-4">')
}

function check_out (i) {
    window.location = 'app-view.html#' + window.apps[i-1]['id']
}