/**
 * Created by erincinci on 7/9/14.
 */
// Data
var codeMirror = null;
var showAjaxLoaderFlag = true;
var ajaxTimeout = 600;
var logSocket = null;
var consoleSocket = null;
var updateSocket = null;
var cmdQueue;

// DOM Ready =============================================================
$(window).load(function() {
    // Show AJAX Loader until page fully loads
    hideAjaxLoader();
});
$(document).ready(function() {
    $('[rel=tooltip]').tooltip();
    cmdQueue = new Queue();

    /**
     * Hide popovers on random clicks
     */
    $('html').on('click', function(e) {
        if (typeof $(e.target).data('original-title') == 'undefined' && !$(e.target).parents().is('.popover.in')) {
            $('[data-original-title]').popover('destroy'); // hide | destroy
        }
    });

    /**
     * Render select picker components
     */
    $('.selectpicker').selectpicker({
        'selectedText': 'cat'
    });

    /**
     * Ajax Loading Panel
     */
    var loadingTimeout;
    $(document).ajaxStart(function() {
        if(showAjaxLoaderFlag) {
            loadingTimeout = setTimeout(function() {
                showAjaxLoader();
            }, ajaxTimeout);
        }
    });
    $(document).ajaxComplete(function() {
        if(showAjaxLoaderFlag) {
            clearTimeout(loadingTimeout);
            hideAjaxLoader();
        }
    });

    /**
     * Check if notification needs to be shown
     * @type {*|Array|{index: number, input: string}|string}
     */
    var setupStatus = getParameterByName('status');
    if(typeof setupStatus !== 'undefined' && setupStatus == 'incomplete') {
        toastr.warning('Application is need to be setup..', 'MagePanel');
    } else if(typeof setupStatus !== 'undefined' && setupStatus == 'complete') {
        toastr.success('Settings saved', 'MagePanel Setup');
    }

    /**
     * Check for application updates on GIT
     */
    // TODO: Do update check based on cookie for updating less frequently!
    checkForUpdates();
});

// DOM Change ============================================================
/**
 * Browse file Input JS
 */
$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        label = input.val();//.replace(/\\/g, '/').replace(/.*\//, '');
    $('#projectDir').val(label);
});
