window.onload = intro;

function intro() {
    $(".loadingscreen").css("display", "block");
    setTimeout(loadingscreenHide, 2000);
}

function loadingscreenHide() {
    $(".loadingscreen").css("display", "none");
    $("#done").on("click", hideCreateGroup);
}

function hideCreateGroup() {
    $(".creategroup").css("display", "none");
}

// -- VARIABLER ( NOGLE ER IKKE I BRUG -> DET ER IKKE TJEKKET HVILKE ) -- //
var map;
var nextMarkerReached = false;
var list;
var list_groups;
var company_clicked = false;
var currentpost = 0;
var question_window_open = true;
var questionboard = false;
var question_answer = false;
var directionsService;
var directionsDisplay;
var info_open = false;
var myPos;
var gpsmarker = [];
var currentMarker;
var newMarker;
var newMarkerPosition;
var currentMarkerPosition;
var closestmarker;
var pastMarker;
var markerNumber = 0;
var silverStyle = [
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }, {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#cbdae2"
            }
        ]
    }, {
        "featureType": "transit.station.rail",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ff0000"
            },
            {
                "weight": "1"
            }
        ]
    }, {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "weight": "1"
            }
        ]
    }, {
        "featureType": "poi.sports_complex",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "-100"
            }
        ]
    }, {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "-100"
            },
            {
                "lightness": "30"
            }
        ]
    }, {
        "featureType": "poi.medical",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "-100"
            }
        ]
    }, {
        "featureType": "poi.government",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "-100"
            }
        ]
    }, {
        "featureType": "poi.attraction",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#ff0000"
            }
        ]
    }, {
        "featureType": "landscape.natural.landcover",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#d7adad"
            }
        ]
    }, {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    }
];

// -- GOOGLE MAP -- //
function initMap() {

    // -- LOAD RUTEVEJLEDNING SERVICE -- //
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    console.log("Rutevejledning Service loadet")

    // -- LOAD GOOGLE MAP -- //
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        styles: silverStyle,
        center: {
            lat: 55.706510,
            lng: 12.539087
        },
        disableDefaultUI: true,
    });
    console.log("Google Map Loadet");

    // -- SÆT RUTEVEJLEDNING PÅ MAP -- //
    directionsDisplay.setMap(map);
    console.log("Rutevejledning forbundet til map")

    // --SVG OVERLAY-- //
    var bounds = {
        north: 55.6953286628356,
        south: 55.67291525921655,
        east: 12.656398614135696,
        west: 12.550140221801712
    }
    var overlay = new google.maps.GroundOverlay('img/svgkort.svg', bounds);
    overlay.setMap(map);

    // -- LOAD JSON DATA -- //
    $.getJSON("data_groups.json", showList_groups);
    $.getJSON("data.json", showList);

    // -- JSON GRUPPE DATA -- //
    function showList_groups(data) {
        list_groups = data;
        console.log("Gruppe data loadet");
    }

    // -- JSON POST DATA -- //
    function showList(data) {
        list = data;
        console.log("Post data loadet");
        console.log("Min position er igang med at blive fundet...");
    }

    // -- FIND MIN POSITION -- //
    var watchID = navigator.geolocation.watchPosition(function (position) {
        myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        console.log("Min position er fundet og sat til", position.coords.latitude, position.coords.longitude);

        // -- SLETTER MIN GAMLE POSITION -- //
        removeMyLastPosition();

        function removeMyLastPosition() {
            console.log("sletter min gamle position");
            for (i = 0; i < gpsmarker.length; i++) {
                gpsmarker[i].setMap(null);
            }
        }

        // -- INDSÆTTER MIN POSITION PÅ MAPPET -- //
        var meMarker = {
            url: 'img/gpsmarker.svg',
        }
        map.setCenter(myPos);
        var me = new google.maps.Marker({
            position: myPos,
            map: map,
            icon: meMarker
        });
        gpsmarker.push(me);

        console.log("GPS marker er sat på min position og mappet er centreret til min position");
        findDistance();

        // -- TJEK DISTANCEN IMELLEM MIG OG MARKER -- //
        function findDistance() {

            // -- FIND AFSTAND PÅ NUVÆRENDE MARKER OG MIG -- //
            currentMarker = list[markerNumber];
            currentMarkerPosition = new google.maps.LatLng(currentMarker.position.lat, currentMarker.position.lng);
            var currentMarkerDistance = google.maps.geometry.spherical.computeDistanceBetween(myPos, currentMarkerPosition);
            console.log("tjekker hvor langt du er fra currentMarker", markerNumber, currentMarkerDistance);

            // -- FIND AFSTAND PÅ NÆSTE MARKER OG MIG -- //
            nextMarker = list[markerNumber + 1];
            nextMarkerPosition = new google.maps.LatLng(nextMarker.position.lat, nextMarker.position.lng);
            var nextMarkerDistance = google.maps.geometry.spherical.computeDistanceBetween(myPos, nextMarkerPosition);
            console.log("tjekker hvor langt du er fra nextMarker", markerNumber + 1, nextMarkerDistance);

            console.log(currentMarkerDistance);

            // -- LAV RUTE TIL NÆSTE MARKER -- //
            if (currentMarkerDistance == 0) {
                console.log("den første marker er sat og er grøn");
                customMarker = {
                    url: 'img/kort_pin_past.svg',
                };

                // -- INDSÆTTER DEN PÅ KORTET -- //
                firstMarkerPosition = new google.maps.LatLng(list[0].position.lat, list[0].position.lng);
                firstMarker = new google.maps.Marker({
                    position: firstMarkerPosition,
                    map: map,
                    title: list[0].name,
                    icon: customMarker,
                });

            }
            if (currentMarkerDistance > 20) {
                console.log("ny rute til næste marker");
                applynewmarker();

                // -- SPØRGSMÅLSKNAP BLIVER TRIGGERET -- //

                $(".question_button").css("display", "block");
                $(".question_button").addClass("question_button_animation");
                console.log("Spørgsmålet til sidste stop er nu klar")
            }

            // -- DU ER NÅET NÆSTE MARKER
            if (nextMarkerDistance < 20) {
                nextMarkerReached = true;
                markerNumber++;
                console.log("Du har nået næste marker og markerNumber bliver sat til", markerNumber);
                applynewmarker();
            }
        }
    })

    // -- SÆT NÆSTE MARKER  -- //
    function applynewmarker() {
        var customMarker;

        // -- TIDLIGERE MARKERE (GRØN) -- //
        if (currentMarker.id == list[markerNumber].id) {
            console.log("Alle past markers er blevet skiftet til grønne");
            customMarker = {
                url: 'img/kort_pin_past.svg',
            };

            // -- ÆNDRE FARVEN PÅ TIDLIGERE MARKERE TIL GRØN -- //
            oldMarkerPosition = new google.maps.LatLng(list[markerNumber].position.lat, list[markerNumber].position.lng);
            oldMarker = new google.maps.Marker({
                position: oldMarkerPosition,
                map: map,
                title: list[markerNumber].name,
                icon: customMarker,
            });
        }

        // -- NÆSTE MARKER -- //
        if (nextMarker.id == list[markerNumber + 1].id) {
            console.log("Den næste marker er blevet sat og er rød")
            customMarker = {
                url: 'img/kort_pin_next.svg',
            };

            // -- INDSÆTTER NÆSTE MARKER (RØD) -- //
            newMarkerPosition = new google.maps.LatLng(list[markerNumber + 1].position.lat, list[markerNumber + 1].position.lng);
            newMarker = new google.maps.Marker({
                position: newMarkerPosition,
                map: map,
                title: list[markerNumber + 1].name,
                icon: customMarker,
            });

            // -- TRIGGER RUTEVEJLEDNING -- //
            makeRoute();
        }

    };

    // -- RUTEVEJLEDNING -- //
    function makeRoute() {

        // -- DEFINERER RUTEN -- //
        var request = {
            origin: myPos,
            destination: newMarkerPosition,
            travelMode: google.maps.DirectionsTravelMode.WALKING
        };

        // -- SÆTTER RUTEVEJLEDNING IGANG -- //
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                console.log("rutevejledning er startet");
            }
        });
    }
}

// -- AKTIVER KNAPPER -- //
$(".score_button").on("click", score_toggle);
$(".question_button").on("click", question_toggle);

// -- ÅBEN ELLER LUK SCORE -- //
function score_toggle() {
    console.log("score knap togglet");
    $(".scoreboard").toggleClass("scoretoggle");
    score_group();
}

// -- ÅBEN ELLER LUK QUESTIONS-VINDUE -- //
function question_toggle() {
    console.log("question knap klikket på")
    $(".questionboard").on("click", question_answer_open);
    $(".question_button").removeClass("question_button_animation");

    // -- LUKKER VINDUE FORDI DEN ER ÅBEN -- //
    if ((questionboard == true) && (question_answer == false)) {
        console.log("fjerner questionboard fordi questionboard=", questionboard, "question_answer=", question_answer)
        $(".questionboard").removeClass("question_open");
        questionboard = false;
        console.log("questionboard bliver sat til", questionboard);
    } else

    // -- ÅBNER VINDUE FORDI DEN ER LUKKET -- //
    if ((questionboard == false) && (question_answer == false)) {
        console.log("åbner questionboard fordi questionboard=", questionboard, "question_answer=", question_answer)
        $(".questionboard").addClass("question_open");
        questionboard = true;
        console.log("questionboard bliver sat til", questionboard);
        questions();
    } else

    // -- LUKKER VINDUE FORDI SVAR-VINDUE ER ÅBEN -- //
    if ((questionboard == false) && (question_answer == true)) {
        console.log("fjerner question answer fordi question_answer=", question_answer, "questionboard=", questionboard)
        $(".question_answer_window").css("display", "none");
        $(".questionboard").removeClass("question_open");
        $(".question_button").css("display", "none");
        question_answer = false;
        console.log("question_answer bliver sat til", question_answer);
    };
}

// -- SCORE -- //
function score_group(e) {
    console.log("click on score");

    // -- KLONER RAMMER -- //
    var windowklon = document.querySelector("#score_window").content.cloneNode(true);
    list_groups.forEach(scoreclone_group);

    // -- KLONER INDHOLD -- //
    function scoreclone_group(e) {
        console.log("kloner group score");

        // -- CLONE -- //
        var klon = windowklon.querySelector("#score_row").content.cloneNode(true);

        klon.querySelector(".data_gruppe").textContent = e.group;
        klon.querySelector(".data_points").textContent = e.group_point;

        windowklon.querySelector(".score_table_body").appendChild(klon);
    }

    // -- INDSÆTTER INDHOLD I DIV -- //
    document.querySelector(".scoreboard").innerHTML = "";
    document.querySelector(".scoreboard").appendChild(windowklon);

    // -- TAB KLIK -- //
    $(".tab_company").on("click", score_company);

}

function score_company(e) {
    console.log("click on score");

    // -- KLONER RAMMER -- //
    var windowklon = document.querySelector("#score_window").content.cloneNode(true);
    list_groups.forEach(scoreclone_company);

    // -- KLONER INDHOLD -- //
    function scoreclone_company(e) {
        console.log("kloner company score");

        // -- CLONE -- //
        var klon = windowklon.querySelector("#score_row").content.cloneNode(true);

        klon.querySelector(".data_gruppe").textContent = e.company;
        klon.querySelector(".data_points").textContent = e.company_point;

        windowklon.querySelector(".score_table_body").appendChild(klon);
    }

    // -- INDSÆTTER INDHOLD I DIV -- //
    document.querySelector(".scoreboard").innerHTML = "";
    document.querySelector(".scoreboard").appendChild(windowklon);

    // -- TAB KLIK -- //
    $(".tab_group").on("click", score_group);
}

// -- SPØRGSMÅL -- //

function questions(e) {

    console.log("viser spørgsmål");

    // -- KLONER RAMMER -- //
    var windowklon = document.querySelector("#question_window").content.cloneNode(true);
    console.log("windowklon er defineret");
    list.forEach(questionclone);

    // -- KLONER INDHOLD -- //
    function questionclone(postdata) {
        var lastmarker = list[markerNumber].id;
        var postDataId = postdata.id;
        if (postDataId == lastmarker) {
            console.log("kloner spørgsmål");
            var klon = windowklon.querySelector("#question").content.cloneNode(true);

            klon.querySelector(".data_qtitle").textContent = postdata.qtitle;
            klon.querySelector(".data_question").textContent = postdata.question;
            klon.querySelector(".data_a1").textContent = postdata.a1;
            klon.querySelector(".data_a2").textContent = postdata.a2;
            klon.querySelector(".data_a3").textContent = postdata.a3;
            klon.querySelector(".data_a4").textContent = postdata.a4;

            windowklon.querySelector(".window").appendChild(klon);

            // -- INDSÆTTER INDHOLD I DIV -- //
            document.querySelector(".questionboard").innerHTML = "";
            document.querySelector(".questionboard").appendChild(windowklon);
        }

    }
}

// -- TAK FOR SVAR PÅ SPØRGSMÅL -- //
function question_answer_open() {
    if (question_answer == false) {
        console.log("question answer åbner fordi den er", question_answer, "og questionboard=", questionboard)
        $(".question_answer_window").css("display", "block");
        $(".questionboard").removeClass("question_open");
        questionboard = false;
        question_answer = true;
        console.log("question answer bliver sat til", question_answer, "og questionboard bliver sat til", questionboard);
    } else {
        console.log("gør ingenting da question answer er åben")
    }
}


// -- HVAD MANGLER VI?? -- //
// 2. indsæt rigtigt design:
//// -- gps marker
//// -- questionboard
//// -- scoreboard
//// -- Start screen
//// -- Slut screen
// 3. Rigtig spørgsmål til rigtig post
// 4. Optimér kode
