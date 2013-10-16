var server = "https://hpalm.its.yale.edu";
$(document).ready(function () {
    $.ajax({
        url: server + '/qcbin/rest/is-authenticated',
        error: function (xhr, status, text) {
            window.location.replace(server + "/qcbin/almlite/auth.html")
        },
        xhrFields: {
            withCredentials: true
        },
        dataType: 'xml',
        contentType: 'application/xml',
        type: 'GET',
        success: function (data) {
            $name = $(data).find('Username')
            $("#whoname").text($name.text());
            $("#who").fadeIn("slow", function () {});
        }
    });
    // Get the domains
    $.ajax({
        type: "GET",
        url: server + "/qcbin/rest/domains",
        xhrFields: {
            withCredentials: true
        },
        dataType: "xml",
        success: function (xml) {
            $('#domain').empty();
            $('#domain')
            // Add options
            .append($("<option></option>").text('Choose Domain').attr('style', 'display:none;'));
            $(xml).find("Domain").each(function () {
                $('#domain').append($("<option></option>").text($(this).attr('Name')));
            });
        }
    });
    
    $('#domain').change(function () {
        $('#everything').hide();
        $('#project').prop("disabled", true);
        getProjects($('#domain').val())
        $('#defectEnter').prop("disabled", true);
    });
    
    $("#refreshd").click(function () {
        defectload();
    });
    
    $('#project').change(function () {
        jQuery.data(document.body, 'domain', $('#domain').val());
        jQuery.data(document.body, 'project', $('#project').val());
        $('#defectEnter').prop("disabled", false);
        $('#everything').show();
        defectload();
        drawCharts();
        testload();
        requirementsLoad();
    });
    
    $("#defectUpdate").click(function () {
        $.ajax({
            //the url where you want to sent the userName and password to
            url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/31',
            xhrFields: {
                withCredentials: true
            },
            error: function (xhr, status, text) {
                $("#searchForm").empty().append("There was a problem submitting your defect :(");
            },
            //json object to sent to the authentication url
            dataType: 'json',
            data: '{"Fields":[{"Name":"severity","values":[{"value":"' + '2-Medium' + '"}]}]}]}',
            contentType: 'application/json',
            type: "POST",
            success: function () {
                $("#searchForm").empty().append("Defect submitted");
                defectload();
            }
        })
    });
    
    $("#logoff").click(function () {
        $.ajax({
            url: server + '/qcbin/authentication-point/logout',
            error: function (xhr, status, text) {
                // TBD
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: 'xml',
            contentType: 'application/xml',
            type: 'GET',
            success: function (data) {
                window.location.replace(server + "/qcbin/almlite/auth.html")
            }
        });
    });
    
    $("#defectEnter").click(function () {
        $('#myModal').modal({
            backdrop: true
        });
        $(".modal-title").text("Enter a defect");
        $('.modal-body').empty();
        $('.modal-body')
        // Setup Form
        .append($('<form>').attr('id', 'searchForm').attr('action', '/')
            // Defect summary
            .append($('<textarea>').attr('id', 'defectSummary').attr('placeholder', 'Summary...').attr('style', 'resize: none;width:100%;')).append($('<br>'))
            // Description
            .append($('<textarea>').attr('id', 'defectDescription').attr('placeholder', 'Description...').attr('style', 'resize: none;width:100%;')).append($('<br>'))
            // Assigned to.
            .append($('<select>').attr('id', 'netids').append($("<option></option>").text('Choose netid').attr('style', 'display:none;'))).append($('<br>'))
            // Severity.  Pull this from the list of acceptable values if possible.
            .append($('<select>').attr('id', 'sevs').append($("<option></option>").text('Choose severity').attr('style', 'display:none;'))).append($('<input>')
                // Todo.  Attachments?
                .attr('id', 'cameraInput').attr('capture', 'camera').attr('accept', '*').attr('type', 'file')).append($('<br>')).append("<input type='submit' value='Submit'/>"));
        $.ajax({
            url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/used-lists?name=Severity&alt=application/json',
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            error: function (xhr, status, text) {
                alert(status)
            },
            success: function (json) {
                var lists = []
                $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                    this.lists.forEach(function (item) {
                        item.Items.forEach(function (entry) {
                            $('#sevs').append($("<option></option>").text(entry.value));
                        });
                    });
                    return lists;
                });
            }
        });

        $.ajax({
            url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/users?alt=application/json',
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            error: function (xhr, status, text) {
                alert(status)
            },
            success: function (json) {
                var users = []
                $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                    this.users.forEach(function (entry) {
                        users.push(entry.Name);
                        $('#netids').append($("<option></option>").text(entry.Name));
                    });
                    return users;
                });
            }
        });
        
        $("#searchForm").submit(function (event) {
            /* stop form from submitting normally */
            event.preventDefault();
            
            /* get some values from elements on the page: */
            severity = $('#severity').find(":selected").val();
            owner = $('#netids').find(":selected").val();
            var d = new Date();
            var createDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
            $.ajax({
                //the url where you want to sent the userName and password to
                url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects',
                xhrFields: {
                    withCredentials: true
                },
                error: function (xhr, status, text) {
                    $("#searchForm").empty().append("There was a problem submitting your defect :(");
                },
                dataType: 'json',
                data: '{"Fields":[{"Name":"detected-by","values":[{"value":"' + $('#whoname').text() + '"}]},{"Name":"status","values":[{"value":"New"}]},{"Name":"owner","values":[{"value":"' + owner + '"}]},{"Name":"description","values":[{"value":"' + $('#defectDescription').val() + '"}]},{"Name":"severity","values":[{"value":"' + $('#sevs').find(":selected").val() + '"}]},{"Name":"creation-time","values":[{"value":"' + createDate + '"}]},{"Name":"name","values":[{"value":"' + $('#defectSummary').val() + '"}]}]}',
                contentType: 'application/json',
                type: "POST",
                success: function (json) {
                    var defectID = $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                        this.Fields.forEach(function (entry) {
                            if (entry.Name === "id") {
                                if ($(':file')[0].files[0]) {
                                    fileUpload(entry.values[0].value);
                                }
                                $("#searchForm").empty().append("Defect '" + entry.values[0].value + "' submitted");
                                return false;
                            };
                        });
                    });
                    defectload();
                }
            })
        });
    });

    function fileUpload(id) {
        var form = new FormData($('#searchForm')[0]);
        // Get the file from the form
        var file = $(':file')[0].files[0];
        // Make the ajax call
        $.ajax({
            url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/' + id + '/attachments',
            type: 'POST',
            beforeSend: function (request) {
                request.setRequestHeader("Slug", file.name);
                request.setRequestHeader("Content-Type", "application/octet-stream");
            },
            success: function (res) {
                alert("Success!");
            },
            //add error handler for when a error occurs if you want!
            error: errorHandler = function (err) {
                alert("Failed!");
            },
            data: file,
            // this is the important stuff you need to overide the usual post behavior
            cache: false,
            contentType: false,
            processData: false
        });
    };
    
    $("#kwd_search").keyup(function () {
        // When value of the input is not blank
        if ($(this).val() != "") {
            // Show only matching TR, hide rest of them
            $("#search_results .list-item").hide();
            $("#search_results .list-item:contains-ci('" + $(this).val() + "')").show();
        } else {
            // When there is no input or clean again, show everything back
            $("#search_results .list-item").show();
        }
    });

    $("#test_search").keyup(function () {
        // When value of the input is not blank
        if ($(this).val() != "") {
            // Show only matching TR, hide rest of them
            $("#test_results .list-item").hide();
            $("#test_results .list-item:contains-ci('" + $(this).val() + "')").show();
        } else {
            // When there is no input or clean again, show everything back
            $("#test_results .list-item").show();
        }
    });
    // jQuery expression for case-insensitive filter
    $.extend($.expr[":"], {
        "contains-ci": function (elem, i, match, array) {
            return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
        }
    });
});

// Get the design steps
function designSteps(id) {
    $.ajax({
        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/design-steps?query={parent-id[' + id + ']}&order-by={id[ASC]}',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        error: function (xhr, status, text) {
            alert(status)
        },
        success: function (json) {
            $('#myModal').modal({
                backdrop: true
            })
            $(".modal-title").text("Test Steps");
            $('.modal-body').empty();
            $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                var things = {};
                var items = [];
                this.entities.forEach(function (entry) {
                    var fs = {}
                    entry.Fields.forEach(function (field) {
                        fs[field.Name] = field.values[0]
                    });

                    if (jQuery.isEmptyObject(fs["expected"])) {
                        var expected = '<br />No value specified';
                    } else {
                        var expected = fs["expected"].value;
                    }
                    $('.modal-body').append($('<div>').addClass("list-item clearfix").append('<h3>Step #:' + fs["step-order"].value + '</h3><br /><div class="panel panel-primary"><div class="panel-heading">Description</div>' + fs["description"].value + '</div><div class="panel panel-primary"><div class="panel-heading">Expected:</div>' + expected));
                });
            });
        }
    });
};

function testload() {
    // Get the list of tests
    $.ajax({
        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/tests?alt=application/json',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        error: function (xhr, status, text) {
			// Do something eventually
        },
        success: function (json) {
            $('#test_results').empty()
            $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                var things = {};
                var items = [];
                this.entities.forEach(function (entry) {
                    var fs = {}
                    entry.Fields.forEach(function (field) {
                        fs[field.Name] = field.values[0]
                    });
                    $('#test_results').append($('<div>').addClass("list-item clearfix")
                        // Add Meeting div
                        .append($('<div>').addClass("meeting")
                            // Add Date
                            .append($('<span>').addClass('meeting-time').text('Date : ' + fs["creation-time"].value)).append('<br>ID : <span class="testid">' + fs["id"].value + '</span>')
                            // Add Status
                            .append('<br>Exec Status : ' + fs["exec-status"].value).append('<br># of Steps : ' + '<a class="steps">' + fs["steps"].value + '</a>')).append($('<h5>').text("Name : " + fs["name"].value)).append($('<div>').addClass("description").html("Description : " + fs["description"].value)));
                });
                $('.steps').bind('click', function () {
                    designSteps($(this).parent().find('.testid').text());
                });
            });
        }
    });
};

function defectload() {
    $.ajax({
        // Setting the page size to 200 currently.
        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects?order-by={status[ASC];severity[DESC]}&alt=application/json&page-size=200',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        error: function (xhr, status, text) {
            alert(status)
        },
        success: function (json) {
            $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                $('#search_results .content.scroller').empty();
                $('#mySwipe .swipe-wrap').empty();
                var things = {};
                var items = []
                if (this.entities.length != 0)
                    this.entities.forEach(function (entry) {
                        var fs = {}
                        entry.Fields.forEach(function (field) {
                            fs[field.Name] = field.values[0]
                        });

						// Add each defect to the list.
                        $('#search_results .content.scroller').append($('<div>').addClass("list-item clearfix")
                            // Add Meeting div
                            .append($('<div>').addClass("meeting").addClass("well well-sm")
                                // Add Date
                                .append($('<span>').addClass('meeting-time').text('Date : ' + fs["creation-time"].value))
                                // Add Status
                                .append('<br>Status : ' + fs["status"].value)
                                // Add Severity
                                .append('<br>Severity : ' + fs["severity"].value)
                                // Add owner
                                .append('<br>Owner : ' + fs["owner"].value))
                            // Add ID
                            .append($('<h4>').text('ID : ').append($('<span>').html("<h4>" + fs["id"].value + "</h4>").addClass("badge"))).append($('<span>').text("Subject").addClass("label label-info"))
                            // Add subject
                            .append($('<h5>').text(fs["name"].value))
                            // Add description
                            .append($('<span>').text("Description").addClass("label label-primary")).append($('<div>').addClass("description").html(fs["description"].value)));
                    });
                else
                    (
                        $('#search_results .content.scroller').append($('<div>').addClass("alert").text('No defects entered for this project'))
                    );
                items.push(things)
                
                // Maybe implement some more sorting.
                //var sortedDivs = $("#search_results").find("div").toArray().sort(sorter);
                //alert($("#search_results").find(".list-item.clearfix").toArray());
                //$.each(sortedDivs, function(index, value) {
                //$("#search_results").append(value);
                //});
                //function sorter(a, b) {
                //return a.getAttribute('rel') - b.getAttribute('rel');
                //};
            });
        }
    });
};

function requirementsLoad() {
    // Get the list of requirements.  This isn't implemented in the html currently.
    $.ajax({
        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/requirements?alt=application/json',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        error: function (xhr, status, text) {
			// Do something eventually
        },
        success: function (json) {
            $('#requirements_list').empty();
            $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                var things = {};
                var items = [];
                this.entities.forEach(function (entry) {
                    var fs = {}
                    entry.Fields.forEach(function (field) {
                        fs[field.Name] = field.values[0]
                    });
                    $('#requirements_list').append($('<div>').addClass("list-item clearfix")
                        // Add Meeting div
                        .append($('<h5>').text('Name : ' + fs["name"].value)).append($('<div>').addClass('description').html('Description : ' + fs["description"].value)));
                });
                $('.steps').bind('click', function () {
                    designSteps($(this).parent().find('.testid').text());
                });
            });
        }
    });
};

function getProjects(domain) {
    $.ajax({
        type: "GET",
        url: server + "/qcbin/rest/domains/" + domain + "/projects",
        xhrFields: {
            withCredentials: true
        },
        dataType: "xml",
        success: function (xml) {
            $('#project').empty();
            $('#project').append($("<option></option>").text('Choose Project').attr('style', 'display:none;'));
            $(xml).find("Project").each(function () {
                $('#project').append($("<option></option>")
                    //.attr("value",key)
                    .text($(this).attr('Name')));
            });
            $('#project').removeAttr('disabled');
        }
    });
}

function drawCharts() {
    var g = []
    $.ajax({
        type: "GET",
        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/groups/status',
        xhrFields: {
            withCredentials: true
        },
        dataType: "xml",
        success: function (xml) {
            $(xml).find("GroupByHeader").each(function () {
                var e = []
                e.push($(this).attr('Value'));
                e.push(parseInt($(this).attr('size')));
                g.push(e)
            });
            // If there's no defects, don't try and render the graph
            if (g.length > 0) {
                $('#defectGraph').highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: 'Defects'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                color: '#000000',
                                connectorColor: '#000000',
                                format: '<b>{point.name}</b>: {point.y}'
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Percentage of Defects',
                        data: g
                    }]
                });
            }
        }
    });
};