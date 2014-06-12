var server = "";

$(document).ready(function () {
    $.ajax({
        url: server + '/qcbin/rest/is-authenticated',
        error: function (xhr, status, text) {
            window.location.replace(server + "/qcbin/almlite/auth.html")
            console.log(xhr)
        },
        xhrFields: {
            withCredentials: true
        },
        crossDomain: false,
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

        crossDomain: true,

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
                $('#domain').append($("<option></option>")
                    .text($(this).attr('Name')));

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
        loadDfctFields();
        drawCharts();
        testload();
        requirementsLoad();
    });

    $("#defectUpdate").click(function () {

        $.ajax({

            //the url where you want to sent the userName and password to

            url: 'https://hpalm.its.yale.edu/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/4',

            crossDomain: true,

            xhrFields: {

                withCredentials: true

            },

            error: function (xhr, status, text) {

                console.log(xhr)

                console.log(status)

                console.log(text)

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
            crossDomain: false,
            dataType: 'xml',
            contentType: 'application/xml',
            type: 'GET',
            success: function (data) {
                window.location.replace(server + "/qcbin/almlite/auth.html")
            }
        });
    });

    $(':file').change(function () {
        var form = new FormData($('#multiform')[0]);
        var file = this.files[0];
        // Make the ajax call
        $.ajax({
            url: 'https://hpalm.its.yale.edu/qcbin/rest/domains/sandbox/projects/playground/defects/1/attachments',
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

            .append($('<div>').attr('class', 'form-group').append($('<textarea>').attr('id', 'defectSummary').attr('required', true).attr('name', 'defectSummary').attr('class', 'form-control').attr('placeholder', 'Summary...').attr('style', 'resize: none;width:100%;'))).append($('<br>'))

            // Description

            .append($('<div>').attr('class', 'form-group').append($('<textarea>').attr('id', 'defectDescription').attr('name', 'defectDescription').attr('class', 'form-control').attr('placeholder', 'Description...').prop('required', true).attr('style', 'resize: none;width:100%;'))).append($('<br>'))

            // Assigned to.

            .append($('<div>').attr('class', 'form-group').append($('<select>').attr('id', 'netids').attr('name', 'netids').attr('required', true).attr('data-live-search', 'true').attr('class', 'form-control input-sm selectpicker').append($("<option></option>").attr('selected', true).attr('disabled', true).text('Assigned to'))))

            // Severity.  Pull this from the list of acceptable values if possible.

            .append($('<div>').attr('class', 'form-group').append($('<select>').attr('id', 'sevs').attr('name', 'sevs').attr('required', true).attr('class', 'form-control input-sm').append($("<option></option>").attr('selected', true).attr('disabled', true).text('Choose severity'))))

            .append($('<div>').attr('id', 'additionalFields'))
        );


        // Additional Fields here

        $(jQuery.parseJSON(localStorage.defectLists)).each(function () {
            var p = this.phy_name
            $('#additionalFields').append($('<select>').attr('id', p).attr('required', true).attr('class', 'form-control input-sm').append($("<option></option>").attr('selected', true).attr('disabled', true).text(this.name)))
            this.is.forEach(function (i) {
                $("#" + p).append($("<option></option>").text(i));
            });
        });

        $('#searchForm').append($('<br>')).append($('<input>').attr('id', 'cameraInput').attr('capture', 'camera').attr('accept', '*').attr('type', 'file'))
            .append($('<br>')).append("<input type='submit' class='btn btn-primary btn-block' value='Submit'/>");



        getSeverities();
        getUsers();


        $('#searchForm').validate({
            rules: {
                defectSummary: {
                    minlength: 3,
                    maxlength: 255,
                    required: true
                },
                defectDescription: {
                    minlength: 3,
                    maxlength: 255,
                    required: true
                },
                sevs: {
                    required: true
                },
                netids: {
                    required: true
                }
            },
            messages: {
                sevs: "Please select a severity",
                netids: "Please select an id"
            },
            highlight: function (element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function (element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorElement: 'span',
            errorClass: 'help-block',
            errorPlacement: function (error, element) {
                if (element.parent('.input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
            },
            submitHandler: function (form) {
                severity = $('#severity').find(":selected").val();
                owner = $('#netids').find(":selected").val();
                var d = new Date();

                var createDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
                Fields = []

                Fields.push({
                    "Name": "detected-by",
                    "values": [{
                        "value": $('#whoname').text()
                    }]
                })
                Fields.push({
                    "Name": "status",
                    "values": [{
                        "value": "New"
                    }]
                })
                Fields.push({
                    "Name": "owner",
                    "values": [{
                        "value": owner
                    }]
                })
                Fields.push({
                    "Name": "description",
                    "values": [{
                        "value": $('#defectDescription').val()
                    }]
                })
                Fields.push({
                    "Name": "severity",
                    "values": [{
                        "value": $('#sevs').val()
                    }]
                })
                Fields.push({
                    "Name": "creation-time",
                    "values": [{
                        "value": createDate
                    }]
                })
                Fields.push({
                    "Name": "name",
                    "values": [{
                        "value": $('#defectSummary').val()
                    }]
                })

                $("#additionalFields").children().each(function () {
                    Fields.push({
                        "Name": this.id,
                        "values": [{
                            "value": this.value
                        }]
                    })
                })

                data = new Object;
                data.Fields = Fields

                $.ajax({

                    //the url where you want to sent the userName and password to

                    url: 'https://hpalm.its.yale.edu/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects',

                    crossDomain: true,

                    xhrFields: {

                        withCredentials: true

                    },

                    error: function (xhr, status, text) {

                        console.log(xhr)
                        console.log(status)
                        console.log(text)
                        $("#searchForm").empty().append("There was a problem submitting your defect :(");

                    },

                    dataType: 'json',
                    data: JSON.stringify(data),
                    //data: '{"Fields":[{"Name":"detected-by","values":[{"value":"' + $('#whoname').text() + '"}]},{"Name":"status","values":[{"value":"New"}]},{"Name":"owner","values":[{"value":"' + owner + '"}]},{"Name":"description","values":[{"value":"' + encodeURIComponent($('#defectDescription').val()) + '"}]},{"Name":"severity","values":[{"value":"' + $('#sevs').find(":selected").val() + '"}]},{"Name":"creation-time","values":[{"value":"' + createDate + '"}]},{"Name":"name","values":[{"value":"' + encodeURIComponent($('#defectSummary').val()) + '"}]}]}',
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
            }
        });
    });


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

    /*
	$("#kwd_search").keyup(function() {	
		if ($(this).val() != "") {
			// Show only matching TR, hide rest of them
			$( "#filtered div.list-item:not(:contains-ci('" + $(this).val() + "'))").hide();
			$( "#filtered div.list-item:contains-ci('" + $(this).val() + "')").show();
		} else {
			// When there is no input or clean again, show everything back
			//alert("Reload time!")
			$( "#filtered div.list-item").show();
		}
		
		window.mySwipe = $('#blah').Swipe().data('Swipe');		
		
	});
	*/

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

function fileUpload(id) {
    var form = new FormData($('#searchForm')[0]);
    var file = $(':file')[0].files[0];
    //var file = $('input:file#cameraInput');
    //if (file.val()){
    // Make the ajax call
    $.ajax({
        url: 'https://hpalm.its.yale.edu/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/' + id + '/attachments',
        type: 'POST',
        beforeSend: function (request) {
            request.setRequestHeader("Slug", file.name);
            request.setRequestHeader("Content-Type", "application/octet-stream");

        },
        success: function (res) {
            $("#searchForm").append($('<br>')).append($('<b>').text("Upload Succeeded ")).append($('<span>').attr('class', 'glyphicon glyphicon-thumbs-up'));
            //alert("Success!");
        },
        //add error handler for when a error occurs if you want!
        error: errorHandler = function (err) {
            $("#searchForm").append($('<br>')).append($('<b>').text("Upload Failed ")).append($('<span>').attr('class', 'glyphicon glyphicon-thumbs-down'));
            console.log(err);
        },
        data: file,
        // this is the important stuff you need to override the usual post behavior
        cache: false,
        contentType: false,
        processData: false
    });
};

/*

function getCustomFields(){
// Do this stuff on load in the background
		// Pull this first
		// Get the values.  You can get all lists at once.
		// https://hpalm.its.yale.edu/qcbin/rest/domains/WATERFALL/projects/MAINT_CouncilOfMasters/customization/used-lists?id=1021,1047&alt=application/json
        $.ajax({

            url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/entities/defect/fields?required=true&alt=application/json',
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            error: function (xhr, status, text) {
                console.log(status);
				console.log(text);
            },
            success: function (json) {
                $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                    this.Field.forEach(function (item) {
						if(item.System === false){
						console.log(item.PhysicalName)
						console.log(item.Label)
							if(item.Type === "LookupList"){
								console.log(item["List-Id"]);
								var vals = getListItems(item["List-Id"]);
								getListItems(item["List-Id"])
								console.log(localStorage.list);
							}
						}
                    });
                });
            }
        });
};

function getListItems(id){
// You can actually get more than 1 at a time.
//https://hpalm.its.yale.edu/qcbin/rest/domains/WATERFALL/projects/MAINT_CouncilOfMasters/customization/used-lists?id=1179&alt=application/json
var vals = []
$.ajax({
        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/used-lists?id=' + id + '&alt=application/json',
		xhrFields: {

            withCredentials: true

        },
		async:false,
        dataType: 'json',

        error: function (xhr, status, text) {
            console.log(status);
			console.log(text);
        },

        success: function (json) {
                $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                    this.lists.forEach(function (item) {
                        item.Items.forEach(function (entry) {
                            vals.push(entry.value);
                        });
                    });
                    
                });
				localStorage.setItem("list",JSON.stringify(vals));
		}
    });
};
*/

// Get the design steps

function designSteps(id) {

    $.ajax({

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/design-steps?query={parent-id[' + id + ']}&order-by={id[ASC]}',

        crossDomain: true,

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

                    //console.log(fs)

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

        crossDomain: true,

        xhrFields: {

            withCredentials: true

        },

        dataType: 'json',

        error: function (xhr, status, text) {

            console.log(status)

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
        crossDomain: true,
        xhrFields: {

            withCredentials: true

        },

        dataType: 'json',
        error: function (xhr, status, text) {
            console.log(status);
        },

        success: function (json) {
            var table = $('#results_table').dataTable({
                "retrieve": true
            })

            table.fnDestroy()

            $(jQuery.parseJSON(JSON.stringify(json))).each(function () {

                $('#search_results .content.scroller').empty();
                $('#mySwipe .swipe-wrap').empty();
                $("#results_table_body").empty();

                var things = {};

                var items = []

                if (this.entities.length != 0) {

                    this.entities.forEach(function (entry) {
                        var fs = {}

                        entry.Fields.forEach(function (field) {

                            fs[field.Name] = field.values[0]

                        });

                        $('#results_table_body').append($('<tr>').attr("id", fs["id"].value)
                            .append($('<td>').text(fs["id"].value))
                            .append($('<td>').text(fs["severity"].value))
                            .append($('<td>').text(fs["status"].value))
                            .append($('<td>').text(fs["creation-time"].value))
                            .append($('<td>').text(fs["owner"].value))
                            .append($('<td>').html(fs["name"].value))
                        );

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

                                .append('<br>Owner : ' + fs["owner"].value)
                            )

                            // Add ID

                            .append($('<h4>').text('ID : ').append($('<span>').html("<h4>" + fs["id"].value + "</h4>").addClass("badge")))
                            .append($('<button>').addClass('defect-update-button btn btn-small btn-warning').text("Edit ").attr('id', fs["id"].value).append($('<span>').addClass("glyphicon glyphicon-edit")))
                            .append($('<br>')).append($('<span>').text("Subject").addClass("label label-info"))

                            // Add subject

                            .append($('<h5>').text(fs["name"].value))

                            // Add description
                            .append($('<span>').text("Description").addClass("label label-primary"))
                            .append($('<div>').addClass("description").html(fs["description"].value)));

                    })

                    var table = $('#results_table').DataTable({
                        "retrieve": true,
                        "bProcessing": true,
                        "bSortCellsTop": true,
                        "iDisplayLength": 50
                    })

                    /*					
					var tt = new $.fn.dataTable.TableTools( table,{
						"buttons": [
							"copy",
							"csv",
							"xls",
							"pdf",
							{ "type": "print", "buttonText": "Print me!" }
						],
						"sSwfPath":"/qcbin/almlite/swf/copy_csv_xls_pdf.swf"
					} );
					
					$(tt.fnContainer()).insertBefore('div.dataTables_wrapper');
					*/

                    $("#results_table thead tr:nth-child(2) th").each(function (i) {
                        if ($(this).attr("class") != "ignore") {
                            var select = $('<select><option value=""></option></select>')
                                .appendTo($(this).empty())
                                .on('change', function () {
                                    table.column(i)
                                        .search($(this).val())
                                        .draw();
                                });

                            table.column(i).data().unique().sort().each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>')
                            });
                        }
                    });


                    // The mobile view has this.
                    $('.defect-update-button').on('click', function () {
                        defectUpdate($(this).attr('id'));
                    });

                    $('#results_table tbody').on('click', 'tr', function () {
                        defectUpdate($(this).attr('id'));
                    })

                } else {
                    (

                        $('#search_results .content.scroller').append($('<div>').addClass("alert").text('No defects entered for this project'))

                    );
                }
                items.push(things)
            });
        }
    });

};

function defectUpdate(id) {
    var defectID = id
    $.ajax({

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/' + defectID + '?alt=application/json',

        crossDomain: true,
        crossDomain: true,

        xhrFields: {

            withCredentials: true

        },

        dataType: 'json',

        error: function (xhr, status, text) {

            console.log(status)

        },

        success: function (json) {

            $('#myModal').modal({
                backdrop: true
            }).addClass('modal-lg');

            $(".modal-title").text("Update defect");

            $('.modal-body').empty();

            $(jQuery.parseJSON(JSON.stringify(json))).each(function () {

                var fs = {}

                this.Fields.forEach(function (field) {

                    fs[field.Name] = field.values[0]

                });

                $('.modal-body')
                    // Setup Form

                .append($('<form>').attr('id', 'updateForm')

                    // Defect summary

                    .append($('<h4>').text('ID : ').append($('<span>').html("<h4>" + fs["id"].value + "</h4>").addClass("badge")))
                    // Really?  Name?  It's really a summary
                    .append($('<label>').attr('for', 'summary').text("Summary"))
                    .append($('<div>').html(fs["name"].value).attr('contenteditable', true).attr('id', 'summary'))
                    .append($('<label>').attr('for', 'netids').text("Description"))
                    .append($('<br>')).append($('<div>').html(fs["description"].value).attr('contenteditable', true).attr('id', 'description'))
                    .append($('<div>').attr('class', 'form-group')
                        .append($('<label>').attr('for', 'sevs').text("Severity"))
                        .append($('<select>').attr('id', 'sevs').attr('name', 'sevs').attr('required', true).attr('class', 'form-control input-sm').append($("<option></option>").attr('selected', true).attr('disabled', true).text('Choose severity'))))
                    .append($('<label>').attr('for', 'bug_status').text("Status"))
                    .append($('<div>').attr('class', 'form-group').append($('<select>').attr('id', 'bug_status').attr('name', 'bug_status').attr('required', true).attr('class', 'form-control input-sm').append($("<option></option>").attr('selected', true).attr('disabled', true).text('Choose status'))))
                    .append($('<label>').attr('for', 'netids').text("Assigned To"))
                    .append($('<div>').attr('class', 'form-group').append($('<select>').attr('id', 'netids').attr('name', 'netids').attr('required', true).attr('data-live-search', 'true').attr('class', 'form-control input-sm selectpicker').append($("<option></option>").attr('selected', true).attr('disabled', true).text('Assigned to'))))

                    .append($('<br>')).append($('<input>').attr('id', 'cameraInput').attr('capture', 'camera').attr('accept', '*').attr('type', 'file'))
                    .append($('<br>')).append("<input type='submit' class='btn btn-primary btn-block' value='Update'/>")
                    .append("<button type='button' class='btn btn-default btn-block' data-dismiss='modal'>Close</button>")
                );

                getSeverities(fs["severity"].value)
                getDefectStatuses(fs["status"].value)
                getUsers(fs["owner"].value)
            });

            $('#updateForm').submit(function (event) {
                owner = $('#netids').find(":selected").val();
                var d = new Date();
                var createDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
                Fields = []

                Fields.push({
                    "Name": "status",
                    "values": [{
                        "value": $('#bug_status').find(":selected").val()
                    }]
                })

                Fields.push({
                    "Name": "name",
                    "values": [{
                        "value": $('#summary').html()
                    }]
                })

                Fields.push({
                    "Name": "description",
                    "values": [{
                        "value": $('#description').html()
                    }]
                })

                /*									
									Fields.push({
										"Name": "detected-by",
										"values": [{
											"value": $('#whoname').text()
										}]
									})
									*/
                Fields.push({
                    "Name": "owner",
                    "values": [{
                        "value": $('#netids').find(":selected").val()
                    }]
                })

                Fields.push({
                    "Name": "severity",
                    "values": [{
                        "value": $('#sevs').val()
                    }]
                })

                data = new Object;
                data.Fields = Fields

                $.ajax({

                    //the url where you want to sent the userName and password to

                    url: 'https://hpalm.its.yale.edu/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/' + defectID,

                    crossDomain: true,

                    xhrFields: {

                        withCredentials: true

                    },

                    error: function (xhr, status, text) {

                        console.log(xhr)
                        console.log(status)
                        console.log(text)
                        $("#searchForm").empty().append("There was a problem submitting your defect :(");

                    },

                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: 'application/json',

                    type: "PUT",

                    success: function (json) {
                        var defectID = $(jQuery.parseJSON(JSON.stringify(json))).each(function () {
                            this.Fields.forEach(function (entry) {
                                if (entry.Name === "id") {
                                    if ($(':file')[0].files[0]) {
                                        fileUpload(entry.values[0].value);
                                    }
                                    $("#updateForm").empty().append("Update to '" + entry.values[0].value + "' submitted");
                                    return false;
                                };
                            });
                        });

                        // Not sure this is really needed.
                        defectload();
                    }
                })
                event.preventDefault();
            });
        }
    });
}

function requirementsLoad() {

    // Get the list of tests

    $.ajax({

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/requirements?alt=application/json',

        crossDomain: true,

        xhrFields: {

            withCredentials: true

        },

        dataType: 'json',

        error: function (xhr, status, text) {

            console.log(status)

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

                    //console.log(fs)

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

        url: "https://hpalm.its.yale.edu/qcbin/rest/domains/" + domain + "/projects",

        crossDomain: true,

        xhrFields: {

            withCredentials: true

        },

        dataType: "xml",

        success: function (xml) {

            $('#project').empty();

            $('#project').append($("<option></option>").text('Choose Project').attr('style', 'display:none;'));

            $(xml).find("Project").each(function () {

                $('#project').append($("<option></option>")
                    .text($(this).attr('Name')));
            });

            $('#project').removeAttr('disabled');

        }
    });

}

// Create and populate the data table.

//https://hpalm.its.yale.edu/qcbin/rest/domains/sandbox/projects/playground/customization/entities/defect/fields?required=true

// Gets the lists

//https://hpalm.its.yale.edu/qcbin/rest/domains/sandbox/projects/playground/customization/entities/defect/lists
//https://hpalm.its.yale.edu/qcbin/rest/domains/sandbox/projects/playground/customization/used-lists?name=Severity

function loadDfctFields() {
    var request = $.ajax(
            'https://hpalm.its.yale.edu/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/entities/defect/fields?required=true&alt=application/json', {
                dataType: "json"
            }
        ),
        chained = request.then(function (data) {
            listss = []
            ids = []
            $(jQuery.parseJSON(JSON.stringify(data))).each(function () {
                this.Field.forEach(function (item) {
                    // Only get the non-system values
                    if (item.System === false) {
                        console.log(item.PhysicalName)
                        console.log(item.Label)
                        attrs = new Object;
                        if (item.Type === "LookupList") {
                            attrs.Name = item.Name
                            ids.push(item["List-Id"])
                            attrs.id = item["List-Id"]
                            listss.push(attrs);
                        }
                    }
                });
            });

            return $.ajax("https://hpalm.its.yale.edu/qcbin/rest/domains/WATERFALL/projects/MAINT_CouncilOfMasters/customization/used-lists?alt=application/json", {
                dataType: "json",
                data: {
                    id: ids.join(",")
                }
            });
        });

    chained.done(function (data) {
        console.log(data);

        fields = []
        $(jQuery.parseJSON(JSON.stringify(data))).each(function () {
            this.lists.forEach(function (item) {
                vals = []
                item.Items.forEach(function (entry) {
                    vals.push(entry.value);
                });

                // Push an object in for each list
                obj = {}
                    // Need physical name
                obj.name = item.Name;

                //sconsole.log($.grep(listss, function(e){ return e.id === item.Id; })[0].physical_name);
                obj.phy_name = $.grep(listss, function (e) {
                    return e.id === item.Id;
                })[0].Name;
                obj.is = vals;
                fields.push(obj);
            });
            //console.log(listss);
            //console.log(listss.filter(function (list) { return list.id == "1320" })[0].physical_name);
        });
        // Store the lists in local storage.
        localStorage.setItem("defectLists", JSON.stringify(fields));
    });
};

function drawCharts() {
    //https://hpalm.its.yale.edu/qcbin/rest/domains/DEFAULT/projects/Quality_control_repo_test/defects/groups/status

    var g = []
    $.ajax({

        type: "GET",

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/defects/groups/status',

        crossDomain: false,

        xhrFields: {

            withCredentials: true

        },

        dataType: "xml",

        success: function (xml) {

            $(xml).find("GroupByHeader").each(function () {
                var e = []
                e.push($(this).attr('Value'));
                e.push(parseInt($(this).attr('size')));
                console.log($(this).attr('Value'))
                console.log($(this).attr('size'))
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

function getSeverities(selected) {
    $.ajax({

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/used-lists?name=Severity&alt=application/json',

        crossDomain: true,

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
                        $('#sevs').append($("<option></option>").text(entry.value).val(entry.value));
                    });
                });
                return lists;
            });
            // Set the selected value if one is passed.
            if (selected) {
                $('#sevs').val(selected)
            }
        }
    });
};

function getDefectStatuses(selected) {
    $.ajax({

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/used-lists?name=Bug Status&alt=application/json',

        crossDomain: true,

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
                        $('#bug_status').append($("<option></option>").text(entry.value).val(entry.value));
                    });
                });
                return lists;
            });
            if (selected) {
                $('#bug_status').val(selected)
            }
        }
    });
};

function getUsers(selected) {
    $.ajax({

        url: server + '/qcbin/rest/domains/' + jQuery.data(document.body, 'domain') + '/projects/' + jQuery.data(document.body, 'project') + '/customization/users?alt=application/json',

        crossDomain: true,

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
                    var name = ""
                    if (!entry.FullName) {
                        name = entry.Name
                    } else {
                        name = entry.FullName
                    }

                    $('#netids').append($("<option></option>").text(name).val(entry.Name));
                });

                return users;

            });

            if (selected) {
                $('#netids').val(selected)
            }
        }
    });
}
