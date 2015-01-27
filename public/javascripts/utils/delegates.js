/**
 * Created by erinci on 27.01.2015.
 */
// Element Delegates =============================================================
/**
 * Projects - Project list group item on select action
 */
$(document).delegate('#projectsList .list-group-item', 'click', function(e) {
    var previous = $(this).closest(".list-group").children(".active");
    previous.removeClass('active'); // previous list-item
    $(e.target).addClass('active'); // activated list-item
    $("#editProjectBtn").prop('disabled',false);
    $("#delProjectBtn").prop('disabled',false);
    $("#refreshProjectBtn").prop('disabled',false);
    if ($(e.target).hasClass('ion-fork-repo'))
        $("#gitPullProjectBtn").prop('disabled',false);
    else
        $("#gitPullProjectBtn").prop('disabled',true);
    // jQuery AJAX call for project detail
    $.get( '/projects/detail?id=' + e.target.id, function(output) {
        $('#projectDetail').html(output);
    });
});

/**
 * MageLogs - Project list group item on select action
 */
$(document).delegate('#projectsListLogs .list-group-item', 'click', function(e) {
    var previous = $(this).closest(".list-group").children(".active");
    previous.removeClass('active'); // previous list-item
    $(e.target).addClass('active'); // activated list-item

    // jQuery AJAX call for project logs
    $.get( '/mageLogs/project?id=' + e.target.id, function(output) {
        $('#projectLogs').html(output);
    });
});