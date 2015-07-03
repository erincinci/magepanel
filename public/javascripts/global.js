/**
 * Created by erincinci on 7/9/14.
 */
// Data
var codeMirror = null;
var showAjaxLoaderFlag = true;
var ajaxTimeout = 600;
var ioSocket = null;
var cmdQueue;
var cmdQueueSize = 0;
var odometers = [];

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

    // Connect to backend with Socket.IO
    ioSocket = io.connect();
    ioSocket.on('connect', function () {
        console.log('Connected to backend with Socket.IO!');
    });
    getSocketIOMessages();

    // Get revision version for app
    getRevisionVersion();

    // Do update check based on cookie for updating less frequently
    if ($.cookie('updateCheck') == null) {
        // Create cookie & check of updates
        checkForUpdates();
        $.cookie('updateCheck', 'done', { expires: 1, path: '/' });
    } else {
        $('#checkingUpdates').hide();
        $('#updateOk').show();
    }

    // Change app update tooltip width
    $(function () {
        $('#updateOk').tooltip().on("mouseenter", function () {
            var $this = $(this),
                tooltip = $this.next(".tooltip");
            tooltip.find(".tooltip-inner").css({
                width: "300px",
                backgroundColor: "#3c85c4"
            });
        });
    });

    // Tag icon picker on change event
    $('#tagIcon').on('change', function(e) {
        $('#tagIconName').val(e.icon);
    });
    $('#tagEditIcon').on('change', function(e) {
        $('#tagEditIconName').val(e.icon);
    });

    /**
     * Bootstrap Odometer Config
     */
    $('.odometer').each(function(index) {
        odometers[this.id] = new Odometer({ el: $('.odometer')[index], value: 0, theme: 'car', format: 'd', animation: 'count' });
    });

    /**
     * Stats Page - Update Components
     */
    $("#statsComponents").ready(function() {
        if( $('#statsComponents').length ) {
            // Init date selector
            $(function() {
                $('#statsDateRange span').html(moment().subtract(29, 'days').format('D MMMM, YYYY') + ' - ' + moment().format('D MMMM, YYYY'));
                $('#statsDateRange').daterangepicker({
                    format: 'DD/MM/YYYY',
                    startDate: moment().subtract(29, 'days'),
                    endDate: moment(),
                    minDate: '01/01/2013',
                    maxDate: moment().format('DD/MM/YYYY'),
                    dateLimit: { months: 24 },
                    showDropdowns: true,
                    showWeekNumbers: false,
                    timePicker: false,
                    timePickerIncrement: 1,
                    timePicker12Hour: false,
                    ranges: {
                        'Today': [moment().startOf('day'), moment()],
                        'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    opens: 'left',
                    drops: 'down',
                    buttonClasses: ['btn', 'btn-sm'],
                    applyClass: 'btn-primary',
                    cancelClass: 'btn-default',
                    separator: ' to ',
                    locale: {
                        applyLabel: 'Submit',
                        cancelLabel: 'Cancel',
                        fromLabel: 'From',
                        toLabel: 'To',
                        customRangeLabel: 'Custom',
                        daysOfWeek: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
                        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        firstDay: 1
                    }
                }, function(start, end, label) {
                    updateStatsComponents(start.format('X'), end.format('X'));
                    //console.log(start.format('X'), end.format('X'), label);
                    $('#statsDateRange span').html(start.format('D MMMM, YYYY') + ' - ' + end.format('D MMMM, YYYY'));
                });

            });

            // Update counters & charts
            updateStatsComponents(moment().subtract(29, 'days').format('X'), moment().format('X'));
        }
    });
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
