$('img').each(function () {
    $(this).attr('onerror', `this.src='../internal/img/fallback.png'`)
})