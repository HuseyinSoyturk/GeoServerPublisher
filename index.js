const request = require('request');

let username;
let password;
let host;
let port;
let workspace;
let datastore;
let url;
let publisingLayers = []
let fullList;
let publishedList;

function onChangeToggle(layerNumber, toggle) {
    if (toggle.checked) {
        publisingLayers.push(layerNumber)
    } else {
        let index = publisingLayers.indexOf(layerNumber);
        publisingLayers.splice(index, 1);
    }
}

function onClickListWorkspaces() {

    let field = document.getElementById('workspaceForm')
    field.style.display = 'none'

    let select = document.getElementById('workspaces')
    select.options.length = 1

    // let option = document.createElement('option')
    // option.value = workspace
    // option.text = workspace
    // select.add(option)

    username = document.getElementById('formUsername').value
    password = document.getElementById('formPassword').value
    host = document.getElementById('formHost').value
    port = document.getElementById('formPort').value
    let urlW = "http://" + host + ":" + port.toString() + "/geoserver/rest/workspaces.json"

    request.get(urlW, {
        "Accept": "application/json",
        "content-type": "application/json",
        'auth': {
            'user': username,
            'pass': password,
            'sendImmediately': false
        }
    }, (err, res, body) => {
        body = JSON.parse(body)
        let workspaceList = body.workspaces.workspace.map(x => x.name)

        for (let workspace of workspaceList) {
            let option = document.createElement('option')
            option.value = workspace
            option.text = workspace
            select.add(option)
        }
        field.style.display = 'flex'
    })
}

function onSelectWorkspace(workspaceEl) {

    let field = document.getElementById('datastoreForm')
    field.style.display = 'none'

    let select = document.getElementById('datastores')
    select.options.length = 1

    workspace = workspaceEl.value

    let urlW = "http://" + host + ":" + port.toString() + "/geoserver/rest/workspaces/" + workspace + "/datastores.json"

    request.get(urlW, {
        "Accept": "application/json",
        "content-type": "application/json",
        'auth': {
            'user': username,
            'pass': password,
            'sendImmediately': false
        }
    }, (err, res, body) => {
        body = JSON.parse(body)
        let datastoreList = body.dataStores.dataStore.map(x => x.name)

        for (let datastore of datastoreList) {
            let option = document.createElement('option')
            option.value = datastore
            option.text = datastore
            select.add(option)
        }
        field.style.display = 'flex'
    })
}

function onSelectDatastore(datastoreEl) {
    datastore = datastoreEl.value
    document.getElementById('buttons').style.display = 'block'
}

function onClickListLayer() {

    let trList = document.getElementById('myTable').childNodes[1]
    while (trList.childNodes.length > 2) {
        trList.removeChild(trList.lastChild);
    }

    // username = document.getElementById('formUsername').value
    // password = document.getElementById('formPassword').value
    // host = document.getElementById('formHost').value
    // port = document.getElementById('formPort').value
    // workspace = document.getElementById('formWorkspace').value
    // datastore = document.getElementById('formDatastore').value
    url = "http://" + host + ":" + port.toString() + "/geoserver/rest"

    // url = "http://192.168.20.114:8091/geoserver/rest",
    //     workspace = "YTB",
    //     datastore = "YTB_postgis",
    //     username = "admin",
    //     password = "Ankavsa777"

    let finalUrl = url + '/workspaces/' + workspace + '/datastores/' + datastore + '/featuretypes.json' + "?list="

    request.get(finalUrl + "all", {
        "Accept": "application/json",
        "content-type": "application/json",
        'auth': {
            'user': username,
            'pass': password,
            'sendImmediately': false
        }
    }, (err, res, body) => {
        fullList = JSON.parse(body)
        request.get(finalUrl + "available", {
            "Accept": "application/json",
            "content-type": "application/json",
            'auth': {
                'user': username,
                'pass': password,
                'sendImmediately': false
            }
        }, (err, res, body) => {
            publishedList = JSON.parse(body)
            getList(fullList, publishedList)
        })
    })
}

function getList(res1, res2) {
    let fullList = [];
    let publishedList = [];

    publishedList = res2.list.string

    if (res1.list != undefined) {
        fullList = res1.list.string
    } else {
        for (let i = 0; i < res1.featureTypes.featureType.length; i++) {
            fullList.push(res1.featureTypes.featureType[i].name)
        }
        fullList = fullList.concat(publishedList)
        fullList.sort()
    }

    publishedList = res2.list.string

    for (let i = 0; i < fullList.length; i++) {

        let table = document.getElementById('myTable')

        let row = table.insertRow(i + 1)

        let cell0 = row.insertCell(0)
        let cell1 = row.insertCell(1)
        let cell2 = row.insertCell(2)

        let cell1String

        if (fullList[i].name != undefined) {
            cell1String = fullList[i].name
        } else {
            cell1String = fullList[i]
        }

        cell1.innerHTML = '<p id="layer' + i.toString() + '">' + cell1String + '</p>'

        if (publishedList.includes(cell1String)) {
            cell0.innerHTML = '<label id="label' + i.toString() + '" class="switch"><input type="checkbox" onchange="onChangeToggle(' + i + ',this)"><span class="slider round"></span></label>'
            cell2.innerHTML = '<button id="button' + i.toString() + '" class="btn" onclick="onclickPublish(' + i + ')">PUBLISH</button>'
        } else {
            cell2.innerHTML = '<p style="text-align: center;">PUBLISHED</p>'
        }
    }

    document.getElementsByClassName('table-div')[0].style.visibility = 'visible'
}

function onclickPublishSelected() {
    for (let i = 0; i < publisingLayers.length; i++) {
        onclickPublish(publisingLayers[i])
    }
    publisingLayers = []
}

function onclickPublish(layerNumber) {

    let layerName = document.getElementById("layer" + layerNumber.toString()).innerText
    let button = document.getElementById("button" + layerNumber.toString())
    let label = document.getElementById("label" + layerNumber.toString())

    let isChecked = document.getElementById('isBBOXMaxCheckbox').checked
    let body
    if (isChecked) {
        body = '<featureType><name>' + layerName + '</name></featureType>'
    } else {
        body = `<featureType><name>${layerName}</name>
                    <nativeBoundingBox>
                    <minx>-180</minx>
                    <maxx>180</maxx>
                    <miny>-90</miny>
                    <maxy>90</maxy>
                    <crs>EPSG:4326</crs>
                    </nativeBoundingBox>
                    <latLonBoundingBox>
                        <minx>-180</minx>
                        <maxx>180</maxx>
                        <miny>-90</miny>
                        <maxy>90</maxy>
                        <crs>EPSG:4326</crs>
                    </latLonBoundingBox>
                </featureType>`
    }
    request.post(url + '/workspaces/' + workspace + '/datastores/' + datastore + '/featuretypes', {
        method: 'POST',
        headers: {
            'Content-type': 'text/xml',
            'Authorization': "Basic " + new Buffer(username + ":" + password).toString("base64")
        },
        body: body,
    }, (err, res, body) => {
        if (err) {
            alert(err)
        } else if (body === '') {
            alert("Layer Published !!!!!")
            let publishedP = document.createElement('p')
            publishedP.style = 'text-align : center'
            publishedP.innerText = 'PUBLISHED'
            if (button)
                button.parentNode.replaceChild(publishedP, button);
            label.style.display = "none"
        } else {
            alert(body)
        }
    })
}

function searchTable() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}